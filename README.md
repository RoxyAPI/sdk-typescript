<p align="center">
  <a href="https://roxyapi.com">
    <img src="https://raw.githubusercontent.com/RoxyAPI/sdk-typescript/main/assets/hero.png" alt="Roxy TypeScript SDK. Astrology, Vedic, tarot, numerology, and more behind one API key." width="100%">
  </a>
</p>

# @roxyapi/sdk

[![npm](https://img.shields.io/npm/v/@roxyapi/sdk)](https://www.npmjs.com/package/@roxyapi/sdk)
[![Docs](https://img.shields.io/badge/docs-roxyapi.com-blue)](https://roxyapi.com/docs/sdk)
[![API Reference](https://img.shields.io/badge/api%20reference-roxyapi.com-blue)](https://roxyapi.com/api-reference)
[![Pricing](https://img.shields.io/badge/pricing-roxyapi.com-blue)](https://roxyapi.com/pricing)

TypeScript SDK for astrology, Vedic astrology, tarot, numerology, and more.

One API key. Fully typed. Verified against NASA JPL Horizons.

The fastest way to add natal charts, kundli matching, daily horoscopes, tarot readings, and spiritual insights to Node.js apps, backends, and AI agents. Ten domains behind a single [Roxy](https://roxyapi.com) subscription, interpretations in eight languages.

## Install

```bash
npm install @roxyapi/sdk
# or
bun add @roxyapi/sdk
```

## Start with one call

Get real product value with a single typed call. No setup beyond your API key.

```typescript
import { createRoxy } from '@roxyapi/sdk';

const roxy = createRoxy(process.env.ROXY_API_KEY!);

const { data } = await roxy.astrology.getDailyHoroscope({ path: { sign: 'aries' } });
console.log(data.overview, data.love, data.luckyNumber);
```

Then expand into charts, compatibility, tarot, numerology, and more.

## Quick start

```typescript
import { createRoxy } from '@roxyapi/sdk';

const roxy = createRoxy(process.env.ROXY_API_KEY!);

// Step 1: geocode the birth city (required for any chart endpoint)
const { data } = await roxy.location.searchCities({
  query: { q: 'Mumbai, India' },
});
const { latitude, longitude, timezone } = data.cities[0];

// Step 2: Western natal chart. `timezone` can be the IANA string from the
// location response. The server resolves it to the DST-correct offset for
// the chart's own date.
const { data: chart } = await roxy.astrology.generateNatalChart({
  body: { date: '1990-01-15', time: '14:30:00', latitude, longitude, timezone },
});

// Vedic kundli uses the same inputs (timezone optional, defaults to 5.5 IST)
const { data: kundli } = await roxy.vedicAstrology.generateBirthChart({
  body: { date: '1990-01-15', time: '14:30:00', latitude, longitude, timezone },
});
```

`createRoxy` sets the base URL (`https://roxyapi.com/api/v2`) and injects the auth header and SDK identification header on every request.

## Location first

Every chart, horoscope, panchang, dasha, dosha, navamsa, KP, synastry, compatibility, and natal endpoint needs `latitude`, `longitude`, and (for Western) `timezone`. **Never ask users to type coordinates.** Call `roxy.location.searchCities({ query: { q: city } })` first, then feed the result into the chart method.

```typescript
const { data } = await roxy.location.searchCities({ query: { q: 'Tokyo' } });
const { latitude, longitude, timezone } = data.cities[0];
// `timezone` is the IANA string ("Asia/Tokyo"). Pass it straight into any
// chart endpoint and the server resolves it to the DST-correct offset for the
// chart's date. If you prefer a decimal, `data.cities[0].utcOffset` also works.
```

## Domains

<!-- BEGIN:DOMAINS -->
| Namespace | Endpoints | What it covers |
|-----------|-----------|----------------|
| `roxy.astrology` | 22 | Western astrology: natal charts, horoscopes, synastry, moon phases |
| `roxy.vedicAstrology` | 42 | Vedic/Jyotish: birth charts, dashas, nakshatras, panchang, KP system |
| `roxy.numerology` | 16 | Life path, expression, soul urge, personal year, karmic lessons |
| `roxy.tarot` | 10 | 78-card readings: spreads, daily pulls, yes/no, Celtic Cross |
| `roxy.biorhythm` | 6 | 10-cycle biorhythm readings, forecasts, critical days, compatibility |
| `roxy.iching` | 9 | I Ching hexagrams, trigrams, daily readings |
| `roxy.crystals` | 12 | Crystal meanings, healing properties, zodiac and chakra pairings |
| `roxy.dreams` | 5 | Dream symbol dictionary: 3,000+ interpretations |
| `roxy.angelNumbers` | 4 | Angel number lookup, pattern analysis, daily guidance |
| `roxy.location` | 3 | City and country search for birth chart coordinates |
| `roxy.usage` | 1 | API usage stats, rate limits, subscription info |
<!-- END:DOMAINS -->

## Most-used endpoints

The highest-demand endpoints by domain, in the order you are most likely to ship them. Each block shows the most-searched API call in that domain so you can pick the feature that drives the most user value first. Full endpoint catalog in the [API reference](https://roxyapi.com/api-reference).

### 1. Western astrology API (natal chart, daily horoscope, synastry)

The global astrology app market is $6.27B and almost entirely Western. These endpoints power zodiac dating apps, Co-Star-style natal chart products, daily horoscope features, and lunar-cycle wellness apps.

```typescript
// Natal chart. The #1 Western query, called on every onboarding.
const { data: natal } = await roxy.astrology.generateNatalChart({
  body: { date: '1990-01-15', time: '14:30:00', latitude: 28.6139, longitude: 77.209, timezone: 5.5 },
});

// Daily horoscope. Highest per-user call frequency in the catalog, drives DAUs and push.
const { data: horoscope } = await roxy.astrology.getDailyHoroscope({ path: { sign: 'aries' } });
// horoscope.overview, horoscope.love, horoscope.career, horoscope.luckyNumber

// Synastry. The dating-app pro-tier feature, full inter-aspect analysis between two charts.
const { data: synastry } = await roxy.astrology.calculateSynastry({
  body: {
    person1: { date: '1990-01-15', time: '14:30:00', latitude: 28.61, longitude: 77.20, timezone: 5.5 },
    person2: { date: '1992-07-22', time: '09:00:00', latitude: 19.07, longitude: 72.87, timezone: 5.5 },
  },
});
// synastry.compatibilityScore, synastry.interAspects, synastry.strengths

// Moon phase. Viral for wellness, cycle-tracking, and meditation apps.
const { data: moon } = await roxy.astrology.getCurrentMoonPhase({});
```

### 2. Vedic astrology API (kundli, panchang, dasha, Guna Milan, KP)

The depth moat. India astrology market: $163M in 2024, projected $1.8B by 2030 (49% CAGR). Kundli, panchang, dasha, dosha, and KP are the five Google-dominant queries for every matrimonial platform, kundli generator, and muhurat app.

```typescript
// Vedic kundli. Top India astrology keyword. Entry point for every Jyotish product.
const { data: kundli } = await roxy.vedicAstrology.generateBirthChart({
  body: { date: '1990-01-15', time: '14:30:00', latitude: 28.6139, longitude: 77.209, timezone: 5.5 },
});

// Panchang. Tithi, nakshatra, yoga, karana, rahu kaal, abhijit muhurta in one call.
const { data: panchang } = await roxy.vedicAstrology.getDetailedPanchang({
  body: { date: '2026-04-22', latitude: 28.6139, longitude: 77.209 },
});

// Vimshottari dasha. Highest-value single-shot Vedic query.
const { data: dasha } = await roxy.vedicAstrology.getCurrentDasha({
  body: { date: '1990-01-15', time: '14:30:00', latitude: 28.6139, longitude: 77.209, timezone: 5.5 },
});

// Mangal Dosha. Most-asked matrimonial question in India.
const { data: dosha } = await roxy.vedicAstrology.checkManglikDosha({
  body: { date: '1990-01-15', time: '14:30:00', latitude: 28.6139, longitude: 77.209, timezone: 5.5 },
});

// Guna Milan. 36-point Ashtakoota matrimonial compatibility score.
const { data: milan } = await roxy.vedicAstrology.calculateGunMilan({
  body: {
    person1: { date: '1990-01-15', time: '14:30:00', latitude: 28.61, longitude: 77.20 },
    person2: { date: '1992-07-22', time: '09:00:00', latitude: 19.07, longitude: 72.87 },
  },
});

// KP ruling planets. Horary answers for "will X happen" questions in real time.
const { data: kp } = await roxy.vedicAstrology.getKpRulingPlanets({
  body: { latitude: 28.6139, longitude: 77.209, timezone: 5.5 },
});
```

### 3. Numerology API (life path, full chart, personal year)

Commodity content with durable demand. `life path number calculator` is among the highest-volume spiritual searches globally. Works without birth time, the easiest domain to integrate.

```typescript
// Life Path. The #1 numerology keyword, every calculator page starts here.
const { data: lp } = await roxy.numerology.calculateLifePath({
  body: { year: 1990, month: 1, day: 15 },
});
// lp.number, lp.type ("single" | "master"), lp.meaning

// Full numerology chart. Premium one-shot: all six core numbers plus karmic, personal year.
const { data: chart } = await roxy.numerology.generateNumerologyChart({
  body: { fullName: 'Jane Smith', year: 1990, month: 1, day: 15 },
});

// Personal Year. Annual forecast, drives January traffic spikes.
const { data: pyear } = await roxy.numerology.calculatePersonalYear({
  body: { month: 1, day: 15, year: 2026 },
});
```

### 4. Tarot API (daily card, Celtic Cross, three-card, yes / no)

High search volume, evergreen. The tarot card database is the highest per-endpoint call count in the catalog because apps fetch once and cache.

```typescript
// Daily card. Stickiest tarot feature. Seed per user for deterministic once-per-day behavior.
const { data: card } = await roxy.tarot.getDailyCard({ body: { seed: 'user-42' } });
// card.card.name, card.card.imageUrl, card.interpretation

// Celtic Cross. Professional-reader spread. Premium-tier, ten positions.
const { data: cc } = await roxy.tarot.castCelticCross({
  body: { question: 'What should I focus on?', seed: 'user-42' },
});

// Three-card past-present-future. Most-drawn spread on every tarot platform.
const { data: three } = await roxy.tarot.castThreeCard({
  body: { question: 'My next quarter', seed: 'user-42' },
});

// Yes / No. Impulse micro-query, highest conversion-to-first-call on tarot surfaces.
const { data: answer } = await roxy.tarot.castYesNo({ body: { question: 'Should I take the offer?' } });
// answer.answer ("Yes" | "No" | "Maybe"), answer.strength
```

### 5. Biorhythm API (daily check-in, forecast, compatibility)

Zero competition domain. Steady search volume with the top Google result being a static calculator page. Pure land-grab for wellness, productivity, sports, and couples apps.

```typescript
// Daily biorhythm. Physical, emotional, intellectual, intuitive, plus seven extended cycles.
const { data: bio } = await roxy.biorhythm.getDailyBiorhythm({
  body: { seed: 'user-1', date: '2026-04-23' },
});

// Multi-day forecast. Best-day / worst-day planner for calendar and coaching products.
const { data: forecast } = await roxy.biorhythm.getForecast({
  body: { birthDate: '1990-01-15', startDate: '2026-04-01', endDate: '2026-04-30' },
});
```

### 6. I Ching API (daily hexagram, coin cast, 64-hexagram catalog)

Meditation apps, decision-making tools, and wisdom chatbots. `i ching API` and `hexagram API` are the keywords.

```typescript
// Cast a reading. Active divination, primary hexagram plus changing lines and transformed hexagram.
const { data: reading } = await roxy.iching.castReading({ query: { seed: 'user-42' } });
// reading.hexagram, reading.changingLinePositions, reading.resultingHexagram

// Hexagram catalog. Cache once for all 64 hexagrams.
const { data: hexagrams } = await roxy.iching.listHexagrams({});
// hexagrams.hexagrams has 64 entries
```

### 7. Crystals API (by zodiac, by chakra, birthstone)

Crystal retail and metaphysical shops use these to build "crystals for [sign]" and "[chakra] chakra stones" pages.

```typescript
// By zodiac. Highest-search crystal query pattern.
const { data: bySign } = await roxy.crystals.getCrystalsByZodiac({ path: { sign: 'scorpio' } });
// bySign.crystals is a list of id, name, color, chakra, properties

// By chakra. Second-highest crystal query pattern.
const { data: byChakra } = await roxy.crystals.getCrystalsByChakra({ path: { chakra: 'heart' } });

// Birthstone. Evergreen gift and jewelry SEO.
const { data: birthstone } = await roxy.crystals.getBirthstones({ path: { month: 4 } });
```

### 8. Dream interpretation API (symbol dictionary, search)

Thousands of dream symbols. `dream meaning` is among the highest-volume spiritual searches on Google. Journal apps, AI therapy chatbots, and self-discovery products are the buyers.

```typescript
// Symbol detail. Every "what does it mean to dream about X" page lands here.
const { data: symbol } = await roxy.dreams.getDreamSymbol({ path: { id: 'flying' } });
// symbol.id, symbol.name, symbol.meaning

// Symbol search. Chatbots cache the dictionary locally after one call.
const { data: results } = await roxy.dreams.searchDreamSymbols({ query: { q: 'flying' } });
// results.symbols is an array of matching symbols
```

### 9. Angel Numbers API (1111, 222, 333 meanings plus universal lookup)

Gen Z spiritual-tok fuel. `111 meaning`, `222 meaning`, `333 angel number` are evergreen viral queries with massive shareability.

```typescript
// By number. Every "meaning of 1111" page is backed by this.
const { data: angel } = await roxy.angelNumbers.getAngelNumber({ path: { number: '1111' } });
// angel.meaning.spiritual, angel.meaning.love, angel.affirmation

// Universal lookup. Works for any positive integer via digit-root fallback.
const { data: anyNumber } = await roxy.angelNumbers.analyzeNumberSequence({ query: { number: '4242' } });
```

## Built for AI agents (Cursor, Claude Code, Copilot, Codex, Gemini CLI)

<p align="center">
  <img src="https://raw.githubusercontent.com/RoxyAPI/sdk-typescript/main/assets/agents.png" alt="Built for Cursor, Claude, Copilot, Codex. AGENTS.md ships in node_modules, remote MCP, no local setup." width="100%">
</p>

This package ships with bundled documentation that AI coding agents read directly from `node_modules/`:

- `AGENTS.md` for quick start, patterns, gotchas, common-tasks reference
- `docs/llms-full.txt` for the complete method reference with examples per domain

Agents supporting `AGENTS.md` (Claude Code, Cursor, GitHub Copilot, OpenAI Codex, Gemini CLI) will pick it up automatically. For other tools, point your agent to `node_modules/@roxyapi/sdk/AGENTS.md`.

Prefer MCP? Every domain has a [remote MCP server](https://roxyapi.com/docs/mcp) at `https://roxyapi.com/mcp/{domain}` (Streamable HTTP, no stdio, no self-hosting). One-line Claude Code setup:

```bash
claude mcp add-json --scope user roxy-astrology \
  '{"type":"http","url":"https://roxyapi.com/mcp/astrology","headers":{"X-API-Key":"YOUR_KEY"}}'
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
