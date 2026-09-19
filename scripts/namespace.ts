/**
 * The SDK namespace of an operation is the first segment of its URL path in camelCase:
 * `/vedic-astrology/birth-chart` -> `vedicAstrology`, `/crystals/{id}` -> `crystals`.
 * The generator, the docs sync and the tests all derive it here, so a new package in the
 * spec needs no configuration anywhere in this repo.
 */
export function pathNamespace(path: string): string {
	const segment = path.split('/').filter(Boolean)[0];
	if (!segment)
		throw new Error(`SDK: cannot derive a namespace from path "${path}"`);
	return segment.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());
}
