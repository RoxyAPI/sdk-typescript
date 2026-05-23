#!/usr/bin/env bun
/**
 * Regenerate the spec-derived docs from `specs/openapi.json`:
 *   - The domain tables in README.md and AGENTS.md (`<!-- BEGIN:DOMAINS -->` markers).
 *   - The per-domain method reference in `docs/llms-full.txt` (`<!-- BEGIN:METHODS -->` markers):
 *     one section per tag, every method call generated from its operationId and a request
 *     example built from the spec's own `example` fields. The curated intro (above the marker)
 *     and the Error Handling / Advanced / Links tail (below it) are preserved.
 *
 * Run with: bun run docs:sync
 *
 * The OpenAPI spec is the single source of truth. Adding a new API domain requires NO manual
 * doc edit: the namespace is derived via camelCase (see tag-descriptions.ts) and a method
 * section is generated here. Fails loudly only if:
 *   - An entry in NAMESPACE_ALIASES refers to a tag that no longer exists in the spec.
 *   - README.md / AGENTS.md / docs/llms-full.txt is missing its BEGIN/END markers.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import {
	NAMESPACE_ALIASES,
	type OpenApiTag,
	tagSummary,
	tagToNamespace,
} from './tag-descriptions';

type Json = string | number | boolean | null | Json[] | { [k: string]: Json };

type Schema = {
	$ref?: string;
	type?: string;
	properties?: Record<string, Schema>;
	required?: string[];
	items?: Schema;
	enum?: unknown[];
	example?: unknown;
	allOf?: Schema[];
	oneOf?: Schema[];
	anyOf?: Schema[];
};

type Param = {
	name: string;
	in: string;
	required?: boolean;
	example?: unknown;
	schema?: Schema;
};

type Operation = {
	operationId?: string;
	summary?: string;
	tags?: string[];
	parameters?: Param[];
	requestBody?: { content?: Record<string, { schema?: Schema }> };
};

type OpenApiSpec = {
	tags?: OpenApiTag[];
	paths?: Record<string, Record<string, Operation>>;
	components?: { schemas?: Record<string, Schema> };
};

const SPEC_PATH = 'specs/openapi.json';
const LLMS_PATH = 'docs/llms-full.txt';
const README_PATH = 'README.md';
const AGENTS_PATH = 'AGENTS.md';
const DOMAINS_BEGIN = '<!-- BEGIN:DOMAINS -->';
const DOMAINS_END = '<!-- END:DOMAINS -->';
const METHODS_BEGIN = '<!-- BEGIN:METHODS -->';
const METHODS_END = '<!-- END:METHODS -->';
const LANGS_BEGIN = '<!-- BEGIN:LANGS -->';
const LANGS_END = '<!-- END:LANGS -->';

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

/** Operations bucketed by their first tag, walked once and shared by every renderer. */
const opsByTag = new Map<
	string,
	{ path: string; verb: string; op: Operation }[]
>();
for (const [path, methods] of Object.entries(spec.paths ?? {})) {
	for (const [verb, op] of Object.entries(methods)) {
		const tag = op.tags?.[0];
		if (!tag) continue;
		if (!opsByTag.has(tag)) opsByTag.set(tag, []);
		opsByTag.get(tag)?.push({ path, verb, op });
	}
}

// ─── Spec walking ────────────────────────────────────────────────────────────

