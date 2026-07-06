# @roxyapi/sdk - Agent Guide

TypeScript SDK for RoxyAPI. 12+ domains (Western astrology, Vedic astrology, numerology, tarot, human design, forecast, biorhythm, I Ching, crystals, dreams, angel numbers, location) plus utility namespaces (usage, languages). One API key, fully typed, zero runtime dependencies.

> Before writing any code with this SDK, read `docs/llms-full.txt` in this package for the complete method reference with examples.

## Install and initialize

```bash
npm install @roxyapi/sdk
```

```typescript
import { createRoxy } from '@roxyapi/sdk';

const roxy = createRoxy(process.env.ROXY_API_KEY!);
```

`createRoxy` sets the base URL (`https://roxyapi.com/api/v2`) and auth header automatically. Every method returns `{ data, error, response }`.

## Critical rule: geocode before any chart endpoint

Every chart, horoscope, panchang, dasha, dosha, navamsa, KP, synastry, compatibility, and natal endpoint needs `latitude`, `longitude`, and (for Western) `timezone`. **Never ask the user for coordinates.** Always call `roxy.location.searchCities` first.

```typescript
const { data } = await roxy.location.searchCities({ query: { q: 'New York' } });
const { latitude, longitude, timezone } = data.cities[0];
// `timezone` is the IANA string ("America/New_York"). Pass it directly to any chart
// endpoint and the server resolves it to the DST-correct decimal offset using
// the chart's own `date`, so a January 1990 New York chart picks EST (-5) even
// when you looked the city up in July. If you prefer numbers, `utcOffset`
// (5.5, -5, 9, ...) also works and produces identical charts.
```

`q` accepts bare city (`'Paris'`), city + country (`'Berlin Germany'`), or comma-qualified (`'Springfield, Illinois'`). Use the qualified form to disambiguate same-named cities.

## Domains

Type `roxy.` to see all available namespaces. Type `roxy.{domain}.` to see every method in that domain.

