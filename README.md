# @roxyapi/sdk

[![npm](https://img.shields.io/npm/v/@roxyapi/sdk)](https://www.npmjs.com/package/@roxyapi/sdk)
[![Docs](https://img.shields.io/badge/docs-roxyapi.com-blue)](https://roxyapi.com/docs/sdk)
[![API Reference](https://img.shields.io/badge/api%20reference-roxyapi.com-blue)](https://roxyapi.com/api-reference)
[![Pricing](https://img.shields.io/badge/pricing-roxyapi.com-blue)](https://roxyapi.com/pricing)

TypeScript SDK for [RoxyAPI](https://roxyapi.com). Multiple domains, fully typed endpoints, one API key.

Build astrology apps, tarot platforms, birth chart generators, and compatibility tools without writing a single calculation.

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

// Daily horoscope
const { data } = await roxy.astrology.getDailyHoroscope({
  path: { sign: 'aries' },
});

// Vedic birth chart
const { data: chart } = await roxy.vedicAstrology.generateBirthChart({
  body: {
    date: '1990-01-15',
    time: '14:30:00',
    latitude: 28.6139,
    longitude: 77.209,
  },
});

// Tarot Celtic Cross spread
const { data: reading } = await roxy.tarot.castCelticCross({
  body: { question: 'What should I focus on?' },
});
```

`createRoxy` sets the base URL and injects SDK identification headers automatically. `auth` is required.

## Domains

| Namespace | What it covers |
|-----------|----------------|
| `roxy.angelNumbers` | Angel number lookup, pattern analysis, daily guidance |
| `roxy.astrology` | Western astrology:natal charts, horoscopes, synastry, moon phases |
| `roxy.vedicAstrology` | Vedic/Jyotish:birth charts, dashas, nakshatras, panchang, KP system |
| `roxy.tarot` | 78-card readings:spreads, daily pulls, yes/no, Celtic Cross |
| `roxy.numerology` | Life path, expression, soul urge, personal year, karmic lessons |
| `roxy.iching` | I Ching hexagrams, trigrams, daily readings |
| `roxy.crystals` | Crystal meanings, healing properties, zodiac and chakra pairings |
| `roxy.dreams` | Dream symbol interpretations:3,000+ symbols |
| `roxy.location` | City and country search for birth chart coordinates |
| `roxy.usage` | API usage stats, rate limits, subscription info |

## Authentication

Get your API key at [roxyapi.com/pricing](https://roxyapi.com/pricing). Instant delivery after checkout.

Pass the key to `createRoxy`. Never expose your API key client-side. Call Roxy from your server or API routes.

```typescript
import { createRoxy } from '@roxyapi/sdk';

const roxy = createRoxy(process.env.ROXY_API_KEY!);
```

For advanced use cases (custom fetch, interceptors, per-request auth), you can build the client manually:

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

## Error handling

Every method returns `{ data, error, response }`. Errors have `{ error: string, code: string }` — switch on `code` for programmatic handling.

```typescript
const { data, error } = await roxy.astrology.getZodiacSign({
  path: { identifier: 'aries' },
});

if (error) {
  console.error(error.code, error.error); // e.g. "not_found", "Zodiac sign 'xyz' not found"
} else {
  console.log(data);
}
```

## TypeScript

Every request and response is fully typed. IDE autocomplete shows available methods per domain and exact parameter shapes — no docs tab needed.

## AI agents (Cursor, Claude Code, Copilot, Codex)

This package ships with bundled documentation that AI coding agents can read directly from `node_modules/`:

- **`AGENTS.md`** — Quick start, patterns, gotchas, and a common tasks reference table
- **`docs/llms-full.txt`** — Complete method reference with code examples for every domain

AI agents that support `AGENTS.md` (Claude Code, Cursor, GitHub Copilot, OpenAI Codex, Gemini CLI) will read it automatically. For other tools, point your agent to `node_modules/@roxyapi/sdk/AGENTS.md`.

Also available: [MCP server](https://roxyapi.com/docs/mcp) for AI agents that support the Model Context Protocol.

## Links

- [Documentation](https://roxyapi.com/docs)
- [API Reference](https://roxyapi.com/api-reference)
- [Pricing](https://roxyapi.com/pricing)
- [MCP setup for AI agents](https://roxyapi.com/docs/mcp)
- [Starter apps](https://roxyapi.com/starters)
- [Issues](https://github.com/roxyapi/sdk-typescript/issues)

## License

MIT
