#!/usr/bin/env bun
/**
 * Fetch the latest OpenAPI spec from RoxyAPI and regenerate the SDK.
 * Run with: bun run generate
 */
import { execSync } from 'node:child_process';
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const SPEC_URL = 'https://roxyapi.com/api/v2/openapi.json';
const SPEC_PATH = 'specs/openapi.json';

/** Retry with exponential backoff: a transient upstream error (e.g. a CDN 520) must not fail the daily release run. */
async function fetchSpec(url: string, attempts = 5): Promise<string> {
	for (let attempt = 1; ; attempt++) {
		try {
			const res = await fetch(url, {
				headers: { 'Cache-Control': 'no-cache' },
			});
			if (!res.ok)
				throw new Error(`Fetch failed: ${res.status} ${res.statusText}`);
			return await res.text();
		} catch (err) {
			if (attempt === attempts) throw err;
			const delay = 2 ** attempt;
			console.warn(
				`Attempt ${attempt}/${attempts} failed (${err instanceof Error ? err.message : err}), retrying in ${delay}s`,
			);
			await new Promise((resolve) => setTimeout(resolve, delay * 1000));
		}
	}
}

/**
 * Load the spec from disk when `ROXYAPI_SPEC_FILE` is set, from the API otherwise.
 *
 * @remarks
 * Reading from a file keeps generation offline and byte-reproducible, which is what the codegen
 * drift check in CI relies on.
 */
async function loadSpec(): Promise<string> {
	const file = process.env.ROXYAPI_SPEC_FILE;
	if (file) {
		console.log(
			'Reading OpenAPI spec from',
			file,
			'(offline, ROXYAPI_SPEC_FILE)',
		);
		return readFileSync(file, 'utf8');
	}
	console.log('Fetching OpenAPI spec from', SPEC_URL);
	return fetchSpec(SPEC_URL);
}

/**
 * Sort the leading import block of every generated file by module specifier in code-unit order.
 *
 * @remarks
 * hey-api orders imports with `localeCompare`, and for `./client.gen.js` against `./client/index.js`
 * Bun 1.3.14 and Bun 1.4.2 disagree (the same statement lands on either side of the other), so the
 * committed output depended on which Bun ran the generator and the hermetic drift check went red on
 * CI for a tree that was correct locally. A code-unit sort is the same on every runtime.
 */
function sortImportBlocks(dir: string): void {
	for (const entry of readdirSync(dir, { withFileTypes: true })) {
		const path = join(dir, entry.name);
		if (entry.isDirectory()) {
			sortImportBlocks(path);
			continue;
		}
		if (!entry.name.endsWith('.gen.ts')) continue;
		const src = readFileSync(path, 'utf8');
		const block = /(?:^import\b[^;]*;\n)+/m.exec(src);
		if (!block) continue;
		const statements = block[0].split(/(?<=;\n)/).filter(Boolean);
		const key = (stmt: string) =>
			`${/from '([^']+)'/.exec(stmt)?.[1] ?? ''}\u0000${stmt}`;
		const sorted = statements
			.map((stmt, index) => ({ stmt, index }))
			.sort((a, b) =>
				key(a.stmt) < key(b.stmt)
					? -1
					: key(a.stmt) > key(b.stmt)
						? 1
						: a.index - b.index,
			)
			.map(({ stmt }) => stmt)
			.join('');
		if (sorted !== block[0])
			writeFileSync(
				path,
				src.slice(0, block.index) +
					sorted +
					src.slice(block.index + block[0].length),
			);
	}
}

const spec = JSON.parse(await loadSpec());

// Patch server URL to absolute production URL so the generated default client
// works out of the box without users specifying baseUrl
if (spec.servers?.[0]?.url === '/api/v2') {
	spec.servers[0].url = 'https://roxyapi.com/api/v2';
}

mkdirSync('specs', { recursive: true });
writeFileSync(SPEC_PATH, JSON.stringify(spec, null, 2));
console.log('Spec saved to', SPEC_PATH);

console.log('Running hey-api generator...');
execSync('bunx openapi-ts', { stdio: 'inherit' });
sortImportBlocks('src');
console.log('SDK generated successfully.');

console.log('Syncing README.md and AGENTS.md from spec...');
execSync('bun run scripts/sync-docs.ts', { stdio: 'inherit' });