<!-- BEGIN:DOMAINS -->
| Namespace | What it covers |
|-----------|----------------|
| `roxy.astrology` | Western astrology API for natal birth charts, daily, weekly, and monthly horoscopes with unique content per sign, syn... |
| `roxy.vedicAstrology` | Vedic astrology (Jyotish) and KP API for kundli generation with 15 divisional charts (D1-D60), Ashtakoot Gun Milan ku... |
| `roxy.numerology` | Numerology API to calculate life path, expression, soul urge, personality, and maturity numbers, with Pinnacle and Ch... |
| `roxy.tarot` | Tarot reading API with the complete 78-card Rider-Waite-Smith deck and card meanings for love, career, health, and sp... |
| `roxy.humanDesign` | Generate the full Human Design bodygraph from a birth moment: type, strategy, inner authority, profile, definition, i... |
| `roxy.forecast` | Merge upcoming transit aspects, sign ingresses, retrograde stations, new and full moons, biorhythm critical days, and... |
| `roxy.biorhythm` | The most complete biorhythm API: 10 cycle types across 3 primary (physical, emotional, intellectual), 4 secondary (in... |
| `roxy.iching` | I-Ching oracle API with all 64 hexagrams, 384 changing lines, 8 trigrams, and modern interpretations for love, career... |
| `roxy.crystals` | Crystal healing API covering the most popular and widely-searched healing crystals and gemstones, from Amethyst and R... |
| `roxy.dreams` | Dream interpretation API with a 2,000+ symbol dream dictionary and psychological meanings covering animals, objects,... |
| `roxy.angelNumbers` | Angel numbers API with meanings for 111, 222, 333, 444, 555, 666, 777, 888, 999, 1111, and 75+ sequences covering eve... |
| `roxy.location` | City search and geocoding API with 23,000+ cities across 240+ countries, returning latitude, longitude, IANA timezone... |
| `roxy.usage` | Monitor your API usage, check rate limits, and track request consumption |
| `roxy.languages` | List the response languages accepted by the `lang` query parameter on every i18n-aware endpoint |
<!-- END:DOMAINS -->

**Total:** 160+ endpoints across 12+ product domains plus usage and languages. The table above auto-syncs from `specs/openapi.json` at release time.

## Quality guidelines for agents

Five rules to follow when writing any call with this SDK. Get these right and the generated types do the rest.

- **One options object, hey-api wrapped.** Every method takes a single object with `path`, `query`, and `body` keys. Path params go in `path`, query params in `query`, request body in `body`. Never flat named args. Right: `roxy.astrology.getDailyHoroscope({ path: { sign: 'aries' } })`. Wrong: `roxy.astrology.getDailyHoroscope({ sign: 'aries' })`.
- **Always `await`. Always destructure `{ data, error, response }`.** All methods are async. `data` is the typed success response (undefined on error). `error` is the typed API error (`{ error: string, code: string }`, undefined on success). `response` is the raw `fetch` Response. Switch on `error.code`, not on `error.error`.
- **Method names match the OpenAPI `operationId` verbatim.** When in doubt, autocomplete `roxy.{domain}.` in your editor or `grep 'public ' node_modules/@roxyapi/sdk/dist/factory.d.ts`. Never invent a method from the URL path or a guess.
- **Response field names come from the spec's response schema.** Field access is typed dot syntax (`data.cities[0].timezone`). TypeScript will catch any invented field at compile time via the generated types - if `tsc` complains, the field does not exist.
- **Do not hand-roll requests.** No raw `fetch`, no axios. The SDK injects auth, base URL, retries, and typed responses. Use `createRoxy(key)` for the common case, or `new Roxy({ client })` with `createClient` from `@roxyapi/sdk/client` when you need a custom fetch or interceptors.

## Critical patterns

### Two-step pattern for coordinate-dependent endpoints

```typescript
const { data } = await roxy.location.searchCities({ query: { q: 'London' } });
const { latitude, longitude, timezone } = data.cities[0];

const { data: chart } = await roxy.astrology.generateNatalChart({
  body: { date: '1990-01-15', time: '14:30:00', latitude, longitude, timezone },
});
```

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

Eight languages: `en`, `tr`, `de`, `es`, `fr`, `hi`, `pt`, `ru`. Defaults to `en`.

```typescript
await roxy.tarot.getDailyCard({ body: { date: '2026-04-22' }, query: { lang: 'es' } });
await roxy.numerology.calculateLifePath({
  body: { year: 1990, month: 1, day: 15 },
  query: { lang: 'hi' },
});
```

Supported: `astrology`, `vedicAstrology`, `numerology`, `tarot`, `biorhythm`, `iching`, `crystals`, `angelNumbers`. English-only: `dreams`, `location`, `usage`, `languages`. To list supported codes at runtime, call `roxy.languages.listLanguages()`.

### Error handling

All errors return `{ error: string, code: string }`. The `error` field is human-readable (may change wording). The `code` field is machine-readable (stable, switch on this).

```typescript
const { data, error, response } = await roxy.astrology.getDailyHoroscope({
  path: { sign: 'aries' },
});

if (error) {
  console.error('Code:', error.code, 'Message:', error.error);
  return;
}
console.log(data.sign, data.overview);
```

| Status | Code | When |
|--------|------|------|
| 400 | `validation_error` | Missing or invalid parameters |
| 401 | `api_key_required` | No API key provided |
| 401 | `invalid_api_key` | Key format invalid or tampered |
| 401 | `subscription_not_found` | Key references non-existent subscription |
| 401 | `subscription_inactive` | Subscription cancelled, expired, or suspended |
| 404 | `not_found` | Resource not found |
| 429 | `rate_limit_exceeded` | Monthly quota reached |
| 500 | `internal_error` | Server error |

## Common tasks

Ordered by domain priority (Western, Vedic, Numerology, Tarot, Biorhythm, I Ching, Crystals, Dreams, Angel Numbers, Location, Usage, Languages).

| Task | Code |
|------|------|
| Daily horoscope | `roxy.astrology.getDailyHoroscope({ path: { sign } })` |
| Natal chart (Western) | `roxy.astrology.generateNatalChart({ body: { date, time, latitude, longitude, timezone } })` |
| Synastry | `roxy.astrology.calculateSynastry({ body: { person1, person2 } })` |
| Compatibility score | `roxy.astrology.calculateCompatibility({ body: { person1, person2 } })` |
| Current moon phase | `roxy.astrology.getCurrentMoonPhase()` |
| Transits | `roxy.astrology.calculateTransits({ body: { natalChart } })` |
| Kundli (Vedic birth chart) | `roxy.vedicAstrology.generateBirthChart({ body: { date, time, latitude, longitude } })` |
| Panchang (detailed) | `roxy.vedicAstrology.getDetailedPanchang({ body: { date, latitude, longitude } })` |
| Choghadiya | `roxy.vedicAstrology.getChoghadiya({ body: { date, latitude, longitude } })` |
| Current dasha | `roxy.vedicAstrology.getCurrentDasha({ body: { date, time, latitude, longitude } })` |
| Mangal Dosha | `roxy.vedicAstrology.checkManglikDosha({ body: { date, time, latitude, longitude } })` |
| Guna Milan (matching) | `roxy.vedicAstrology.calculateGunMilan({ body: { person1, person2 } })` |
| Navamsa (D9) | `roxy.vedicAstrology.generateNavamsa({ body: { date, time, latitude, longitude } })` |
| KP chart | `roxy.vedicAstrology.generateKpChart({ body: { date, time, latitude, longitude } })` |
| Nakshatra detail | `roxy.vedicAstrology.getNakshatra({ path: { id: 'ashwini' } })` |
| Life path number | `roxy.numerology.calculateLifePath({ body: { year, month, day } })` |
| Full numerology chart | `roxy.numerology.generateNumerologyChart({ body: { fullName, year, month, day } })` |
| Personal year | `roxy.numerology.calculatePersonalYear({ body: { month, day } })` |
| Daily tarot card | `roxy.tarot.getDailyCard({ body: { seed } })` |
| Three-card spread | `roxy.tarot.castThreeCard({ body: { question } })` |
| Celtic Cross | `roxy.tarot.castCelticCross({ body: { question } })` |
| Yes / no tarot | `roxy.tarot.castYesNo({ body: { question } })` |
| Human Design bodygraph | `roxy.humanDesign.generateBodygraph({ body: { date, time, latitude, longitude, timezone } })` |
| Forecast timeline | `roxy.forecast.generateTimeline({ body: { birthData, startDate, endDate } })` |
| Daily biorhythm | `roxy.biorhythm.getDailyBiorhythm({ body: { seed } })` |
| Biorhythm forecast | `roxy.biorhythm.getForecast({ body: { birthDate } })` |
| Biorhythm compatibility | `roxy.biorhythm.calculateBioCompatibility({ body: { person1, person2 } })` |
| Daily hexagram | `roxy.iching.getDailyHexagram({ body: { seed } })` |
| Cast I Ching reading | `roxy.iching.castReading()` |
| Hexagram detail | `roxy.iching.getHexagram({ path: { number: 1 } })` |
| Crystal by zodiac | `roxy.crystals.getCrystalsByZodiac({ path: { sign } })` |
| Crystal by chakra | `roxy.crystals.getCrystalsByChakra({ path: { chakra } })` |
| Dream symbol lookup | `roxy.dreams.getDreamSymbol({ path: { id: 'flying' } })` |
| Angel number meaning | `roxy.angelNumbers.getAngelNumber({ path: { number: '1111' } })` |
| Universal number lookup | `roxy.angelNumbers.analyzeNumberSequence({ query: { number: '1234' } })` |
| Find city coordinates | `roxy.location.searchCities({ query: { q: 'Berlin' } })` |
| Check API usage | `roxy.usage.getUsageStats()` |
| List supported languages | `roxy.languages.listLanguages()` |

## Field formats that trip agents

These are the fields AI agents most often get wrong. Copy the format column exactly.

| Field | Format | Good | Bad |
|-------|--------|------|-----|
| `timezone` | Decimal hours (number) OR IANA string | `5.5`, `-5`, `0` (decimal) OR `"Asia/Kolkata"`, `"America/New_York"` (IANA, resolved to DST-correct offset for the chart date) | `"5:30"`, `"+0530"`, `"GMT-5"`, partial names |
| `date` | ISO date string | `"1990-01-15"` | `"Jan 15 1990"`, `new Date()`, `"15/01/1990"`, `"1990-1-15"` |
| `time` | 24-hour string | `"14:30:00"`, `"09:00:00"` | `"2:30 PM"`, `"14:30"` (no seconds), `"9:0:0"` (no leading zeros) |
| `latitude` | Decimal degrees (number) | `51.5074` (London), `-33.8688` (Sydney), `40.7128` (NYC) | `"28°36'N"`, `"28 36 50"`, strings |
| `longitude` | Decimal degrees (number) | `-0.1278` (London), `-74.006` (NYC), `139.6917` (Tokyo) | Same as latitude - no DMS strings |
| `sign` (horoscope path) | Lowercase zodiac name | `aries`, `taurus`, `gemini`, ... `pisces` | `"Aries"`, `"♈"`, `"1"`, `"ARIES"` (case-insensitive but prefer lowercase) |
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
| Berlin / Paris | `1` (winter) / `2` (summer) | Delhi / Mumbai (IST) | `5.5` |
| Istanbul | `3` | Kathmandu (NPT) | `5.75` |
| Moscow | `3` | Dhaka | `6` |
| Tehran | `3.5` (winter) / `4.5` (summer) | Bangkok | `7` |
| Adelaide | `9.5` (winter) / `10.5` (summer) | Singapore / Beijing | `8` |
| New York (EST / EDT) | `-5` / `-4` | Tokyo | `9` |
| Chicago (CST / CDT) | `-6` / `-5` | Sydney | `10` (winter) / `11` (summer) |
| Denver (MST / MDT) | `-7` / `-6` | Auckland | `12` (winter) / `13` (summer) |
| Los Angeles (PST / PDT) | `-8` / `-7` | Honolulu | `-10` |

DST matters. If the birth date falls inside a daylight-saving window, use the summer / DST offset. For Vedic endpoints this is rarely an issue (most users are in India, fixed 5.5), but Western natal charts must respect DST at the time of birth.

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
- **Timezone affects Western calculations more than Vedic.** Western natal charts must respect DST at the time of birth. Vedic endpoints default to IST (`5.5`) which is DST-free. Pass the IANA `timezone` string from the Location API response (`"America/New_York"`, `"Asia/Kolkata"`) directly to chart calls and the server resolves the DST-correct offset for the chart `date`. Decimal `utcOffset` (5.5, -5, ...) also works and produces an identical chart.

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
- **Do not expose API keys client-side.** Call Roxy from server code, API routes, or server components only.
- **Date format is `YYYY-MM-DD`, time is `HH:MM:SS`.** Both are strings.
- **Western `timezone` is required** and accepts either a decimal (`-5` for EST, `5.5` for IST, `0` for UTC) or an IANA string (`"America/New_York"`, `"Asia/Kolkata"`, `"UTC"`). IANA is resolved to the DST-correct offset for the request `date`. Vedic endpoints accept an optional `timezone` that defaults to `5.5` (IST).
- **`data` and `error` are mutually exclusive.** If `error` is set, `data` is `undefined` and vice versa.
- **Switch on `error.code`, not `error.error`.** The message may change; the code is stable.
- **List endpoints may return paginated objects** (`{ items, total }`) instead of raw arrays. Check the type.

## Links

- Full method reference: `docs/llms-full.txt` (bundled in this package)
- Interactive API docs: https://roxyapi.com/api-reference
- Pricing and API keys: https://roxyapi.com/pricing
- MCP for AI agents: https://roxyapi.com/docs/mcp
- Python SDK: https://pypi.org/project/roxy-sdk/
