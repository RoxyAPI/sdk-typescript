# @roxyapi/sdk — Agent Guide

TypeScript SDK for RoxyAPI. 8 spiritual/metaphysical domains, 113 endpoints, one API key. Zero runtime dependencies.

> Before writing any code with this SDK, read `docs/llms-full.txt` in this package for the complete method reference with examples.

## Install and initialize

```typescript
import { createRoxy } from '@roxyapi/sdk';

const roxy = createRoxy(process.env.ROXY_API_KEY!);
```

`createRoxy` sets the base URL (`https://roxyapi.com/api/v2`) and auth header automatically. Every method returns `{ data, error, response }`.

## Domains

Type `roxy.` to see all 10 namespaces:

| Namespace | Methods | What it covers |
|-----------|---------|----------------|
| `roxy.astrology` | 23 | Western astrology: natal charts, horoscopes, synastry, moon phases, transits |
| `roxy.vedicAstrology` | 42 | Vedic/Jyotish: birth charts, dashas, nakshatras, panchang, KP system |
| `roxy.tarot` | 10 | 78-card Rider-Waite-Smith: spreads, daily pulls, yes/no, Celtic Cross |
| `roxy.numerology` | 13 | Life path, expression, soul urge, personal year, karmic analysis |
| `roxy.crystals` | 12 | Crystal healing properties, zodiac/chakra pairings, birthstones |
| `roxy.iching` | 9 | I Ching: 64 hexagrams, trigrams, coin casting, daily readings |
| `roxy.angelNumbers` | 4 | Angel number meanings, pattern analysis, daily guidance |
| `roxy.dreams` | 5 | Dream symbol dictionary (2,000+ symbols) |
| `roxy.location` | 3 | City geocoding for birth chart coordinates |
| `roxy.usage` | 1 | API usage stats and subscription info |

## Critical patterns

### GET endpoints — use `path` for URL parameters

```typescript
// Path params go in { path: { ... } }
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

### Error handling

```typescript
const { data, error, response } = await roxy.astrology.getDailyHoroscope({
  path: { sign: 'aries' },
});

if (error) {
  // error is { error: string } on 4xx/5xx
  console.error(error);
  return;
}
// data is fully typed here
console.log(data.sign, data.overview);
```

### Query parameters

```typescript
const { data } = await roxy.crystals.searchCrystals({
  query: { q: 'amethyst' },
});

const { data } = await roxy.dreams.searchDreamSymbols({
  query: { q: 'flying' },
});
```

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

## What NOT to do

- Do not call endpoints with raw `fetch` — use the typed SDK methods
- Do not hardcode the base URL — `createRoxy` sets it
- Do not expose the API key client-side — call from server/API routes only
- Do not guess method names — type `roxy.domain.` and use autocomplete
- Parameters are `{ path }`, `{ body }`, or `{ query }` — not positional arguments

## Links

- Full method reference: `docs/llms-full.txt` (bundled in this package)
- Interactive API docs: https://roxyapi.com/api-reference
- Pricing and API keys: https://roxyapi.com/pricing
- MCP setup for AI agents: https://roxyapi.com/docs/mcp
