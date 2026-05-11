#!/usr/bin/env bun
/**
 * Regenerate the domain tables in README.md and AGENTS.md from
 * `specs/openapi.json`. Also verifies every spec tag is mentioned
 * somewhere in `docs/llms-full.txt`.
 *
 * Run with: bun run docs:sync
 *
 * Fails loudly if:
 *   - An entry in NAMESPACE_ALIASES refers to a tag that no longer exists
 *     in the spec (stale curated short-form).
 *   - A tag's derived namespace is missing from `docs/llms-full.txt`.
 *   - README.md or AGENTS.md is missing the `<!-- BEGIN:DOMAINS -->` markers.
 *
 * New tags need no change here: the namespace is derived via camelCase and
 * the summary is pulled from the spec's `tag.description`.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import {
	NAMESPACE_ALIASES,
	type OpenApiTag,
	tagSummary,
	tagToNamespace,
} from './tag-descriptions';

type OpenApiSpec = {
	tags?: OpenApiTag[];
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

const specTagObjects = spec.tags ?? [];
const specTags = specTagObjects.map((t) => t.name);
if (specTags.length === 0)
	fail(`${SPEC_PATH} has no .tags[] — spec is malformed?`);

const tagByName = new Map(specTagObjects.map((t) => [t.name, t]));

const staleAliases = Object.keys(NAMESPACE_ALIASES).filter(
	(t) => !specTags.includes(t),
);
if (staleAliases.length > 0) {
	fail(
		`Stale namespace alias(es) in scripts/tag-descriptions.ts (tag not in spec): ${staleAliases.map((t) => `"${t}"`).join(', ')}. Remove them.`,
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
	const ns = `roxy.${tagToNamespace(t)}`;
	return !llms.includes(ns);
});
if (missingInLlms.length > 0) {
	fail(
		`Tag(s) missing from ${LLMS_PATH}: ${missingInLlms.map((t) => `"${t}"`).join(', ')}. Add a section for each before releasing.`,
	);
}

function renderTable(): string {
	const rows = specTags.map((tag) => {
		const ns = `roxy.${tagToNamespace(tag)}`;
		const count = endpointCounts.get(tag) ?? 0;
		const summary = tagSummary(tagByName.get(tag) ?? { name: tag });
		return `| \`${ns}\` | ${count} | ${summary} |`;
	});
	return [
		BEGIN,
		'| Namespace | Endpoints | What it covers |',
		'|-----------|-----------|----------------|',
		...rows,
		END,
	].join('\n');
}

function syncFile(path: string): boolean {
	const src = readFileSync(path, 'utf-8');
	const beginIdx = src.indexOf(BEGIN);
	const endIdx = src.indexOf(END);
	if (beginIdx === -1 || endIdx === -1 || endIdx < beginIdx) {
		fail(`${path} is missing ${BEGIN} / ${END} markers`);
	}
	const before = src.slice(0, beginIdx);
	const after = src.slice(endIdx + END.length);
	const next = `${before}${renderTable()}${after}`;
	if (next === src) return false;
	writeFileSync(path, next);
	return true;
}

const readmeChanged = syncFile(README_PATH);
const agentsChanged = syncFile(AGENTS_PATH);

const totalEndpoints = [...endpointCounts.values()].reduce((a, b) => a + b, 0);
console.log(
	`✓ sync-docs: ${specTags.length} tags, ${totalEndpoints} endpoints. ` +
		`README ${readmeChanged ? 'updated' : 'unchanged'}, ` +
		`AGENTS ${agentsChanged ? 'updated' : 'unchanged'}.`,
);
