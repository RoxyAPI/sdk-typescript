#!/usr/bin/env bun
/**
 * Regenerate the domain tables in README.md and AGENTS.md from
 * `specs/openapi.json`. Also verifies every spec tag is mentioned
 * somewhere in `docs/llms-full.txt`.
 *
 * Run with: bun run docs:sync
 *
 * Fails loudly if:
 *   - A new OpenAPI tag lands that has no entry in `scripts/tag-descriptions.ts`.
 *   - An entry in `scripts/tag-descriptions.ts` refers to a tag that no
 *     longer exists in the spec.
 *   - A tag is missing a section in `docs/llms-full.txt`.
 *   - README.md or AGENTS.md is missing the `<!-- BEGIN:DOMAINS -->` markers.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { tagDescriptions } from './tag-descriptions';

type OpenApiSpec = {
	tags?: Array<{ name: string }>;
	paths?: Record<string, Record<string, { tags?: string[] }>>;
};

const SPEC_PATH = 'specs/openapi.json';
const LLMS_PATH = 'docs/llms-full.txt';
const README_PATH = 'README.md';
const AGENTS_PATH = 'AGENTS.md';
const BEGIN = '<!-- BEGIN:DOMAINS -->';
const END = '<!-- END:DOMAINS -->';

function fail(msg: string): never {
	console.error(`\n✗ sync-docs: ${msg}\n`);
	process.exit(1);
}

const spec = JSON.parse(readFileSync(SPEC_PATH, 'utf-8')) as OpenApiSpec;

const specTags = (spec.tags ?? []).map((t) => t.name);
if (specTags.length === 0)
	fail(`${SPEC_PATH} has no .tags[] — spec is malformed?`);

const unknown = specTags.filter((t) => !(t in tagDescriptions));
if (unknown.length > 0) {
	fail(
		`Unknown tag(s) in spec: ${unknown.map((t) => `"${t}"`).join(', ')}. Add entries to scripts/tag-descriptions.ts before releasing.`,
	);
}

const stale = Object.keys(tagDescriptions).filter((t) => !specTags.includes(t));
if (stale.length > 0) {
	fail(
		`Stale tag(s) in scripts/tag-descriptions.ts (not in spec): ${stale.map((t) => `"${t}"`).join(', ')}. Remove them.`,
	);
}

const endpointCounts = new Map<string, number>();
for (const methods of Object.values(spec.paths ?? {})) {
	for (const op of Object.values(methods)) {
		const tag = op.tags?.[0];
		if (tag) endpointCounts.set(tag, (endpointCounts.get(tag) ?? 0) + 1);
	}
}

const llms = readFileSync(LLMS_PATH, 'utf-8');
const missingInLlms = specTags.filter((t) => {
	const entry = tagDescriptions[t];
	return entry && !llms.includes(entry.namespace);
});
if (missingInLlms.length > 0) {
	fail(
		`Tag(s) missing from ${LLMS_PATH}: ${missingInLlms.map((t) => `"${t}"`).join(', ')}. Add a section for each before releasing.`,
	);
}

function renderTable(kind: 'readme' | 'agent'): string {
	const rows = specTags.map((tag) => {
		const entry = tagDescriptions[tag];
		if (!entry) throw new Error(`unreachable: tag ${tag} missing after check`);
		const count = endpointCounts.get(tag) ?? 0;
		const desc =
			kind === 'readme' ? entry.readmeDescription : entry.agentDescription;
		return `| \`${entry.namespace}\` | ${count} | ${desc} |`;
	});
	return [
		BEGIN,
		'| Namespace | Endpoints | What it covers |',
		'|-----------|-----------|----------------|',
		...rows,
		END,
	].join('\n');
}

function syncFile(path: string, kind: 'readme' | 'agent'): boolean {
	const src = readFileSync(path, 'utf-8');
	const beginIdx = src.indexOf(BEGIN);
	const endIdx = src.indexOf(END);
	if (beginIdx === -1 || endIdx === -1 || endIdx < beginIdx) {
		fail(`${path} is missing ${BEGIN} / ${END} markers`);
	}
	const before = src.slice(0, beginIdx);
	const after = src.slice(endIdx + END.length);
	const next = `${before}${renderTable(kind)}${after}`;
	if (next === src) return false;
	writeFileSync(path, next);
	return true;
}

const readmeChanged = syncFile(README_PATH, 'readme');
const agentsChanged = syncFile(AGENTS_PATH, 'agent');

const totalEndpoints = [...endpointCounts.values()].reduce((a, b) => a + b, 0);
console.log(
	`✓ sync-docs: ${specTags.length} tags, ${totalEndpoints} endpoints. ` +
		`README ${readmeChanged ? 'updated' : 'unchanged'}, ` +
		`AGENTS ${agentsChanged ? 'updated' : 'unchanged'}.`,
);
