<p align="center">
  <a href="https://roxyapi.com">
    <img src="https://raw.githubusercontent.com/RoxyAPI/sdk-typescript/main/assets/hero.png" alt="RoxyAPI TypeScript SDK, ship in an afternoon. The Spiritual OS layer for agentic AI. One key, flat pricing." width="100%">
  </a>
</p>

# @roxyapi/sdk

[![npm](https://img.shields.io/npm/v/@roxyapi/sdk)](https://www.npmjs.com/package/@roxyapi/sdk)
[![Docs](https://img.shields.io/badge/docs-roxyapi.com-blue)](https://roxyapi.com/docs/sdk)
[![API Reference](https://img.shields.io/badge/api%20reference-roxyapi.com-blue)](https://roxyapi.com/api-reference)
[![Pricing](https://img.shields.io/badge/pricing-roxyapi.com-blue)](https://roxyapi.com/pricing)

TypeScript SDK for astrology, Vedic astrology, numerology, tarot, and more.

One API key. Fully typed. Verified against NASA JPL Horizons.

The fastest way to add natal charts, daily horoscopes, synastry, Vedic kundli, tarot spreads, numerology, human design bodygraphs, and transit forecasts to Node.js apps, backends, and AI agents. 18+ domains behind a single [Roxy](https://roxyapi.com) subscription, interpretations in 10+ languages.

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

const { data, error } = await roxy.astrology.getDailyHoroscope({ path: { sign: 'aries' } });
if (error) throw error;
console.log(data.overview, data.love, data.luckyNumber);
```

Then expand into charts, compatibility, numerology, tarot, and more.

## Quick start

```typescript
import { createRoxy } from '@roxyapi/sdk';

// Retries 429, 500, 502, 503 and 504 by default. Optional settings, shown with their defaults:
// createRoxy(key, { maxRetries: 2, initialDelayMs: 500, maxDelayMs: 30000 })
const roxy = createRoxy(process.env.ROXY_API_KEY!);

// Step 1: geocode the birth city once. Every chart endpoint takes these three values.
const { data: place, error: lookupError } = await roxy.location.searchCities({ query: { q: 'London' } });
if (lookupError) throw lookupError;
const { latitude, longitude, timezone } = place.cities[0];

// Step 2: a Western natal chart. `timezone` is the IANA string from the lookup
// ("Europe/London"); the server resolves it to the DST-correct offset for the
// date of the chart.
const { data: chart, error: chartError } = await roxy.astrology.generateNatalChart({
  body: { date: '1990-01-15', time: '14:30:00', latitude, longitude, timezone },
});
if (chartError) throw chartError;
// `planets` is a list: find a body by its `name`.
console.log(chart.planets.find((p) => p.name === 'Moon')?.sign);

// Step 3: the same birth as a Vedic kundli. Same inputs, sidereal zodiac.
const { data: kundli, error: kundliError } = await roxy.vedicAstrology.generateBirthChart({
  body: { date: '1990-01-15', time: '14:30:00', latitude, longitude, timezone },
});
if (kundliError) throw kundliError;
// `meta.Moon.rashi` is a string; `meta.Moon.nakshatra` is an object, so read `.name`.
console.log(kundli.meta.Moon?.rashi, kundli.meta.Moon?.nakshatra.name);
```

`createRoxy` sets the base URL (`https://roxyapi.com/api/v2`) and injects the auth header and SDK identification header on every request. Every method returns `{ data, error, response }`; check `error` first, or pass `throwOnError: true` in the call options to have failures throw and `data` typed as always present (see Error handling). A network failure (DNS, timeout, connection reset) is not an API error: the call throws, so wrap calls in `try`/`catch` where that matters.

## Domains

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
| [`roxy.location`](https://roxyapi.com/api-reference/location-and-timezone) | Timezone and location API with city search and geocoding across 235,000+ cities in 240+ countries, returning latitude... |
| [`roxy.usage`](https://roxyapi.com/api-reference/usage) | Monitor your API usage, check rate limits, and track request consumption |
| [`roxy.languages`](https://roxyapi.com/api-reference/languages) | List the response languages accepted by the `lang` query parameter on every i18n-aware endpoint |
<!-- END:DOMAINS -->

## Most-used endpoints

The highest-demand endpoints by domain, in the order you are most likely to ship them. Every example below reads the same birth through a different domain, and every coordinate comes from one location lookup at the top: one API key, one lookup, and eighteen domains that compose into a single product instead of eighteen separate ones. Full catalog in the [API reference](https://roxyapi.com/api-reference).

### Location first: one lookup feeds every chart

Every chart, horoscope, panchang, dasha, dosha, synastry and compatibility endpoint needs `latitude`, `longitude` and `timezone`. Never ask users to type coordinates. Look the city up once and reuse the result in every domain below.

```typescript
// One lookup feeds every chart below. `timezone` is the IANA name from the city
// record; the server resolves it to the DST-correct offset for the date of each chart.
const { data: place, error } = await roxy.location.searchCities({ query: { q: 'New York' } });
if (error) throw error;
const { latitude, longitude, timezone } = place.cities[0];
const birth = { date: '1990-01-15', time: '14:30:00', latitude, longitude, timezone };

// A second person for the two-chart calls (synastry, Guna Milan, Human Design connection).
const { data: london, error: error2 } = await roxy.location.searchCities({ query: { q: 'London' } });
if (error2) throw error2;
const { latitude: lat2, longitude: lon2, timezone: tz2 } = london.cities[0];
const partner = { date: '1992-07-22', time: '09:00:00', latitude: lat2, longitude: lon2, timezone: tz2 };
```

### 1. Western astrology API (natal chart, daily horoscope, synastry)

Natal chart products, daily horoscope features, dating and compatibility apps, and lunar-cycle wellness apps start here.

```typescript
// Natal chart. The most requested Western call, run once at onboarding.
// `birth` carries the latitude, longitude and timezone from the location lookup above.
const { data: natal } = await roxy.astrology.generateNatalChart({ body: birth });
// natal.planets[n].name, .sign, .house, .interpretation?.summary; natal.ascendant.sign; natal.aspects

// Daily horoscope. The highest per-user call frequency in the catalog: daily content, streaks, push.
const { data: horoscope } = await roxy.astrology.getDailyHoroscope({ path: { sign: 'aries' } });
// horoscope.overview, horoscope.love, horoscope.career, horoscope.column, horoscope.events, horoscope.luckyNumber

// Synastry. Full inter-aspect analysis between two charts, the relationship feature of dating apps.
const { data: synastry } = await roxy.astrology.calculateSynastry({
  body: { person1: birth, person2: partner },
});
// synastry.compatibilityScore, synastry.interAspects, synastry.analysis.strengths

// Moon phase. A zero-setup GET for wellness, cycle-tracking and meditation apps.
const { data: moon } = await roxy.astrology.getCurrentMoonPhase({});
// moon.phase, moon.illumination, moon.sign, moon.meaning?.description
```

### 2. Vedic astrology API (kundli, panchang, dasha, Guna Milan, KP)

Kundli generators, matrimonial matching, muhurta and panchang apps, and KP practitioners. The same `birth` object, read sidereally.

```typescript
// Vedic kundli. The same birth read sidereally: `birth` reuses the location lookup above.
const { data: kundli } = await roxy.vedicAstrology.generateBirthChart({ body: birth });
// kundli.meta.Moon.rashi, kundli.meta.Moon.nakshatra, kundli.houses, kundli.combustion

// Detailed panchang. Tithi, nakshatra, yoga, karana, rahu kaal and the muhurtas for a date and place.
const { data: panchang } = await roxy.vedicAstrology.getDetailedPanchang({
  body: { date: '2026-10-01', latitude, longitude, timezone },
});
// panchang.tithi, panchang.nakshatra, panchang.rahuKaal, panchang.abhijitMuhurta

// Vimshottari dasha. The mahadasha, antardasha and pratyantardasha running right now.
const { data: dasha } = await roxy.vedicAstrology.getCurrentDasha({ body: birth });
// dasha.mahadasha, dasha.antardasha, dasha.remainingInMahadasha

// Mangal Dosha. The most asked matrimonial check.
const { data: dosha } = await roxy.vedicAstrology.checkManglikDosha({ body: birth });
// dosha.present; dosha.severity and dosha.remedies are set only when present is true

// Guna Milan. The 36-point Ashtakoota score behind kundli matching, both people from the lookups above.
const { data: milan } = await roxy.vedicAstrology.calculateGunMilan({
  body: { person1: birth, person2: partner },
});
// milan.total, milan.percentage, milan.isCompatible, milan.breakdown

// KP ruling planets. Horary answers at the moment of the question, for the place looked up above.
const { data: kp } = await roxy.vedicAstrology.getKpRulingPlanets({
  body: { latitude, longitude, timezone },
});
// kp.dayLord, kp.moonSublord, kp.rulingPlanets
```

### 3. Astrology forecast API (transit forecast, cross-domain timeline)

Forecast feeds, transit alerts and timing tools. One call returns a dated, significance-scored event list; the timeline variant merges Vedic dasha boundaries and biorhythm critical days into the same list, which no single-domain API can do.

```typescript
// Transit forecast. Transit-to-natal aspects, sign ingresses and retrograde stations over a window.
// `birthData` is the same `birth` object: date, time, latitude, longitude, timezone.
const { data: transits } = await roxy.forecast.forecastTransits({
  body: { birthData: birth, startDate: '2026-10-01', endDate: '2026-10-31' },
});
// transits.count, transits.events[n].date, .type, .body, .target, .aspect, .significance

// Cross-domain timeline. The same window with Vedic dasha boundaries and biorhythm critical days merged in.
const { data: timeline } = await roxy.forecast.generateTimeline({
  body: { birthData: birth, startDate: '2026-10-01', endDate: '2026-10-31' },
});
// timeline.events[n].domain ('western' | 'vedic' | 'biorhythm'), .description, .significance
```

### 4. Human Design API (bodygraph, connection)

Self-discovery apps, coaching bots and compatibility products. The full bodygraph is one call, and the Design side is solved on the exact 88-degree solar arc rather than approximated as calendar days.

```typescript
// Bodygraph. Type, strategy, authority, profile, definition, centers, channels and all 26 gates in one call.
// Human Design needs only the birth instant, so it takes the date, time and timezone from the lookup above.
const { data: hd } = await roxy.humanDesign.generateBodygraph({
  body: { date: birth.date, time: birth.time, timezone: birth.timezone },
});
// hd.type, hd.strategy, hd.authority, hd.profile, hd.definition, hd.incarnationCross.name, hd.centers, hd.channels, hd.gates

// Connection. Two bodygraphs combined, each of the 36 channels classified by how the pair forms it.
const { data: connection } = await roxy.humanDesign.calculateConnection({
  body: {
    personA: { date: birth.date, time: birth.time, timezone: birth.timezone },
    personB: { date: partner.date, time: partner.time, timezone: partner.timezone },
  },
});
// connection.totalChannels, connection.summary.electromagnetic, connection.combinedDefinition
```

### 5. Chinese zodiac API (BaZi four pillars, zodiac animal, almanac)

BaZi readings, zodiac content and Tong Shu date pages. The school splits that make two calculators disagree (`dayBoundary`, `yearBoundary`, `hourClock`) are typed request parameters with named defaults.

```typescript
// BaZi Four Pillars. The anchor call of the domain, from the same birth instant as every chart above.
// Each response echoes the `conventions` it was computed under, so a chart can be reproduced, not guessed.
const { data: bazi } = await roxy.chineseAstrology.generateBaziChart({
  body: { date: birth.date, time: birth.time, timezone: birth.timezone },
});
// bazi.pillars[n].position ('year' | 'month' | 'day' | 'hour'), .stem.element, .branch.animal, .tenGod.name
// bazi.dayMaster.element, bazi.zodiacAnimal, bazi.fiveElements, bazi.conventions

// Chinese zodiac animal. Defaults `yearBoundary` to the Lunar New Year, the folk rule people mean
// when they ask which animal they are. Pass 'li-chun' for the classical BaZi boundary.
const { data: animal } = await roxy.chineseAstrology.calculateZodiacAnimal({ body: { date: birth.date } });
// animal.animal.name, animal.animal.element, animal.element (the year stem element), animal.interpretation

// Almanac day. The Tong Shu view of a date: day officer, mansion, clash animal, favours and avoids.
const { data: almanac } = await roxy.chineseAstrology.getAlmanacDay({ path: { date: '2026-10-01' } });
// almanac.dayPillar, almanac.dayOfficer, almanac.clashAnimal, almanac.favours, almanac.avoids
```

### 6. Feng shui API (Kua number, flying star chart)

Kua numbers with the Eight Mansions map, Xuan Kong flying star charts for any of the nine periods and 24 mountains, annual and monthly star plates, and the annual afflictions.

```typescript
// Kua number. One birth date and a gender give the personal directions everything else reads off.
const { data: kua } = await roxy.fengShui.calculateKuaNumber({ body: { date: birth.date, gender: 'female' } });
// kua.kua, kua.group ('east' | 'west'), kua.trigram.english, kua.sectors[n].direction, .nature, .rank

// Flying star natal chart. Period plus facing gives the nine palaces with base, mountain and water stars.
// Send `facing` (a mountain id like 'bing' or a compass label like 'S2') or `facingDegrees`, not neither.
const { data: stars } = await roxy.fengShui.generateFlyingStarChart({ body: { period: 9, facing: 'S2' } });
// stars.facing.label, stars.sitting.label, stars.structure.name, stars.palaces[n].palace, .base, .mountain, .water, .reading
```

### 7. Mayan astrology API (Tzolkin day sign, full Maya chart)

Maya day signs, the Haab and Long Count, and the Aztec tonalpohualli, every value a function of the date under a typed `correlation` convention echoed back in `conventions`.

```typescript
// Tzolkin day sign. The most asked Maya question, answered from a date alone.
const { data: tzolkin } = await roxy.mesoamericanAstrology.calculateTzolkin({ body: { date: birth.date } });
// tzolkin.daySign, tzolkin.daySignName, tzolkin.number, tzolkin.trecena, tzolkin.reading

// Full Maya chart. Tzolkin, Haab, Long Count, Calendar Round, Lord of the Night, Year Bearer and the Cruz Maya.
const { data: maya } = await roxy.mesoamericanAstrology.generateMayanChart({ body: { date: birth.date } });
// maya.tzolkin, maya.haab, maya.longCount, maya.calendarRound, maya.yearBearer, maya.cross, maya.conventions.correlation
```

### 8. Vastu Shastra API (entrance analysis, room compliance)

Home and plot analysis from typed geometry. Every verdict carries a `source` object naming the text, chapter and verse it rests on, or a convention label where the texts are silent.

```typescript
// Entrance analysis. Plot, facing and door in; the pada, its devata, the classical effect and the recommended padas out.
const { data: entrance } = await roxy.vastu.calculateEntrancePada({
  body: { plot: { width: 30, depth: 40, unit: 'feet' }, facing: 'North', doorPosition: 0.4 },
});
// entrance.pada, entrance.devata, entrance.effect, entrance.auspiciousness, entrance.recommendedPadas, entrance.source

// Room compliance. A verdict per room with the verse or the convention it rests on, and a scored composite.
const { data: rooms } = await roxy.vastu.calculateRoomCompliance({
  body: {
    plot: { width: 30, depth: 40, unit: 'feet' },
    facing: 'North',
    rooms: [
      { type: 'kitchen', direction: 'Southeast' },
      { type: 'master-bedroom', direction: 'Southwest' },
      { type: 'puja', direction: 'Northeast' },
    ],
  },
});
// rooms.score, rooms.rooms[n].type, .verdict, .idealDirections, .source
```

### 9. Numerology API (life path, full chart, personal year)

Works from the birth date and name alone, no coordinates, which makes it the easiest domain to integrate.

```typescript
// Life Path. The most searched numerology number, from the birth date alone.
const { data: lifePath } = await roxy.numerology.calculateLifePath({ body: { year: 1990, month: 1, day: 15 } });
// lifePath.number, lifePath.type ('single' | 'master'), lifePath.meaning

// Full numerology chart. All six core numbers plus karmic lessons, pinnacles and the personal year in one call.
const { data: numerology } = await roxy.numerology.generateNumerologyChart({
  body: { fullName: 'Jane Smith', year: 1990, month: 1, day: 15 },
});
// numerology.coreNumbers.lifePath, .expression, .soulUrge, numerology.additionalInsights.personalYear

// Personal Year. The annual theme, the January feature of every numerology app.
const { data: personalYear } = await roxy.numerology.calculatePersonalYear({ body: { month: 1, day: 15, year: 2026 } });
// personalYear.personalYear, personalYear.theme, personalYear.advice
```

### 10. Kabbalah API (gematria, birth profile)

Gematria of a Latin name under a declared transliteration convention, the 72 names, the Tree of Life, and a Hebrew birthday computed from the same birth instant as every chart above.

```typescript
// Gematria. A Latin name transliterated under a declared convention, ten ciphers, each with its tradition and source.
const { data: gematria } = await roxy.kabbalah.calculateGematria({ body: { text: 'Sarah' } });
// gematria.chosen.hebrew, gematria.values[n].id, .name, .value, .tradition; gematria.matches, gematria.conventions

// Birth profile. The Hebrew date and birthday, the three birth angels and the birth sephirah from the instant above.
const { data: kabbalah } = await roxy.kabbalah.generateBirthProfile({
  body: { date: birth.date, time: birth.time, timezone: birth.timezone },
});
// kabbalah.hebrewDate, kabbalah.hebrewBirthday, kabbalah.angels, kabbalah.sephirah
```

### 11. Tarot API (daily card, three-card, Celtic Cross, yes or no)

The complete 78-card deck with meanings for love, career, health and spirit. Pass a `seed` per user for deterministic once-per-day draws.

```typescript
// Daily card. The body takes two optional fields: `seed` (a stable id per user; the same
// seed and date always return the same card, omit it for an anonymous card) and `date`
// (YYYY-MM-DD, defaults to today in UTC).
const { data: card } = await roxy.tarot.getDailyCard({ body: { seed: 'user-42' } });
// card.card.name, card.card.reversed, card.card.imageUrl, card.dailyMessage

// Three-card spread. Past, present, future: the most drawn spread on every tarot platform.
const { data: three } = await roxy.tarot.castThreeCard({ body: { question: 'My next quarter', seed: 'user-42' } });
// three.positions[n].name, .card.name, .interpretation; three.summary

// Celtic Cross. The ten-position professional reading.
const { data: celtic } = await roxy.tarot.castCelticCross({ body: { question: 'What should I focus on?', seed: 'user-42' } });
// celtic.positions[n].name, .card.name, .interpretation; celtic.summary

// Yes or no. One card, one answer, with its strength.
const { data: answer } = await roxy.tarot.castYesNo({ body: { question: 'Should I take the offer?' } });
// answer.answer ('Yes' | 'No' | 'Maybe'), answer.strength, answer.card.name
```

### 12. Biorhythm API (reading, forecast)

Ten cycle types across primary, secondary and extended cycles, for wellness, productivity, sports and couples apps.

```typescript
// Biorhythm reading. All ten cycles for a date, from the same birth date as every chart above.
const { data: bio } = await roxy.biorhythm.getReading({ body: { birthDate: birth.date, targetDate: '2026-10-01' } });
// bio.cycles.physical.value, .phase; bio.energyRating, bio.overallPhase, bio.criticalAlerts, bio.interpretation

// Forecast. Every cycle for every day of a window, with the best and worst days named.
const { data: bioForecast } = await roxy.biorhythm.getForecast({
  body: { birthDate: birth.date, startDate: '2026-10-01', endDate: '2026-10-31' },
});
// bioForecast.summary.bestDay, .worstDay, .averageEnergy; bioForecast.days[n].date, .physical, .emotional, .intellectual, .isCritical
```

### 13. Ayurveda API (dosha constitution, dinacharya)

The dosha profile read from a verified sidereal chart with the verse on each factor, a daily routine anchored on the local sunrise, and the six seasons from real solar ingresses. Every response carries `meta.disclaimer`.

```typescript
// Constitution. The dosha profile read from the sidereal chart of the same birth, each factor with its verse.
const { data: constitution } = await roxy.ayurveda.calculateAyurvedicConstitution({ body: birth });
// constitution.composite.dominant, .type; constitution.factors[n].id, .input, .doshas, .source; constitution.meta.disclaimer

// Dinacharya. Brahma muhurta, the dosha periods and the routine for a date at the place looked up above.
const { data: dinacharya } = await roxy.ayurveda.getDinacharyaSchedule({
  body: { date: '2026-10-01', latitude, longitude, timezone },
});
// dinacharya.brahmaMuhurta, dinacharya.doshaPeriods, dinacharya.routine
```

### 14. I Ching API (cast a reading, hexagram catalog)

All 64 hexagrams, 384 changing lines and 8 trigrams, for meditation apps, decision tools and wisdom chatbots.

```typescript
// Cast a reading. Three coins six times: the primary hexagram, the changing lines and the resulting hexagram.
const { data: reading } = await roxy.iching.castReading({ query: { seed: 'user-42' } });
// reading.hexagram?.number, reading.hexagram?.english, reading.lines, reading.changingLinePositions, reading.resultingHexagram

// Hexagram catalog. Paginated, 20 per page by default; ask for all 64 once and cache them.
const { data: hexagrams } = await roxy.iching.listHexagrams({ query: { limit: 64 } });
// hexagrams.total, hexagrams.hexagrams[n].number, .english, .pinyin; fetch roxy.iching.getHexagram({ path: { number } }) for the judgment and lines
```

### 15. Crystal healing API (by zodiac, by chakra, birthstone)

Crystal retail and metaphysical content: "crystals for [sign]" and "[chakra] chakra stones" pages, plus the birthstone for each month.

```typescript
// By zodiac. The most searched crystal query pattern.
const { data: bySign } = await roxy.crystals.getCrystalsByZodiac({ path: { sign: 'scorpio' } });
// bySign.crystals[n].id, .name, .imageUrl, .colors; fetch roxy.crystals.getCrystal({ path: { id } }) for full properties

// By chakra. Wellness and yoga content pages.
const { data: byChakra } = await roxy.crystals.getCrystalsByChakra({ path: { chakra: 'Heart' } });
// byChakra.crystals[n].name, .colors

// Birthstone. Evergreen gift and jewelry pages.
const { data: birthstone } = await roxy.crystals.getBirthstones({ path: { month: 1 } });
```

### 16. Dream interpretation API (symbol dictionary, search)

A 2,000+ symbol dream dictionary for journal apps, AI companions and self-discovery products.

```typescript
// Symbol detail. Every "what does it mean to dream about X" page lands here.
const { data: symbol } = await roxy.dreams.getDreamSymbol({ path: { id: 'flying' } });
// symbol.id, symbol.name, symbol.meaning

// Symbol search. Chatbots fetch the dictionary once and keep it locally.
const { data: symbols } = await roxy.dreams.searchDreamSymbols({ query: { q: 'water' } });
// symbols.symbols[n].id, .name
```

### 17. Angel numbers API (1111, 222, 333 meanings plus universal lookup)

Meanings for every common sequence, and a lookup that answers any positive integer through its digit root.

```typescript
// By number. Every "meaning of 1111" page is backed by this. The path param is a string.
const { data: angel } = await roxy.angelNumbers.getAngelNumber({ path: { number: '1111' } });
// angel.title, angel.coreMessage, angel.meaning.spiritual, angel.meaning.love, angel.affirmation

// Universal lookup. Any positive integer, with the digit root carrying the answer when no curated entry exists.
const { data: sequence } = await roxy.angelNumbers.analyzeNumberSequence({ query: { number: '4242' } });
// sequence.digitRoot, sequence.isRepeating, sequence.knownMeaning (null when not curated), sequence.digitRootMeaning?.title
```

## Built for AI agents (Cursor, Claude Code, Copilot, Codex, Gemini CLI)

<p align="center">
  <img src="https://raw.githubusercontent.com/RoxyAPI/sdk-typescript/main/assets/agents.png" alt="Your coding agent already knows the API. Built for AI agents, Remote MCP, no local setup." width="100%">
</p>

This package ships with bundled documentation that AI coding agents read directly from `node_modules/`:

- [AGENTS.md](https://github.com/RoxyAPI/sdk-typescript/blob/main/AGENTS.md) for quick start, patterns, gotchas, common-tasks reference
- [docs/llms-full.txt](https://github.com/RoxyAPI/sdk-typescript/blob/main/docs/llms-full.txt) for the complete method reference with examples per domain

Point your coding agent to `node_modules/@roxyapi/sdk/AGENTS.md` for the installed package guide.

Prefer MCP? Every domain has a [Remote MCP server](https://roxyapi.com/docs/mcp) at `https://roxyapi.com/mcp/{domain}` (Streamable HTTP, no stdio, no self-hosting). One-line Claude Code setup:

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

Never expose your API key client-side. Call Roxy from server code only.

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

Interpretations and editorial text are available in 10 languages: English (`en`), Turkish (`tr`), German (`de`), Spanish (`es`), French (`fr`), Hindi (`hi`), Portuguese (`pt`), Russian (`ru`), Chinese Simplified (`zh-Hans`), Chinese Traditional (`zh-Hant`). Pass `query: { lang }` on any supported endpoint:

```typescript
const { data } = await roxy.tarot.getDailyCard({
  body: { date: '2026-04-22' },
  query: { lang: 'es' },
});
```

Supported: `astrology`, `vedicAstrology`, `forecast`, `humanDesign`, `chineseAstrology`, `fengShui`, `mesoamericanAstrology`, `vastu`, `numerology`, `kabbalah`, `tarot`, `biorhythm`, `ayurveda`, `iching`, `crystals`, `angelNumbers`. English-only: `dreams`, `location`, `usage`. The two Chinese scripts (`zh-Hans`, `zh-Hant`) currently ship on Chinese astrology and feng shui; every other domain answers those codes in English per field. Untranslated fields fall back to English.

## Error handling

Every method returns `{ data, error, response }`. On a 4xx or 5xx, `error` carries the body described below, and the HTTP status and `Retry-After` header are on `response`.

`data` and `error` are a discriminated pair, so `data` is typed as possibly undefined until `error` is checked; a `strict` project narrows with `if (error)` first. Pass `throwOnError: true` in any call to have failures throw instead, which makes `data` non-optional on that call.

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

## TypeScript

Every request and response is fully typed. IDE autocomplete shows available methods per domain and exact parameter shapes. No docs tab needed.

## Links

- [Documentation](https://roxyapi.com/docs)
- [API Reference](https://roxyapi.com/api-reference)
- [Pricing](https://roxyapi.com/pricing)
- [MCP setup for AI agents](https://roxyapi.com/docs/mcp)
- [Templates](https://roxyapi.com/templates)
- [Issues](https://github.com/RoxyAPI/sdk-typescript/issues)
- Other SDKs: [Python](https://pypi.org/project/roxy-sdk/), [PHP](https://packagist.org/packages/roxyapi/sdk), [.NET](https://www.nuget.org/packages/RoxyApi.Sdk), [Go](https://pkg.go.dev/github.com/RoxyAPI/sdk-go), [Rust](https://crates.io/crates/roxyapi)

## License

MIT
