# @roxyapi/sdk — Agent Guide

TypeScript SDK for RoxyAPI. Multi-domain spiritual and metaphysical intelligence API. One API key, fully typed, zero runtime dependencies.

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

**Total:** 130 endpoints across 10 domains + usage. Counts auto-sync from `specs/openapi.json` at release time.

## Critical patterns

### GET endpoints — use `path` for URL parameters

```typescript
const { data } = await roxy.astrology.getDailyHoroscope({
  path: { sign: 'aries' },
});

const { data } = await roxy.crystals.getCrystal({
  path: { slug: 'amethyst' },
});
```

### POST endpoints — use `body` for request data

Most valuable endpoints (charts, spreads, calculations) are POST:

```typescript
// Birth chart — requires date, time, coordinates
const { data } = await roxy.astrology.generateNatalChart({
  body: {
    date: '1990-01-15',
    time: '14:30:00',
    latitude: 28.6139,
    longitude: 77.209,
  },
});

// Tarot spread
const { data } = await roxy.tarot.castCelticCross({
  body: { question: 'What should I focus on?' },
});

// Numerology
const { data } = await roxy.numerology.calculateLifePath({
  body: { year: 1990, month: 1, day: 15 },
});
```

### Query parameters

```typescript
const { data } = await roxy.crystals.searchCrystals({
  query: { q: 'amethyst' },
});
```

### Multi-language responses via `query: { lang }`

Interpretations are available in 8 languages: `en`, `tr`, `de`, `es`, `fr`, `hi`, `pt`, `ru`. Pass `lang` as a query param on any supported endpoint. Defaults to `en`.

```typescript
const { data } = await roxy.tarot.getDailyCard({
  body: { date: '2026-04-14' },
  query: { lang: 'es' },
});

const { data } = await roxy.numerology.calculateLifePath({
  body: { year: 1990, month: 1, day: 15 },
  query: { lang: 'hi' },
});
```

Supported: `astrology`, `vedicAstrology`, `tarot`, `numerology`, `crystals`, `iching`, `angelNumbers`, `biorhythm`. Not supported (English-only): `dreams`, `location`, `usage`. Languages without translations yet fall back to English.

### Error handling

All errors return `{ error: string, code: string }`. The `error` field is human-readable (may change wording). The `code` field is machine-readable (stable, safe to switch on).

```typescript
const { data, error, response } = await roxy.astrology.getDailyHoroscope({
  path: { sign: 'aries' },
});

if (error) {
  // error is { error: string, code: string } on 4xx/5xx
  console.error('Code:', error.code, 'Message:', error.error);
  return;
}
// data is fully typed after error check
console.log(data.sign, data.overview);
```

Error codes:

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

| Task | Code |
|------|------|
| Daily horoscope | `roxy.astrology.getDailyHoroscope({ path: { sign } })` |
| Birth chart (Western) | `roxy.astrology.generateNatalChart({ body: { date, time, latitude, longitude } })` |
| Birth chart (Vedic) | `roxy.vedicAstrology.generateBirthChart({ body: { date, time, latitude, longitude } })` |
| Compatibility score | `roxy.astrology.calculateCompatibility({ body: { person1, person2 } })` |
| Tarot daily card | `roxy.tarot.getDailyCard({ body: { date } })` |
| Celtic Cross reading | `roxy.tarot.castCelticCross({ body: { question } })` |
| Life Path number | `roxy.numerology.calculateLifePath({ body: { year, month, day } })` |
| Full numerology chart | `roxy.numerology.generateNumerologyChart({ body: { date, name } })` |
| Crystal by zodiac | `roxy.crystals.getCrystalsByZodiac({ path: { sign } })` |
| I Ching reading | `roxy.iching.castReading()` |
| Angel number meaning | `roxy.angelNumbers.getAngelNumber({ path: { number: '1111' } })` |
| Dream symbol lookup | `roxy.dreams.getDreamSymbol({ path: { id: 'flying' } })` |
| Biorhythm reading | `roxy.biorhythm.getReading({ body: { birthDate: '1990-01-15' } })` |
| Biorhythm forecast | `roxy.biorhythm.getForecast({ body: { birthDate: '1990-01-15', endDate: '2026-05-01' } })` |
| Biorhythm compatibility | `roxy.biorhythm.calculateBioCompatibility({ body: { person1: { birthDate }, person2: { birthDate } } })` |
| Find city coordinates | `roxy.location.searchCities({ query: { q: 'Mumbai' } })` |
| Check API usage | `roxy.usage.getUsageStats()` |

## Location helper

Most chart endpoints need `latitude` and `longitude`. Use the location API to geocode:

```typescript
const { data: cities } = await roxy.location.searchCities({
  query: { q: 'Mumbai, India' },
});
const city = cities[0];
// Use city.latitude and city.longitude in chart requests
```

## Gotchas

- **Parameters are objects, not positional.** Always `{ path: {...} }`, `{ body: {...} }`, or `{ query: {...} }` — never positional arguments.
- **Do not guess method names.** Type `roxy.domain.` and let autocomplete show available methods. Method names come from `operationId` in the OpenAPI spec, not URL paths.
- **Do not use raw `fetch`.** The SDK handles auth headers, base URL, and typed responses.
- **Do not expose API keys client-side.** Call Roxy from server code, API routes, or server components only.
- **Chart endpoints need coordinates.** Use `roxy.location.searchCities()` to get latitude/longitude before calling any birth chart or panchang method.
- **Date format is `YYYY-MM-DD`, time is `HH:MM:SS`.** Both are strings. Timezone is optional (IANA format like `America/New_York`).
- **All list endpoints may return paginated objects** (e.g. `{ items: [...], total: N }`) rather than raw arrays. Check the type.
- **`data` and `error` are mutually exclusive.** If `error` is set, `data` is `undefined` and vice versa.
- **Errors have `error` (message) and `code` (machine-readable).** Switch on `code`, not `error` — the message may change wording.

## Links

- Full method reference: `docs/llms-full.txt` (bundled in this package)
- Interactive API docs: https://roxyapi.com/api-reference
- Pricing and API keys: https://roxyapi.com/pricing
- MCP for AI agents: https://roxyapi.com/docs/mcp
