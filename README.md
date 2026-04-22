# @roxyapi/sdk

[![npm](https://img.shields.io/npm/v/@roxyapi/sdk)](https://www.npmjs.com/package/@roxyapi/sdk)
[![Docs](https://img.shields.io/badge/docs-roxyapi.com-blue)](https://roxyapi.com/docs/sdk)
[![API Reference](https://img.shields.io/badge/api%20reference-roxyapi.com-blue)](https://roxyapi.com/api-reference)
[![Pricing](https://img.shields.io/badge/pricing-roxyapi.com-blue)](https://roxyapi.com/pricing)

TypeScript SDK for [RoxyAPI](https://roxyapi.com). Natal charts, Vedic kundli, numerology, tarot, biorhythm, I Ching, crystals, dreams, and angel numbers. Eleven domains, one API key, fully typed.

Build astrology apps, kundli matching, tarot platforms, compatibility tools, and daily-horoscope features without writing a single calculation.

## Install

```bash
npm install @roxyapi/sdk
# or
bun add @roxyapi/sdk
```

## Quick start

```typescript
import { createRoxy } from '@roxyapi/sdk';

const roxy = createRoxy(process.env.ROXY_API_KEY!);

// Step 1: geocode the birth city (required for any chart endpoint)
const { data: cities } = await roxy.location.searchCities({
  query: { q: 'Mumbai, India' },
});
const { latitude, longitude, timezone } = cities[0];

// Step 2: Western natal chart
const { data: chart } = await roxy.astrology.generateNatalChart({
  body: { date: '1990-01-15', time: '14:30:00', latitude, longitude, timezone },
});

// Vedic kundli uses the same inputs
const { data: kundli } = await roxy.vedicAstrology.generateBirthChart({
  body: { date: '1990-01-15', time: '14:30:00', latitude, longitude },
});
```

`createRoxy` sets the base URL (`https://roxyapi.com/api/v2`) and injects the auth header and SDK identification header on every request.

## Location first

Every chart, horoscope, panchang, dasha, dosha, navamsa, KP, synastry, compatibility, and natal endpoint needs `latitude`, `longitude`, and (for Western) `timezone`. **Never ask users to type coordinates.** Call `roxy.location.searchCities({ query: { q: city } })` first, then feed the result into the chart method.

```typescript
const { data } = await roxy.location.searchCities({ query: { q: 'Tokyo' } });
const { latitude, longitude, timezone } = data[0];
```

## Domains

<!-- BEGIN:DOMAINS -->
| Namespace | Endpoints | What it covers |
|-----------|-----------|----------------|
| `roxy.astrology` | 22 | Western astrology: natal charts, daily / weekly / monthly horoscopes, synastry, compatibility score, transits, moon phases |
| `roxy.vedicAstrology` | 42 | Vedic / Jyotish: kundli, panchang, Vimshottari dasha, nakshatras, Mangal and Kaal Sarp and Sade Sati doshas, Guna Milan, navamsa, KP chart and ruling planets |
| `roxy.numerology` | 16 | Life path, expression, soul urge, personal year, full chart, compatibility, karmic lessons |
| `roxy.tarot` | 10 | Daily card, custom draws, three-card, Celtic Cross, yes / no, love spread, 78-card catalog |
| `roxy.biorhythm` | 6 | Daily check-in, multi-day forecast, critical days, couples compatibility, phases |
| `roxy.iching` | 9 | Daily hexagram, three-coin cast, 64 hexagrams, trigrams |
| `roxy.crystals` | 12 | By zodiac, by chakra, birthstone, search, daily, pairings |
| `roxy.dreams` | 5 | Dream symbol dictionary (3,000+ interpretations), daily prompt |
| `roxy.angelNumbers` | 4 | Number meanings, universal digit-root lookup, daily |
| `roxy.location` | 3 | City search with coordinates and timezone, countries |
| `roxy.usage` | 1 | API usage stats, rate limits, subscription info |
<!-- END:DOMAINS -->

## Recipes

### Daily horoscope (wellness, news, lifestyle apps)

```typescript
const { data } = await roxy.astrology.getDailyHoroscope({
  path: { sign: 'aries' },
});
// data.overview, data.love, data.career, data.luckyNumber, ...
```

### Vedic kundli (India market, matrimonial, muhurat)

```typescript
const { data: cities } = await roxy.location.searchCities({ query: { q: 'Delhi' } });
const { latitude, longitude } = cities[0];

const { data: kundli } = await roxy.vedicAstrology.generateBirthChart({
  body: { date: '1990-01-15', time: '14:30:00', latitude, longitude },
});
```

### Panchang (daily almanac, ritual planner)

```typescript
const { data } = await roxy.vedicAstrology.getDetailedPanchang({
  body: { date: '2026-04-22', latitude: 28.6139, longitude: 77.209 },
});
// data.tithi, data.nakshatra, data.rahuKaal, data.abhijitMuhurta, ...
```

### Guna Milan (matrimonial matching)

```typescript
const person1 = { date: '1990-01-15', time: '14:30:00', latitude: 28.61, longitude: 77.20 };
const person2 = { date: '1992-07-22', time: '09:00:00', latitude: 19.07, longitude: 72.87 };

const { data } = await roxy.vedicAstrology.calculateGunMilan({
  body: { person1, person2 },
});
// data.total, data.maxScore (36), data.isCompatible, data.breakdown[8]
```

### Numerology life path (numerology calculators)

```typescript
const { data } = await roxy.numerology.calculateLifePath({
  body: { year: 1990, month: 1, day: 15 },
});
// data.number, data.type, data.hasKarmicDebt, data.meaning
```

### Tarot Celtic Cross (premium-tier tarot feature)

```typescript
const { data } = await roxy.tarot.castCelticCross({
  body: { question: 'What should I focus on?' },
});
// data.positions[10], data.reading
```

### Daily biorhythm (wellness, productivity, sports apps)

```typescript
const { data } = await roxy.biorhythm.getDailyBiorhythm({
  body: { seed: 'user-123' },
});
```

### I Ching cast (decision-making, meditation)

```typescript
const { data } = await roxy.iching.castReading();
// data.hexagram, data.changingLinePositions, data.resultingHexagram
```

### Dream symbol lookup (journaling, self-discovery)

```typescript
const { data } = await roxy.dreams.getDreamSymbol({ path: { id: 'flying' } });
```

### Angel number meaning (viral content, spiritual apps)

```typescript
const { data } = await roxy.angelNumbers.getAngelNumber({
  path: { number: '1111' },
});
```

## Authentication

Get your API key at [roxyapi.com/pricing](https://roxyapi.com/pricing). Instant delivery after checkout.

```typescript
import { createRoxy } from '@roxyapi/sdk';

const roxy = createRoxy(process.env.ROXY_API_KEY!);
```

Never expose your API key client-side. Call Roxy from your server or API routes only.

For advanced use (custom fetch, interceptors, per-request auth), build the client manually:

```typescript
import { Roxy } from '@roxyapi/sdk';
import { createClient, createConfig } from '@roxyapi/sdk/client';

const client = createClient(
  createConfig({
    baseUrl: 'https://roxyapi.com/api/v2',
    auth: process.env.ROXY_API_KEY,
  }),
);
const roxy = new Roxy({ client });
```

## Multi-language responses

Interpretations and editorial text are available in eight languages: English (`en`), Turkish (`tr`), German (`de`), Spanish (`es`), French (`fr`), Hindi (`hi`), Portuguese (`pt`), Russian (`ru`). Pass `query: { lang }` on any supported endpoint:

```typescript
const { data } = await roxy.tarot.getDailyCard({
  body: { date: '2026-04-22' },
  query: { lang: 'es' },
});
```

Supported: `astrology`, `vedicAstrology`, `numerology`, `tarot`, `biorhythm`, `iching`, `crystals`, `angelNumbers`. English-only: `dreams`, `location`, `usage`. Untranslated fields fall back to English.

## Error handling

Every method returns `{ data, error, response }`. On 4xx / 5xx the error shape is `{ error: string, code: string }`. Switch on `code` for programmatic handling.

```typescript
const { data, error } = await roxy.astrology.getDailyHoroscope({
  path: { sign: 'aries' },
});

if (error) {
  console.error(error.code, error.error);
} else {
  console.log(data);
}
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

## TypeScript

Every request and response is fully typed. IDE autocomplete shows available methods per domain and exact parameter shapes. No docs tab needed.

## AI agents (Cursor, Claude Code, Copilot, Codex, Gemini CLI)

This package ships with bundled documentation that AI coding agents read directly from `node_modules/`:

- `AGENTS.md` - quick start, patterns, gotchas, common-tasks reference
- `docs/llms-full.txt` - complete method reference with code examples for every domain

Agents supporting `AGENTS.md` (Claude Code, Cursor, GitHub Copilot, OpenAI Codex, Gemini CLI) will pick it up automatically. For other tools, point your agent to `node_modules/@roxyapi/sdk/AGENTS.md`.

Also available: [MCP server](https://roxyapi.com/docs/mcp) per domain at `https://roxyapi.com/mcp/{domain}-api` for agents that speak the Model Context Protocol.

## Links

- [Documentation](https://roxyapi.com/docs)
- [API Reference](https://roxyapi.com/api-reference)
- [Pricing](https://roxyapi.com/pricing)
- [MCP setup for AI agents](https://roxyapi.com/docs/mcp)
- [Starter apps](https://roxyapi.com/starters)
- [Python SDK](https://pypi.org/project/roxy-sdk/)
- [Issues](https://github.com/RoxyAPI/sdk-typescript/issues)

## License

MIT
