# @roxyapi/sdk - Agent Guide

TypeScript SDK for RoxyAPI. Eleven domains (Western astrology, Vedic astrology, numerology, tarot, biorhythm, I Ching, crystals, dreams, angel numbers, location, usage). One API key, fully typed, zero runtime dependencies.

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
const { data: cities } = await roxy.location.searchCities({ query: { q: 'Mumbai' } });
const { latitude, longitude, timezone } = cities[0];
```

## Domains

Type `roxy.` to see all available namespaces. Type `roxy.{domain}.` to see every method in that domain.

<!-- BEGIN:DOMAINS -->
| Namespace | Endpoints | What it covers |
|-----------|-----------|----------------|
| `roxy.astrology` | 22 | Western astrology: natal charts, horoscopes, synastry, moon phases, transits, compatibility |
| `roxy.vedicAstrology` | 42 | Vedic/Jyotish: birth charts, dashas, nakshatras, panchang, KP system, doshas, yogas |
| `roxy.tarot` | 10 | Rider-Waite-Smith deck: spreads, daily pulls, yes/no, Celtic Cross, custom layouts |
| `roxy.numerology` | 16 | Life path, expression, soul urge, personal year, karmic analysis, compatibility |
| `roxy.dreams` | 5 | Dream symbol dictionary and interpretations |
| `roxy.angelNumbers` | 4 | Angel number meanings, pattern analysis, daily guidance |
| `roxy.iching` | 9 | I Ching: hexagrams, trigrams, coin casting, daily readings |
| `roxy.crystals` | 12 | Crystal healing properties, zodiac/chakra pairings, birthstones, search |
| `roxy.biorhythm` | 6 | 10-cycle biorhythm readings, forecasts, critical days, compatibility, daily check-ins (wellness, dating, productivity) |
| `roxy.location` | 3 | City geocoding for birth chart coordinates |
| `roxy.usage` | 1 | API usage stats and subscription info |
<!-- END:DOMAINS -->

**Total:** 130 endpoints across 10 product domains plus usage. Counts auto-sync from `specs/openapi.json` at release time.

## Critical patterns

### Two-step pattern for coordinate-dependent endpoints

```typescript
const { data: cities } = await roxy.location.searchCities({ query: { q: 'Delhi' } });
const { latitude, longitude, timezone } = cities[0];

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

Supported: `astrology`, `vedicAstrology`, `numerology`, `tarot`, `biorhythm`, `iching`, `crystals`, `angelNumbers`. English-only: `dreams`, `location`, `usage`.

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

Ordered by domain priority (Western, Vedic, Numerology, Tarot, Biorhythm, I Ching, Crystals, Dreams, Angel Numbers, Location, Usage).

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
| Find city coordinates | `roxy.location.searchCities({ query: { q: 'Mumbai' } })` |
| Check API usage | `roxy.usage.getUsageStats()` |

## Field formats that trip agents

These are the fields AI agents most often get wrong. Copy the format column exactly.

| Field | Format | Good | Bad |
|-------|--------|------|-----|
| `timezone` | Decimal hours from UTC (number) | `5.5` (India IST, GMT+5:30), `5.75` (Nepal NPT, GMT+5:45), `-5` (NY EST), `9.5` (Adelaide), `0` (UTC) | `"5:30"`, `"5:45"`, `5.45`, `"GMT-5"`, `"Asia/Kolkata"`, `"+0530"` |
| `date` | ISO date string | `"1990-01-15"` | `"Jan 15 1990"`, `new Date()`, `"15/01/1990"`, `"1990-1-15"` |
| `time` | 24-hour string | `"14:30:00"`, `"09:00:00"` | `"2:30 PM"`, `"14:30"` (no seconds), `"9:0:0"` (no leading zeros) |
| `latitude` | Decimal degrees (number) | `28.6139` (Delhi), `-33.8688` (Sydney), `40.7128` (NYC) | `"28°36'N"`, `"28 36 50"`, strings |
| `longitude` | Decimal degrees (number) | `77.209` (Delhi), `-74.006` (NYC), `139.6917` (Tokyo) | Same as latitude - no DMS strings |
| `sign` (horoscope path) | Lowercase zodiac name | `aries`, `taurus`, `gemini`, ... `pisces` | `"Aries"`, `"♈"`, `"1"`, `"ARIES"` (case-insensitive but prefer lowercase) |
| `fullName` (numerology) | Birth-certificate name | `"John William Smith"`, `"Priya Rajesh Sharma"` | Nickname, married name, partial name - affects all letter-based calcs |
| `seed` | Any string (deterministic) | `"user-42"`, `"session-abc-123"`, email hash | Numbers, objects - must be string |
| `number` (angel numbers path) | String | `"1111"`, `"777"`, `"1234"` | `1111` (int) fails path validation |
| `id` (nakshatra / dream / tarot) | Slug | `"ashwini"`, `"flying"`, `"the-fool"`, `"three-of-cups"` | Display names, uppercase, spaces |
| `houseSystem` | Enum | `"placidus"` (default), `"whole-sign"`, `"equal"`, `"koch"` | `"Placidus"`, `"whole_sign"`, `"WS"` |
| `ayanamsa` (KP) | Enum | `"kp-newcomb"` (default), `"kp-old"`, `"lahiri"`, `"custom"` | `"KP"`, `"New Comb"`, `"Lahiri"` |
| `nodeType` | Enum | `"true-node"`, `"mean-node"` | `"true"`, `"mean"`, `"True Node"` |
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
- **Western `timezone` is required** (decimal hours, `-5` for EST, `5.5` for IST, `0` for UTC). Vedic endpoints accept an optional `timezone` that defaults to `5.5` (IST).
- **`data` and `error` are mutually exclusive.** If `error` is set, `data` is `undefined` and vice versa.
- **Switch on `error.code`, not `error.error`.** The message may change; the code is stable.
- **List endpoints may return paginated objects** (`{ items, total }`) instead of raw arrays. Check the type.

## Links

- Full method reference: `docs/llms-full.txt` (bundled in this package)
- Interactive API docs: https://roxyapi.com/api-reference
- Pricing and API keys: https://roxyapi.com/pricing
- MCP for AI agents: https://roxyapi.com/docs/mcp
- Python SDK: https://pypi.org/project/roxy-sdk/
