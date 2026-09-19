/**
 * The one-line summary of a spec tag, for the domain tables and the method reference.
 * Everything else about a tag (its namespace, its operations) is derived from the paths
 * in `sync-docs.ts`; this file only shortens `tag.description`.
 */

export type OpenApiTag = {
	name: string;
	description?: string;
};

/** The first sentence of the tag description, capped at 120 characters. */
export function tagSummary(tag: OpenApiTag): string {
	const desc = (tag.description ?? '').trim();
	if (!desc) return tag.name;
	const firstSentence = desc.split(/\.\s+/, 1)[0].trim().replace(/\s+/g, ' ');
	return firstSentence.length > 120
		? `${firstSentence.slice(0, 117).trim()}...`
		: firstSentence;
}
