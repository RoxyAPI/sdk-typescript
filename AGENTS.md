# @roxyapi/sdk - Agent Guide

TypeScript SDK for RoxyAPI. 18+ domains (Western astrology, Vedic astrology, forecast, human design, Chinese astrology, feng shui, Mesoamerican astrology, Vastu, numerology, Kabbalah, tarot, biorhythm, Ayurveda, I Ching, crystals, dreams, angel numbers, location) plus utility namespaces (usage, languages). One API key, fully typed, zero runtime dependencies.

> Before writing any code with this SDK, read `docs/llms-full.txt` in this package for the complete method reference with examples.

## Install and initialize

```bash
npm install @roxyapi/sdk
```

```typescript
import { createRoxy } from '@roxyapi/sdk';

// Retries 429, 500, 502, 503 and 504 by default. Optional settings, shown with their defaults:
// createRoxy(key, { maxRetries: 2, initialDelayMs: 500, maxDelayMs: 30000 })
const roxy = createRoxy(process.env.ROXY_API_KEY!);
```

`createRoxy` sets the base URL (`https://roxyapi.com/api/v2`) and auth header automatically. Every method returns `{ data, error, response }`.

## Critical rule: geocode before any chart endpoint

Every chart, horoscope, panchang, dasha, dosha, navamsa, KP, synastry, compatibility, and natal endpoint needs `latitude`, `longitude`, and (for Western) `timezone`. **Never ask the user for coordinates.** Always call `roxy.location.searchCities` first.

```typescript
const { data } = await roxy.location.searchCities({ query: { q: 'New York' } });
const { latitude, longitude, timezone } = data.cities[0];
// `timezone` is the IANA string ("America/New_York"). Pass it directly to any chart endpoint.
// The server resolves it to the DST-correct decimal offset using the date of the chart itself,
// so a January 1990 New York chart gets EST (-5) even when you looked the city up in July.
// `utcOffset` is the offset in force today, not on the birth date, so pass the IANA `timezone` string.
```

`q` accepts bare city (`'Paris'`), city + country (`'Berlin Germany'`), or comma-qualified (`'Springfield, Illinois'`). Use the qualified form to disambiguate same-named cities.

## Domains

Type `roxy.` to see all available namespaces. Type `roxy.{domain}.` to see every method in that domain.

