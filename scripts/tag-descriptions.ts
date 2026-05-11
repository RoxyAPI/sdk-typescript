/**
 * Generator config for tag handling. The OpenAPI spec is the source of truth
 * for everything *per tag* (existence, endpoints, descriptions) — this file
 * only configures how tag names are mapped to public SDK namespaces.
 *
 * Two cases:
 *   1. Most tags derive their namespace automatically via camelCase: e.g.
 *      "Vedic Astrology" -> vedicAstrology, "Numerology" -> numerology,
 *      "Languages" -> languages. New tags need NO change here.
 *   2. A handful of tags use a curated short-form for branding — the public
 *      SDK exposes `roxy.astrology`, not `roxy.westernAstrology`. Those
 *      overrides live in NAMESPACE_ALIASES below.
 *
 * Adding a brand-new tag with a non-default short-form (e.g. "Crystals and
 * Healing Stones" -> `crystals`) is the only reason to touch this file.
 * Otherwise codegen handles it.
 */

export type OpenApiTag = {
	name: string;
	description?: string;
	[key: string]: unknown;
};

export const NAMESPACE_ALIASES: Record<string, string> = {
	'Western Astrology': 'astrology',
	'Crystals and Healing Stones': 'crystals',
	'Location and Timezone': 'location',
	'I-Ching': 'iching',
};

function camelize(name: string): string {
	const parts = String(name)
		.split(/[^a-zA-Z0-9]+/)
		.filter(Boolean);
	if (parts.length === 0) return String(name).toLowerCase();
	return (
		parts[0].toLowerCase() +
		parts
			.slice(1)
			.map((p) => p[0].toUpperCase() + p.slice(1).toLowerCase())
			.join('')
	);
}

export function tagToNamespace(name: string): string {
	return NAMESPACE_ALIASES[name] ?? camelize(name);
}

/**
 * Pull a short, dev-facing summary from the spec's tag.description.
 * Strategy: take everything before the first "." followed by whitespace, cap
 * at 120 chars. The spec's tag descriptions are marketing-leaning, so this is
 * a best-effort extraction. When the server adds `x-sdk-summary` per tag,
 * prefer it here.
 */
export function tagSummary(tag: OpenApiTag): string {
	const ext = tag['x-sdk-summary'];
	if (typeof ext === 'string' && ext.trim().length > 0) return ext.trim();
	const desc = (tag.description ?? '').trim();
	if (!desc) return tag.name ?? '';
	const firstSentence = desc.split(/\.\s+/, 1)[0].trim();
	const flat = firstSentence.replace(/\s+/g, ' ');
	return flat.length > 120 ? `${flat.slice(0, 117).trim()}...` : flat;
}