function resolveRef(ref: string): Schema {
	const node = ref
		.replace(/^#\//, '')
		.split('/')
		.reduce<unknown>(
			(acc, key) => (acc as Record<string, unknown>)?.[key],
			spec,
		);
	return (node ?? {}) as Schema;
}

/** Carry an outer node's `example` onto a resolved inner schema. The inner branch of a $ref / oneOf / anyOf rarely repeats the example that sits on the wrapper (e.g. a `timezone` declared `anyOf: [number, string]` with `example: 5.5`), so without this the example is lost and buildExample would invent a placeholder. */
function keepExample(outer: Schema, inner: Schema): Schema {
	return outer.example !== undefined && inner.example === undefined
		? { ...inner, example: outer.example }
		: inner;
}

/** Merge allOf and resolve a top-level $ref / oneOf / anyOf so callers see a plain object schema, preserving any wrapper-level example. */
function deref(schema: Schema, depth = 0): Schema {
	if (depth > 6 || !schema) return schema ?? {};
	if (schema.$ref)
		return keepExample(schema, deref(resolveRef(schema.$ref), depth + 1));
	if (schema.allOf) {
		const merged: Schema = { type: 'object', properties: {}, required: [] };
		for (const part of schema.allOf) {
			const d = deref(part, depth + 1);
			Object.assign(merged.properties as object, d.properties ?? {});
			(merged.required as string[]).push(...(d.required ?? []));
		}
		return keepExample(schema, merged);
	}
	if (schema.oneOf?.[0])
		return keepExample(schema, deref(schema.oneOf[0], depth + 1));
	if (schema.anyOf?.[0])
		return keepExample(schema, deref(schema.anyOf[0], depth + 1));
	return schema;
}

function toJson(value: unknown): Json {
	if (value === null) return null;
	if (Array.isArray(value)) return value.map(toJson);
	if (typeof value === 'object')
		return Object.fromEntries(
			Object.entries(value as Record<string, unknown>).map(([k, v]) => [
				k,
				toJson(v),
			]),
		);
	if (typeof value === 'number' || typeof value === 'boolean') return value;
	return String(value);
}

function scalarDefault(type?: string): Json {
	if (type === 'number' || type === 'integer') return 0;
	if (type === 'boolean') return false;
	if (type === 'array') return [];
	return 'string';
}

/** Build a representative example value from a schema, preferring the spec's own `example`. */
function buildExample(schemaIn: Schema, depth = 0): Json | undefined {
	const schema = deref(schemaIn);
	if (schema.example !== undefined) return toJson(schema.example);
	if (depth > 4) return undefined;
	if (schema.properties) {
		const required = new Set(schema.required ?? []);
		const obj: Record<string, Json> = {};
		for (const [name, propIn] of Object.entries(schema.properties)) {
			const prop = deref(propIn);
			const hasExample = prop.example !== undefined;
			if (!required.has(name) && !hasExample) continue;
			const val = buildExample(prop, depth + 1);
			if (val !== undefined) obj[name] = val;
		}
		return obj;
	}
	if (schema.enum?.length) return toJson(schema.enum[0]);
	if (schema.type === 'array' && schema.items) {
		const item = buildExample(schema.items, depth + 1);
		return item === undefined ? [] : [item];
	}
	return scalarDefault(schema.type);
}

/** Spec-provided example for a param (param-level or schema-level), or undefined when the spec gives none. */
function paramExample(p: Param): Json | undefined {
	if (p.example !== undefined) return toJson(p.example);
	const s = deref(p.schema ?? {});
	if (s.example !== undefined) return toJson(s.example);
	if (s.enum?.length) return toJson(s.enum[0]);
	return undefined;
}

/** Render value for a param: its spec example, else a typed placeholder (path params always need a value). */
function paramValue(p: Param): Json {
	return paramExample(p) ?? scalarDefault(deref(p.schema ?? {}).type);
}

// ─── TypeScript literal rendering ────────────────────────────────────────────

const IND = '  ';
const IDENT = /^[A-Za-z_$][A-Za-z0-9_$]*$/;

function lit(value: Json, depth: number): string {
	const pad = IND.repeat(depth);
	const padIn = IND.repeat(depth + 1);
	if (typeof value === 'string')
		return `'${value
			.replace(/\\/g, '\\\\')
			.replace(/'/g, "\\'")
			.replace(/\n/g, '\\n')
			.replace(/\r/g, '\\r')
			.replace(/\t/g, '\\t')}'`;
	if (typeof value === 'number' || typeof value === 'boolean' || value === null)
		return String(value);
	if (Array.isArray(value)) {
		if (value.length === 0) return '[]';
		const inline = `[${value.map((v) => lit(v, depth)).join(', ')}]`;
		if (!inline.includes('\n') && inline.length <= 60) return inline;
		return `[\n${value.map((v) => `${padIn}${lit(v, depth + 1)}`).join(',\n')},\n${pad}]`;
	}
	const keys = Object.keys(value);
	if (keys.length === 0) return '{}';
	const key = (k: string) => (IDENT.test(k) ? k : `'${k}'`);
	const inline = `{ ${keys.map((k) => `${key(k)}: ${lit(value[k] as Json, depth)}`).join(', ')} }`;
	if (!inline.includes('\n') && inline.length <= 60) return inline;
	return `{\n${keys.map((k) => `${padIn}${key(k)}: ${lit(value[k] as Json, depth + 1)}`).join(',\n')},\n${pad}}`;
}

function pascal(s: string): string {
	return s
		.split(/[^a-zA-Z0-9]+/)
		.filter(Boolean)
		.map((p) => p[0].toUpperCase() + p.slice(1))
		.join('');
}

function renderCall(
	ns: string,
	path: string,
	verb: string,
	op: Operation,
): string {
	const method =
		op.operationId ??
		`${verb}${pascal(path.split('/').filter(Boolean).pop() ?? '')}`;
	const params = op.parameters ?? [];
	const pathParams = params.filter((p) => p.in === 'path');
	// `lang` is documented once in the curated intro, not repeated per method. Other query params are shown when the spec provides an example (or they are required).
	const queryParams = params.filter(
		(p) =>
			p.in === 'query' &&
			p.name !== 'lang' &&
			(p.required || paramExample(p) !== undefined),
	);
	const bodySchema = op.requestBody?.content?.['application/json']?.schema;

	const args: Record<string, Json> = {};
	if (pathParams.length)
		args.path = Object.fromEntries(
			pathParams.map((p) => [p.name, paramValue(p)]),
		);
	if (queryParams.length)
		args.query = Object.fromEntries(
			queryParams.map((p) => [p.name, paramValue(p)]),
		);
	if (bodySchema) {
		const body = buildExample(bodySchema);
		if (
			body &&
			typeof body === 'object' &&
			!Array.isArray(body) &&
			Object.keys(body).length
		)
			args.body = body;
	}

	const comment = op.summary ? `// ${op.summary}\n` : '';
	const call =
		Object.keys(args).length === 0
			? `const { data } = await ${ns}.${method}();`
			: `const { data } = await ${ns}.${method}(${lit(args, 0)});`;
	return `${comment}${call}`;
}

function renderMethodSections(): string {
	const sections = specTags.map((tag) => {
		const ns = `roxy.${tagToNamespace(tag)}`;
		const summary = tagSummary(tagByName.get(tag) ?? { name: tag });
		const calls = (opsByTag.get(tag) ?? [])
			.map(({ path, verb, op }) => renderCall(ns, path, verb, op))
			.join('\n\n');
		return `## ${tag} — \`${ns}\`\n\n${summary}\n\n\`\`\`typescript\n${calls}\n\`\`\``;
	});
	return `${METHODS_BEGIN}\n\n${sections.join('\n\n---\n\n')}\n\n${METHODS_END}`;
}

/** Generate the multi-language note from the spec: the available `lang` codes and which domains expose a `lang` query param. Keeps the curated intro from drifting when a domain or language is added. */
function langNote(): string {
	const supportsLang = new Set<string>();
	let langs: string[] = [];
	for (const [tag, ops] of opsByTag) {
		for (const { op } of ops) {
			const lp = (op.parameters ?? []).find(
				(p) => p.name === 'lang' && p.in === 'query',
			);
			if (!lp) continue;
			supportsLang.add(tag);
			if (langs.length === 0) {
				const e = deref(lp.schema ?? {}).enum;
				if (e?.length) langs = e.map(String);
			}
		}
	}
	const list = (tags: string[]) => tags.map(tagToNamespace).join(', ');
	const supported = list(specTags.filter((t) => supportsLang.has(t)));
	const englishOnly = list(specTags.filter((t) => !supportsLang.has(t)));
	const langList = langs.map((l) => `\`${l}\``).join(', ');
	return `${LANGS_BEGIN}\n**Multi-language responses.** Interpretations are available in ${langs.length} languages: ${langList}. Pass \`query: { lang }\` on any supported endpoint. Supported: ${supported}. English-only: ${englishOnly}. Languages without translations yet fall back to English.\n${LANGS_END}`;
}

// ─── Marker replacement ──────────────────────────────────────────────────────

function renderDomainsTable(): string {
	const rows = specTags.map((tag) => {
		const ns = `roxy.${tagToNamespace(tag)}`;
		const count = opsByTag.get(tag)?.length ?? 0;
		const summary = tagSummary(tagByName.get(tag) ?? { name: tag });
		return `| \`${ns}\` | ${count} | ${summary} |`;
	});
	return [
		DOMAINS_BEGIN,
		'| Namespace | Endpoints | What it covers |',
		'|-----------|-----------|----------------|',
		...rows,
		DOMAINS_END,
	].join('\n');
}

function replaceRegion(
	path: string,
	begin: string,
	end: string,
	block: string,
): boolean {
	const src = readFileSync(path, 'utf-8');
	const beginIdx = src.indexOf(begin);
	const endIdx = src.indexOf(end);
	if (beginIdx === -1 || endIdx === -1 || endIdx < beginIdx) {
		fail(`${path} is missing ${begin} / ${end} markers`);
	}
	const next = src.slice(0, beginIdx) + block + src.slice(endIdx + end.length);
	if (next === src) return false;
	writeFileSync(path, next);
	return true;
}

const table = renderDomainsTable();
const readmeChanged = replaceRegion(
	README_PATH,
	DOMAINS_BEGIN,
	DOMAINS_END,
	table,
);
const agentsChanged = replaceRegion(
	AGENTS_PATH,
	DOMAINS_BEGIN,
	DOMAINS_END,
	table,
);
const llmsMethodsChanged = replaceRegion(
	LLMS_PATH,
	METHODS_BEGIN,
	METHODS_END,
	renderMethodSections(),
);
const llmsLangsChanged = replaceRegion(
	LLMS_PATH,
	LANGS_BEGIN,
	LANGS_END,
	langNote(),
);

const totalEndpoints = [...opsByTag.values()].reduce((a, o) => a + o.length, 0);
console.log(
	`✓ sync-docs: ${specTags.length} tags, ${totalEndpoints} endpoints. ` +
		`README ${readmeChanged ? 'updated' : 'unchanged'}, ` +
		`AGENTS ${agentsChanged ? 'updated' : 'unchanged'}, ` +
		`llms-full ${llmsMethodsChanged || llmsLangsChanged ? 'updated' : 'unchanged'}.`,
);