<!-- BEGIN:DOMAINS -->
| Namespace | What it covers |
|-----------|----------------|
| [`roxy.astrology`](https://roxyapi.com/api-reference/western-astrology) | Western astrology API for natal birth charts, daily, weekly, monthly, and yearly horoscopes with unique content per s... |
| [`roxy.vedicAstrology`](https://roxyapi.com/api-reference/vedic-astrology) | Vedic astrology (Jyotish) and KP API for kundli generation with the sixteen Shodasavarga divisional charts (D1 to D60... |
| [`roxy.forecast`](https://roxyapi.com/api-reference/forecast) | Astrology forecast API that merges upcoming transit aspects, sign ingresses, retrograde stations, new and full moons,... |
| [`roxy.humanDesign`](https://roxyapi.com/api-reference/human-design) | Human Design API that generates the full bodygraph from a birth moment: type, strategy, inner authority, profile, def... |
| [`roxy.chineseAstrology`](https://roxyapi.com/api-reference/chinese-astrology) | Chinese zodiac and BaZi astrology API: Four Pillars charts, Chinese zodiac signs and the Chinese lunisolar calendar f... |
| [`roxy.fengShui`](https://roxyapi.com/api-reference/feng-shui) | Compute classical feng shui from one API: Xuan Kong flying star natal charts for any of the nine periods and 24 mount... |
| [`roxy.mesoamericanAstrology`](https://roxyapi.com/api-reference/mesoamerican-astrology) | Calculate Mayan astrology day signs, the Tzolkin sacred round, the Haab year, the full Long Count and the Aztec tonal... |
| [`roxy.vastu`](https://roxyapi.com/api-reference/vastu) | Vastu Shastra API for directional home and plot analysis: entrance padas with the classical effect of each of the 32... |
| [`roxy.numerology`](https://roxyapi.com/api-reference/numerology) | Numerology API for life path numbers, complete numerology charts and compatibility, in both Pythagorean and Chaldean... |
| [`roxy.kabbalah`](https://roxyapi.com/api-reference/kabbalah) | Kabbalah API for gematria, the 72 names, the Tree of Life and the Hebrew birthday |
| [`roxy.tarot`](https://roxyapi.com/api-reference/tarot) | Tarot reading API with the complete 78-card Rider-Waite-Smith deck and card meanings for love, career, health, and sp... |
| [`roxy.biorhythm`](https://roxyapi.com/api-reference/biorhythm) | Biorhythm API for entertainment and reflection, with 10 model cycle types across 3 primary (physical, emotional, inte... |
| [`roxy.ayurveda`](https://roxyapi.com/api-reference/ayurveda) | Ayurveda API for dosha profiles, the dinacharya daily routine and the ritucharya seasonal regimen, with a verse cited... |
| [`roxy.iching`](https://roxyapi.com/api-reference/i-ching) | I-Ching oracle API with all 64 hexagrams, 384 changing lines, 8 trigrams, and modern interpretations for love, career... |
| [`roxy.crystals`](https://roxyapi.com/api-reference/crystals-and-healing-stones) | Crystal healing API covering the most popular and widely-searched healing crystals and gemstones, from Amethyst and R... |
| [`roxy.dreams`](https://roxyapi.com/api-reference/dreams) | Dream interpretation API with a 2,200+ symbol dream dictionary and psychological meanings covering animals, objects,... |
| [`roxy.angelNumbers`](https://roxyapi.com/api-reference/angel-numbers) | Angel numbers API with meanings for 111, 222, 333, 444, 555, 666, 777, 888, 999, 1111, and 75+ sequences covering eve... |
| [`roxy.location`](https://roxyapi.com/api-reference/location-and-timezone) | Timezone and location API with city search and geocoding across 5,180,000+ cities, towns and villages in 240+ countri... |
| [`roxy.usage`](https://roxyapi.com/api-reference/usage) | Monitor your API usage, check rate limits, and track request consumption |
| [`roxy.languages`](https://roxyapi.com/api-reference/languages) | List the response languages accepted by the `lang` query parameter on every i18n-aware endpoint |
<!-- END:DOMAINS -->

The table above covers every endpoint across 18+ product domains plus usage and languages, and auto-syncs from `specs/openapi.json` at release time.

## Quality guidelines for agents

The rules to follow when writing any call with this SDK. Get these right and the generated types do the rest.

- **One options object, hey-api wrapped.** Every method takes a single object with `path`, `query`, and `body` keys. Path params go in `path`, query params in `query`, request body in `body`. Never flat named args. Right: `roxy.astrology.getDailyHoroscope({ path: { sign: 'aries' } })`. Wrong: `roxy.astrology.getDailyHoroscope({ sign: 'aries' })`.
- **Always `await`. Always destructure `{ data, error, response }`.** All methods are async. `data` is the typed success response (undefined on error). `error` is the typed API error (`{ error, code, doc_url }`, plus `issues` on a `validation_error`; undefined on success). `response` is the raw `fetch` Response and is optional in the types, so write `response?.status`. Switch on `error.code`, not on `error.error`. The pair is a discriminated union, so `data` is typed as possibly undefined until `error` is checked: write `if (error) throw error;` before reading `data` in a `strict` project, or pass `throwOnError: true` in the call options to have failures throw and `data` typed as always present.
- **Method names match the OpenAPI `operationId` verbatim.** When in doubt, autocomplete `roxy.{domain}.` in your editor or `grep 'public ' node_modules/@roxyapi/sdk/dist/factory.d.ts`. Never invent a method from the URL path or a guess.
- **Response field names come from the response schema of the spec.** Field access is typed dot syntax (`data.cities[0].timezone`). TypeScript will catch any invented field at compile time via the generated types - if `tsc` complains, the field does not exist.
- **Look up any operation or field beyond this guide.** Query the combined OpenAPI spec at `https://roxyapi.com/api/v2/openapi.json` with the jq recipe in `https://roxyapi.com/AGENTS.md`, or search the keyless Docs MCP server at `https://roxyapi.com/mcp/docs` (one tool, `search_docs`).
- **Do not hand-roll requests.** No raw `fetch`, no axios. The SDK injects auth, the base URL and typed responses; it retries 429, 500, 502, 503 and 504 up to twice by default (see Retries; `createRoxy(key, { maxRetries: 0 })` turns that off). Use `createRoxy(key)` for the common case, or `new Roxy({ client })` with `createClient` from `@roxyapi/sdk/client` when you need a custom fetch or interceptors.

## Critical patterns

### Two-step pattern for coordinate-dependent endpoints

```typescript
const { data, error } = await roxy.location.searchCities({ query: { q: 'London' } });
if (error) throw error;
const { latitude, longitude, timezone } = data.cities[0];
const birth = { date: '1990-01-15', time: '14:30:00', latitude, longitude, timezone };

const { data: chart } = await roxy.astrology.generateNatalChart({ body: birth });
```

One lookup feeds every domain. The same `birth` object is the body for `astrology.generateNatalChart`, `vedicAstrology.generateBirthChart`, `vedicAstrology.getCurrentDasha`, `ayurveda.calculateAyurvedicConstitution` and the `birthData` of `forecast.forecastTransits`; the instant alone (`date`, `time`, `timezone`) is the body for `humanDesign.generateBodygraph`, `chineseAstrology.generateBaziChart` and `kabbalah.generateBirthProfile`. Never look the city up twice for one person.

### GET endpoints - use `path` for URL params, `query` for query params

```typescript
await roxy.astrology.getDailyHoroscope({ path: { sign: 'aries' } });
await roxy.crystals.getCrystalsByZodiac({ path: { sign: 'leo' } });
await roxy.crystals.searchCrystals({ query: { q: 'amethyst' } });
```

### POST endpoints - use `body` for request data

Most valuable endpoints (charts, spreads, calculations) are POST:

```typescript
await roxy.astrology.generateNatalChart({
  body: { date: '1990-01-15', time: '14:30:00', latitude, longitude, timezone },
});

await roxy.vedicAstrology.generateBirthChart({
  body: { date: '1990-01-15', time: '14:30:00', latitude, longitude },
});

await roxy.tarot.castCelticCross({ body: { question: 'What should I focus on?' } });

await roxy.numerology.calculateLifePath({ body: { year: 1990, month: 1, day: 15 } });
```

### Multi-language via `query: { lang }`

Ten languages: `en`, `tr`, `de`, `es`, `fr`, `hi`, `pt`, `ru`, `zh-Hans`, `zh-Hant`. Defaults to `en`.

```typescript
await roxy.tarot.getDailyCard({ body: { date: '2026-04-22' }, query: { lang: 'es' } });
await roxy.numerology.calculateLifePath({
  body: { year: 1990, month: 1, day: 15 },
  query: { lang: 'hi' },
});
```

Supported: `astrology`, `vedicAstrology`, `forecast`, `humanDesign`, `chineseAstrology`, `fengShui`, `mesoamericanAstrology`, `vastu`, `numerology`, `kabbalah`, `tarot`, `biorhythm`, `ayurveda`, `iching`, `crystals`, `angelNumbers`, `languages`. English-only: `dreams`, `location`, `usage`. The two Chinese scripts (`zh-Hans`, `zh-Hant`) currently ship on Chinese astrology and feng shui; every other domain answers those codes in English per field. To list supported codes at runtime, call `roxy.languages.listLanguages()`.

## Common tasks

In the catalog order (Western astrology, Vedic astrology, forecast, Human Design, Chinese astrology, feng shui, Mesoamerican astrology, Vastu, numerology, Kabbalah, tarot, biorhythm, Ayurveda, I Ching, crystals, dreams, angel numbers, location, usage, languages). `birth` is `{ date, time, latitude, longitude, timezone }` from the two-step pattern above.

| Task | Code |
|------|------|
| Find city coordinates (do this first) | `roxy.location.searchCities({ query: { q: 'Berlin' } })` |
| Daily horoscope | `roxy.astrology.getDailyHoroscope({ path: { sign } })` |
| Natal chart (Western) | `roxy.astrology.generateNatalChart({ body: birth })` |
| Synastry | `roxy.astrology.calculateSynastry({ body: { person1, person2 } })` |
| Compatibility score | `roxy.astrology.calculateCompatibility({ body: { person1, person2 } })` |
| Current moon phase | `roxy.astrology.getCurrentMoonPhase({})` |
| Transits | `roxy.astrology.calculateTransits({ body: { natalChart } })` |
| Kundli (Vedic birth chart) | `roxy.vedicAstrology.generateBirthChart({ body: birth })` |
| Panchang (detailed) | `roxy.vedicAstrology.getDetailedPanchang({ body: { date, latitude, longitude, timezone } })` |
| Choghadiya | `roxy.vedicAstrology.getChoghadiya({ body: { date, latitude, longitude, timezone } })` |
| Current dasha | `roxy.vedicAstrology.getCurrentDasha({ body: birth })` |
| Mangal Dosha | `roxy.vedicAstrology.checkManglikDosha({ body: birth })` |
| Guna Milan (matching) | `roxy.vedicAstrology.calculateGunMilan({ body: { person1, person2 } })` |
| Navamsa (D9) | `roxy.vedicAstrology.generateNavamsa({ body: birth })` |
| KP chart | `roxy.vedicAstrology.generateKpChart({ body: birth })` |
| KP ruling planets | `roxy.vedicAstrology.getKpRulingPlanets({ body: { latitude, longitude, timezone } })` |
| Nakshatra detail | `roxy.vedicAstrology.getNakshatra({ path: { id: 'ashwini' } })` |
| Transit forecast | `roxy.forecast.forecastTransits({ body: { birthData: birth, startDate, endDate } })` |
| Cross-domain timeline | `roxy.forecast.generateTimeline({ body: { birthData: birth, startDate, endDate } })` |
| Human Design bodygraph | `roxy.humanDesign.generateBodygraph({ body: { date, time, timezone } })` |
| Human Design connection | `roxy.humanDesign.calculateConnection({ body: { personA, personB } })` |
| BaZi Four Pillars | `roxy.chineseAstrology.generateBaziChart({ body: { date, time, timezone } })` |
| Chinese zodiac animal | `roxy.chineseAstrology.calculateZodiacAnimal({ body: { date } })` |
| Almanac day (Tong Shu) | `roxy.chineseAstrology.getAlmanacDay({ path: { date } })` |
| Kua number | `roxy.fengShui.calculateKuaNumber({ body: { date, gender } })` |
| Flying star natal chart | `roxy.fengShui.generateFlyingStarChart({ body: { period, facing } })` |
| Tzolkin day sign | `roxy.mesoamericanAstrology.calculateTzolkin({ body: { date } })` |
| Full Maya chart | `roxy.mesoamericanAstrology.generateMayanChart({ body: { date } })` |
| Vastu entrance | `roxy.vastu.calculateEntrancePada({ body: { plot, facing, doorPosition } })` |
| Vastu room compliance | `roxy.vastu.calculateRoomCompliance({ body: { plot, facing, rooms } })` |
| Life path number | `roxy.numerology.calculateLifePath({ body: { year, month, day } })` |
| Full numerology chart | `roxy.numerology.generateNumerologyChart({ body: { fullName, year, month, day } })` |
| Personal year | `roxy.numerology.calculatePersonalYear({ body: { month, day } })` |
| Gematria | `roxy.kabbalah.calculateGematria({ body: { text } })` |
| Kabbalah birth profile | `roxy.kabbalah.generateBirthProfile({ body: { date, time, timezone } })` |
| Daily tarot card | `roxy.tarot.getDailyCard({ body: { seed, date } })`, both optional: `seed` fixes the card per user (omit for an anonymous card), `date` is `YYYY-MM-DD` and defaults to today in UTC |
| Three-card spread | `roxy.tarot.castThreeCard({ body: { question } })` |
| Celtic Cross | `roxy.tarot.castCelticCross({ body: { question } })` |
| Yes / no tarot | `roxy.tarot.castYesNo({ body: { question } })` |
| Biorhythm reading | `roxy.biorhythm.getReading({ body: { birthDate } })` |
| Daily biorhythm (seeded) | `roxy.biorhythm.getDailyBiorhythm({ body: { seed } })` |
| Biorhythm forecast | `roxy.biorhythm.getForecast({ body: { birthDate } })` |
| Biorhythm compatibility | `roxy.biorhythm.calculateBioCompatibility({ body: { person1, person2 } })` |
| Ayurvedic constitution | `roxy.ayurveda.calculateAyurvedicConstitution({ body: birth })` |
| Dinacharya | `roxy.ayurveda.getDinacharyaSchedule({ body: { date, latitude, longitude, timezone } })` |
| Daily hexagram | `roxy.iching.getDailyHexagram({ body: { seed } })` |
| Cast I Ching reading | `roxy.iching.castReading({})` |
| Hexagram detail | `roxy.iching.getHexagram({ path: { number: 1 } })` |
| Crystal by zodiac | `roxy.crystals.getCrystalsByZodiac({ path: { sign } })` |
| Crystal by chakra | `roxy.crystals.getCrystalsByChakra({ path: { chakra } })` |
| Dream symbol lookup | `roxy.dreams.getDreamSymbol({ path: { id: 'flying' } })` |
| Angel number meaning | `roxy.angelNumbers.getAngelNumber({ path: { number: '1111' } })` |
| Universal number lookup | `roxy.angelNumbers.analyzeNumberSequence({ query: { number: '1234' } })` |
| Check API usage | `roxy.usage.getUsageStats({})` |
| List supported languages | `roxy.languages.listLanguages({})` |

## Field formats that trip agents

These are the fields AI agents most often get wrong. Copy the format column exactly.

| Field | Format | Good | Bad |
|-------|--------|------|-----|
| `timezone` | Decimal hours (number) OR IANA string | `5.5`, `-5`, `0` (decimal) OR `"Asia/Kolkata"`, `"America/New_York"` (IANA, resolved to DST-correct offset for the chart date) | `"5:30"`, `"+0530"`, `"GMT-5"`, partial names |
| `date` | ISO date string | `"1990-01-15"` | `"Jan 15 1990"`, `new Date()`, `"15/01/1990"`, `"1990-1-15"` |
| `time` | 24-hour string | `"14:30:00"`, `"09:00:00"` | `"2:30 PM"`, `"14:30"` (no seconds), `"9:0:0"` (no leading zeros) |
| `latitude` | Decimal degrees (number) | `51.5074` (London), `-33.8688` (Sydney), `40.7128` (NYC) | `"28°36'N"`, `"28 36 50"`, strings |
| `longitude` | Decimal degrees (number) | `-0.1278` (London), `-74.006` (NYC), `139.6917` (Tokyo) | Same as latitude - no DMS strings |
| `sign` (horoscope path) | Lowercase zodiac name | `aries`, `taurus`, `gemini`, ... `pisces` | `"♈"`, `"1"`. Case does not matter (`"Aries"` works), lowercase is canonical |
| `chakra` (crystals path) | Title-case English name from the fixed enum | `"Root"`, `"Sacral"`, `"Solar Plexus"`, `"Heart"`, `"Throat"`, `"Third Eye"`, `"Crown"` | `"heart"`, `"third-eye"`, `"solar plexus"` - route is case-insensitive at runtime, but the generated TS enum is title-case; lowercase fails `tsc --strict`. |
| `fullName` (numerology) | Birth-certificate name | `"John William Smith"`, `"Priya Rajesh Sharma"` | Nickname, married name, partial name - affects all letter-based calcs |
| `seed` | Any string (deterministic) | `"user-42"`, `"session-abc-123"`, email hash | Numbers, objects - must be string |
| `number` (angel numbers path) | String | `"1111"`, `"777"`, `"1234"` | `1111` (int) fails path validation |
| `id` (nakshatra / dream / tarot) | Slug | `"ashwini"`, `"flying"`, `"the-fool"`, `"three-of-cups"` | Display names, uppercase, spaces |
| `houseSystem` | Enum | `"placidus"` (default), `"whole-sign"`, `"equal"`, `"koch"` | `"Placidus"`, `"whole_sign"`, `"WS"` |
| `ayanamsa` (KP) | Enum | `"kp-newcomb"` (default), `"kp-old"`, `"lahiri"`, `"custom"` | `"KP"`, `"New Comb"`, `"Lahiri"` |
| `nodeType` (KP) | Enum | `"mean"` (default, traditional Vedic), `"true"` (osculating with perturbation corrections) | `"true-node"`, `"mean-node"`, `"True Node"` |
| `count` (tarot draw) | Integer 1 to 78 | `3`, `10`, `78` | `0`, `79`, strings, floats |
| `mahadasha` (path) | Planet name | `"Ketu"`, `"Venus"`, `"Sun"`, `"Moon"`, `"Mars"`, `"Rahu"`, `"Jupiter"`, `"Saturn"`, `"Mercury"` | `"KETU"` (works, case-insensitive), `"ke"`, `"Ke-tu"` |
| `person1` / `person2` | Object with full birth data | `{ date, time, latitude, longitude, timezone }` (Western) or `{ date, time, latitude, longitude }` (Vedic) | Separate top-level fields, missing time, partial object |
| `question` (tarot / iching) | Optional string | `"Should I accept the job offer?"`, `"What should I focus on this week?"` | Leave undefined for general reading. More specific = better interpretation. |
| `year` / `month` / `day` (numerology) | Integer | `1990`, `1`, `15` | Zero-padded strings `"01"`, decimals, full dates |

### Timezone cheat sheet (most-asked locations)

| Region | Decimal | Region | Decimal |
|--------|---------|--------|---------|
| UTC / London (winter) | `0` | Dubai | `4` |
| London (summer, BST) | `1` | Karachi | `5` |
| Berlin / Paris | `1` (winter) / `2` (summer) | Delhi (IST) | `5.5` |
| Istanbul | `3` | Kathmandu (NPT) | `5.75` |
| Moscow | `3` | Dhaka | `6` |
| Tehran | `3.5` (winter) / `4.5` (summer) | Bangkok | `7` |
| Adelaide | `9.5` (winter) / `10.5` (summer) | Singapore / Beijing | `8` |
| New York (EST / EDT) | `-5` / `-4` | Tokyo | `9` |
| Chicago (CST / CDT) | `-6` / `-5` | Sydney | `10` (winter) / `11` (summer) |
| Denver (MST / MDT) | `-7` / `-6` | Auckland | `12` (winter) / `13` (summer) |
| Los Angeles (PST / PDT) | `-8` / `-7` | Honolulu | `-10` |

DST matters. If the birth date falls inside a daylight-saving window, use the summer / DST offset, or pass the IANA string from the location lookup and let the server resolve it. India observes no DST, so a fixed `5.5` is always right there; anywhere else, a natal chart must carry the offset in force at the time of birth.

## Astrology domain gotchas for LLMs

LLMs hallucinate confidently in this category. These are the specific traps you will hit when writing client code:

- **Ayanamsa is server-side in Vedic.** LLMs default to tropical / Western math. Vedic endpoints apply sidereal Lahiri ayanamsa server-side. KP endpoints accept `ayanamsa` of `kp-newcomb` (default), `kp-old`, `lahiri`, or `custom`. Do not try to "correct" server output by subtracting ayanamsa in client code.
- **Tithi count is 30, not 2.** 15 Shukla (waxing) plus 15 Krishna (waning). Older LLM training data conflates Purnima and Amavasya as single tithis. Our panchang response carries a `paksha` field (`"Shukla"` or `"Krishna"`) plus a tithi number, so there are 30 distinct tithis in a lunar month.
- **Rahu and Ketu are shadow points, not planets.** They do not appear in a real ephemeris. Endpoints accept `nodeType` of `"mean"` (smooth mean node, traditional Vedic default) or `"true"` (osculating node with perturbation corrections) to select which calculation to use.
- **Nakshatra count is 27.** Abhijit is sometimes treated as a 28th in some schools, but this API uses the standard 27. `roxy.vedicAstrology.listNakshatras()` returns an array of length 27.
- **Retrograde is per-planet, not global.** Natal chart planets and Vedic `meta` include `isRetrograde: boolean` per planet. KP planet lists use `retrograde`. Never generate "Mercury retrograde globally" UI copy, check the specific planet in the response.
- **Tarot reversals are a product choice.** `allowReversals: false` on a tarot draw means no reversed cards in that draw, period. It is not cosmically meaningful, it is a config flag.
- **Angel number lookup works for any positive integer.** Digit-root fallback covers non-canonical numbers. Do not generate validation logic that rejects anything other than `111` / `222` / `333`.
- **Seed-based daily endpoints are DETERMINISTIC per `(seed, date)` pair.** Same seed plus same date returns the same reading. This is by design for push-notification consistency. Do not describe it as "cached" or retry on stale responses.
- **Timezone affects Western calculations more than Vedic.** Western natal charts must respect DST at the time of birth. Vedic endpoints default to IST (`5.5`) which is DST-free. Pass the IANA `timezone` string from the location lookup (`"America/New_York"`, `"Asia/Kolkata"`) directly to chart calls and the server resolves the DST-correct offset for the chart `date`. Never pass the `utcOffset` of the city record (the offset in force today) or the clock of the user right now.

## Error handling

On a failure `error` is `{ error, code, doc_url }`. The `error` field is human-readable (may change wording). The `code` field is machine-readable (stable, switch on this). The HTTP status and the `Retry-After` header are on `response`; `retryAfterSeconds(response)` reads the wait in seconds. A network failure (DNS, timeout, connection reset) is not an API error: the call throws `fetch failed`, so use `try`/`catch` where that matters.

```typescript
const { data, error, response } = await roxy.astrology.getDailyHoroscope({
  path: { sign: 'aries' },
});

if (error) {
  console.error('Status:', response?.status, 'Code:', error.code, 'Message:', error.error);
  return;
}
console.log(data.sign, data.overview);
```

<!-- BEGIN:ERRORS -->
Every error returns `{ error, code, doc_url }`. Switch on `code`; `error` is readable text and may change. Each meaning below says whether and when to retry, and `Retry-After` carries the wait when the response sends it. Every code is documented at https://roxyapi.com/docs/errors.

| Status | Code | Meaning |
|--------|------|---------|
| 400 | `validation_error` | A field is missing or invalid. The body lists every failing field at once in issues, each with its path and the expected shape. |
| 400 | `bad_request` | The request was rejected as a whole, for example a body that is not valid JSON or a date range that ends before it starts. |
| 400 | `date_out_of_range` | A date lies outside the span the planetary positions are served for. The error names the supported dates. |
| 401 | `api_key_required` | No API key was sent. |
| 401 | `invalid_api_key` | The key sent is malformed or cannot be verified. |
| 401 | `api_key_revoked` | The key was valid once and has since been revoked from the account page. |
| 401 | `subscription_not_found` | The key verifies, but the subscription behind it no longer exists. |
| 401 | `subscription_inactive` | The subscription behind the key is cancelled, expired or suspended, or a trial is past its end date. |
| 401 | `publishable_key_not_allowed_on_mcp` | A publishable key was used on a Remote MCP server, which takes a secret key. |
| 401 | `invalid_client_ip` | A keyless request could not be attributed to a caller. |
| 401 | `unauthorized` | Authentication failed with no more specific reason to give. |
| 403 | `forbidden` | The key is valid, but this request is not permitted. |
| 403 | `origin_required` | A publishable key with an origin allowlist was used with no Origin header, as from a server or a native app. |
| 403 | `origin_not_allowed` | The calling site is not on the origin allowlist of this publishable key. |
| 404 | `not_found` | Nothing is served at this path, or the identifier in it does not exist. A path miss adds suggestions, the closest real endpoints. |
| 405 | `method_not_allowed` | The path exists for a different HTTP method. The body lists the accepted methods in allow, as does the Allow header. |
| 409 | `conflict` | The request cannot be applied in the current state. |
| 410 | `gone` | The path was removed permanently. |
| 413 | `payload_too_large` | The request body is larger than the API accepts. A body far over the cap is refused before it reaches the API and returns a bare 413 with no JSON body. |
| 415 | `unsupported_media_type` | A request with a body was sent without Content-Type: application/json. |
| 422 | `unprocessable_entity` | Every field is valid, but the combination cannot be computed. |
| 429 | `rate_limit_exceeded` | The monthly request allowance is used up. Retry-After gives the seconds to the reset. |
| 429 | `rate_limit_per_minute` | The per-minute limit of the plan was reached. Retry-After gives the seconds to the next minute, and the monthly allowance is not charged. |
| 429 | `rate_limited` | A rate limit was reached, reported without the plan detail. |
| 429 | `free_tier_exhausted` | A keyless request has used up its trial allowance. |
| 500 | `internal_error` | The request failed inside our service. Retry with exponential backoff. |
| 503 | `compute_saturated` | Heavy calculations are briefly at capacity. Send the same request again after Retry-After seconds. |
| Any | `error` | A fallback for a status with no more specific code. The status and the error field carry the signal. |
<!-- END:ERRORS -->

### Retries

Retries are on by default: a request is resent up to twice after a 429, 500, 502, 503 or 504, or after a connection that was never made (refused or unresolvable host). Pass `maxRetries` to change the count, or `maxRetries: 0` to turn retries off. A read timeout is never retried. The wait follows `Retry-After` when the response sends it, and a full-jitter backoff otherwise (`initialDelayMs` 500, `maxDelayMs` 30000 by default). A `Retry-After` longer than `maxDelayMs`, such as the wait for a monthly allowance, is not waited for: the error comes back at once. An abort signal on the call stops any wait. On a persistent failure the total is 1 + `maxRetries` requests, so 3 by default and exactly 1 with `maxRetries: 0`.

```typescript
import { createRoxy, ErrorCodes, retryAfterSeconds } from '@roxyapi/sdk';

const roxy = createRoxy(process.env.ROXY_API_KEY!, { maxRetries: 4 });

const { data, error, response } = await roxy.astrology.getDailyHoroscope({
  path: { sign: 'aries' },
});

if (error) {
  if (error.code === ErrorCodes.RateLimitPerMinute || error.code === ErrorCodes.ComputeSaturated) {
    console.warn('retry in', retryAfterSeconds(response), 'seconds');
  } else {
    console.error(response?.status, error.code, error.doc_url);
  }
}
```

`ErrorCodes` holds every code as a typed constant (`ErrorCodes.RateLimitPerMinute` is `'rate_limit_per_minute'`), and the `ErrorCode` type accepts codes added later. `retryAfterSeconds(response)` returns the `Retry-After` wait in seconds, or `undefined` when the response has none.

## MCP equivalents

Every method has a matching MCP tool. The remote MCP server per domain is at `https://roxyapi.com/mcp/{domain}` (Streamable HTTP, no stdio / no self-hosting). Tool names follow `{method}_{path_snake_case}`, for example:

- `POST /astrology/natal-chart` -> `post_astrology_natal_chart` on `/mcp/astrology`
- `GET /astrology/horoscope/{sign}/daily` -> `get_astrology_horoscope_sign_daily` on `/mcp/astrology`
- `POST /vedic-astrology/birth-chart` -> `post_vedic_astrology_birth_chart` on `/mcp/vedic-astrology`
- `POST /tarot/spreads/celtic-cross` -> `post_tarot_spreads_celtic_cross` on `/mcp/tarot`

Use the SDK for typed TypeScript apps. Use MCP for AI agents (Claude Desktop, Cursor MCP, OpenAI agents) where the agent selects tools based on user intent.

## Gotchas

- **Geocode first.** Any chart, panchang, synastry, compatibility, or natal endpoint needs coordinates. Call `roxy.location.searchCities` before the chart method.
- **Parameters are objects, not positional.** Always `{ path: {...} }`, `{ body: {...} }`, or `{ query: {...} }`.
- **Do not guess method names.** Type `roxy.domain.` and let autocomplete show them. Method names come from `operationId` in the OpenAPI spec, not URL paths.
- **Do not use raw `fetch`.** The SDK handles auth, base URL, and typed responses.
- **Do not expose API keys client-side.** Call Roxy from server code only.
- **Date format is `YYYY-MM-DD`, time is `HH:MM:SS`.** Both are strings.
- **Western `timezone` is required** and accepts either a decimal (`-5` for EST, `5.5` for IST, `0` for UTC) or an IANA string (`"America/New_York"`, `"Asia/Kolkata"`, `"UTC"`). IANA is resolved to the DST-correct offset for the request `date`. Vedic endpoints accept an optional `timezone` that defaults to `5.5` (IST).
- **`data` and `error` are mutually exclusive.** If `error` is set, `data` is `undefined` and vice versa.
- **Switch on `error.code`, not `error.error`.** The message may change; the code is stable.
- **A city record has `city`, `province`, `country`, `iso2`, `latitude`, `longitude`, `timezone`, `utcOffset` and `population`.** The name is `city`, never `name`.
- **`utcOffset` on a city record is the offset in force today.** Pass the IANA `timezone` string to chart calls so the server resolves the offset for the birth date.
- **A natal chart `planets` is a list of objects.** Find a body by `name`: `chart.planets.find((p) => p.name === 'Moon')`.
- **In a Vedic chart `meta.Moon.rashi` is a string and `meta.Moon.nakshatra` is an object** (`name`, `pada`, `lord`). Display `meta.Moon?.nakshatra.name`.
- **A `validation_error` carries `issues`, each with `path` (the dot-separated field, such as `time` or `person1.date`), `message` and `code`.** Loop over them to show every failing field:
  ```typescript
  if (error && 'issues' in error) {
    for (const issue of error.issues) console.error(issue.path, issue.message, issue.code);
  }
  ```
- **`sign` is matched case-insensitively.** Lowercase is canonical.
- **Network failures throw.** DNS, timeout and connection reset surface as a thrown `fetch failed`, not as `error`; wrap calls in `try`/`catch`.
- **Total requests on a persistent failure = 1 + retries.** The default `maxRetries` of 2 makes 3 requests; `maxRetries: 0` makes exactly one.
- **List endpoints return a paginated envelope**, `{ total, limit, offset }` plus a named array (`cities`, `crystals`, `hexagrams`, `symbols`), never a bare array. Pass `query: { limit }` to widen a page; `listHexagrams` defaults to 20 of 64.

## Links

- Full method reference: `docs/llms-full.txt` (bundled in this package)
- Documentation: https://roxyapi.com/docs
- Interactive API docs: https://roxyapi.com/api-reference
- Pricing and API keys: https://roxyapi.com/pricing
- MCP for AI agents: https://roxyapi.com/docs/mcp
- Templates: https://roxyapi.com/templates
- Source and issues: https://github.com/RoxyAPI/sdk-typescript
- Other SDKs: Python https://pypi.org/project/roxy-sdk/, PHP https://packagist.org/packages/roxyapi/sdk, .NET https://www.nuget.org/packages/RoxyApi.Sdk, Go https://pkg.go.dev/github.com/RoxyAPI/sdk-go, Rust https://crates.io/crates/roxyapi
