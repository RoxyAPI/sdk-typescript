#!/usr/bin/env bun
/**
 * Fetch the latest OpenAPI spec from RoxyAPI and regenerate the SDK.
 * Run with: bun run generate
 */
import { execSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';

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

console.log('Fetching OpenAPI spec from', SPEC_URL);
const spec = JSON.parse(await fetchSpec(SPEC_URL));

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
console.log('SDK generated successfully.');

console.log('Syncing README.md and AGENTS.md from spec...');
execSync('bun run scripts/sync-docs.ts', { stdio: 'inherit' });
