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

| Namespace | What it covers |
|-----------|----------------|
| `roxy.astrology` | Western astrology: natal charts, horoscopes, synastry, moon phases, transits, compatibility |
| `roxy.vedicAstrology` | Vedic/Jyotish: birth charts, dashas, nakshatras, panchang, KP system, doshas, yogas |
| `roxy.tarot` | Rider-Waite-Smith deck: spreads, daily pulls, yes/no, Celtic Cross, custom layouts |
| `roxy.numerology` | Life path, expression, soul urge, personal year, karmic analysis, compatibility |
| `roxy.crystals` | Crystal healing properties, zodiac/chakra pairings, birthstones, search |
| `roxy.iching` | I Ching: hexagrams, trigrams, coin casting, daily readings |
| `roxy.angelNumbers` | Angel number meanings, pattern analysis, daily guidance |
| `roxy.dreams` | Dream symbol dictionary and interpretations |
| `roxy.location` | City geocoding for birth chart coordinates |
| `roxy.usage` | API usage stats and subscription info |

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

### Error handling

```typescript
const { data, error, response } = await roxy.astrology.getDailyHoroscope({
  path: { sign: 'aries' },
});

if (error) {
  // error is { error: string } on 4xx/5xx
  console.error('Status:', response?.status, 'Error:', error);
  return;
}
// data is fully typed after error check
console.log(data.sign, data.overview);
```

Common error codes: `401` invalid/missing API key, `403` subscription expired or limit reached, `429` rate limited, `404` resource not found.

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

## Links

- Full method reference: `docs/llms-full.txt` (bundled in this package)
- Interactive API docs: https://roxyapi.com/api-reference
- Pricing and API keys: https://roxyapi.com/pricing
- MCP for AI agents: https://roxyapi.com/docs/mcp
