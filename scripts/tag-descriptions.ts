/**
 * Hand-written tag → namespace/description map used by `scripts/sync-docs.ts`
 * to regenerate the domain tables in README.md and AGENTS.md.
 *
 * Keys are OpenAPI `info.tags[].name` values as they appear in
 * `specs/openapi.json`. When a new tag lands in the spec that isn't
 * in this file, sync-docs.ts fails loudly — add the entry here before
 * the release can proceed.
 *
 * `namespace` must match the camelCased accessor on the generated `Roxy`
 * class in `src/sdk.gen.ts` (e.g. `roxy.vedicAstrology`).
 */

export type TagEntry = {
	namespace: string;
	readmeDescription: string;
	agentDescription: string;
};

export const tagDescriptions: Record<string, TagEntry> = {
	'Western Astrology': {
		namespace: 'roxy.astrology',
		readmeDescription:
			'Western astrology: natal charts, horoscopes, synastry, moon phases',
		agentDescription:
			'Western astrology: natal charts, horoscopes, synastry, moon phases, transits, compatibility',
	},
	'Vedic Astrology': {
		namespace: 'roxy.vedicAstrology',
		readmeDescription:
			'Vedic/Jyotish: birth charts, dashas, nakshatras, panchang, KP system',
		agentDescription:
			'Vedic/Jyotish: birth charts, dashas, nakshatras, panchang, KP system, doshas, yogas',
	},
	Tarot: {
		namespace: 'roxy.tarot',
		readmeDescription:
			'78-card readings: spreads, daily pulls, yes/no, Celtic Cross',
		agentDescription:
			'Rider-Waite-Smith deck: spreads, daily pulls, yes/no, Celtic Cross, custom layouts',
	},
	Numerology: {
		namespace: 'roxy.numerology',
		readmeDescription:
			'Life path, expression, soul urge, personal year, karmic lessons',
		agentDescription:
			'Life path, expression, soul urge, personal year, karmic analysis, compatibility',
	},
	Dreams: {
		namespace: 'roxy.dreams',
		readmeDescription: 'Dream symbol dictionary: 3,000+ interpretations',
		agentDescription: 'Dream symbol dictionary and interpretations',
	},
	'Angel Numbers': {
		namespace: 'roxy.angelNumbers',
		readmeDescription: 'Angel number lookup, pattern analysis, daily guidance',
		agentDescription: 'Angel number meanings, pattern analysis, daily guidance',
	},
	'I-Ching': {
		namespace: 'roxy.iching',
		readmeDescription: 'I Ching hexagrams, trigrams, daily readings',
		agentDescription:
			'I Ching: hexagrams, trigrams, coin casting, daily readings',
	},
	'Crystals and Healing Stones': {
		namespace: 'roxy.crystals',
		readmeDescription:
			'Crystal meanings, healing properties, zodiac and chakra pairings',
		agentDescription:
			'Crystal healing properties, zodiac/chakra pairings, birthstones, search',
	},
	Biorhythm: {
		namespace: 'roxy.biorhythm',
		readmeDescription:
			'10-cycle biorhythm readings, forecasts, critical days, compatibility',
		agentDescription:
			'10-cycle biorhythm readings, forecasts, critical days, compatibility, daily check-ins (wellness, dating, productivity)',
	},
	'Location and Timezone': {
		namespace: 'roxy.location',
		readmeDescription: 'City and country search for birth chart coordinates',
		agentDescription: 'City geocoding for birth chart coordinates',
	},
	Usage: {
		namespace: 'roxy.usage',
		readmeDescription: 'API usage stats, rate limits, subscription info',
		agentDescription: 'API usage stats and subscription info',
	},
};
