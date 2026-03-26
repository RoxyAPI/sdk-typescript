import { describe, expect, it } from 'vitest';
import {
	AngelNumbers,
	Astrology,
	Crystals,
	Dreams,
	Iching,
	Location,
	Numerology,
	Roxy,
	Tarot,
	Usage,
	VedicAstrology,
} from '../src';

describe('SDK exports', () => {
	it('exports Roxy class', () => {
		expect(Roxy).toBeDefined();
		expect(typeof Roxy).toBe('function');
	});

	it('exports all namespace classes', () => {
		expect(AngelNumbers).toBeDefined();
		expect(Astrology).toBeDefined();
		expect(VedicAstrology).toBeDefined();
		expect(Tarot).toBeDefined();
		expect(Numerology).toBeDefined();
		expect(Dreams).toBeDefined();
		expect(Iching).toBeDefined();
		expect(Crystals).toBeDefined();
		expect(Location).toBeDefined();
		expect(Usage).toBeDefined();
	});
});

describe('Roxy class', () => {
	it('can be instantiated', () => {
		const roxy = new Roxy();
		expect(roxy).toBeInstanceOf(Roxy);
	});

	it('exposes all domain namespaces as getters', () => {
		const roxy = new Roxy();

		expect(roxy.angelNumbers).toBeInstanceOf(AngelNumbers);
		expect(roxy.astrology).toBeInstanceOf(Astrology);
		expect(roxy.vedicAstrology).toBeInstanceOf(VedicAstrology);
		expect(roxy.tarot).toBeInstanceOf(Tarot);
		expect(roxy.numerology).toBeInstanceOf(Numerology);
		expect(roxy.dreams).toBeInstanceOf(Dreams);
		expect(roxy.iching).toBeInstanceOf(Iching);
		expect(roxy.crystals).toBeInstanceOf(Crystals);
		expect(roxy.location).toBeInstanceOf(Location);
		expect(roxy.usage).toBeInstanceOf(Usage);
	});

	it('lazily initializes namespace instances', () => {
		const roxy = new Roxy();
		const first = roxy.astrology;
		const second = roxy.astrology;
		expect(first).toBe(second);
	});
});

describe('namespace methods exist', () => {
	const roxy = new Roxy();

	it('angelNumbers has expected methods', () => {
		expect(typeof roxy.angelNumbers.listAngelNumbers).toBe('function');
		expect(typeof roxy.angelNumbers.getAngelNumber).toBe('function');
		expect(typeof roxy.angelNumbers.analyzeNumberSequence).toBe('function');
		expect(typeof roxy.angelNumbers.getDailyAngelNumber).toBe('function');
	});

	it('astrology has expected methods', () => {
		expect(typeof roxy.astrology.listZodiacSigns).toBe('function');
		expect(typeof roxy.astrology.generateNatalChart).toBe('function');
		expect(typeof roxy.astrology.getDailyHoroscope).toBe('function');
		expect(typeof roxy.astrology.calculateSynastry).toBe('function');
		expect(typeof roxy.astrology.getCurrentMoonPhase).toBe('function');
	});

	it('vedicAstrology has expected methods', () => {
		expect(typeof roxy.vedicAstrology.generateBirthChart).toBe('function');
		expect(typeof roxy.vedicAstrology.generateKpChart).toBe('function');
		expect(typeof roxy.vedicAstrology.getCurrentDasha).toBe('function');
		expect(typeof roxy.vedicAstrology.listNakshatras).toBe('function');
	});

	it('tarot has expected methods', () => {
		expect(typeof roxy.tarot.listCards).toBe('function');
		expect(typeof roxy.tarot.castCelticCross).toBe('function');
		expect(typeof roxy.tarot.castYesNo).toBe('function');
		expect(typeof roxy.tarot.drawCards).toBe('function');
	});

	it('numerology has expected methods', () => {
		expect(typeof roxy.numerology.calculateLifePath).toBe('function');
		expect(typeof roxy.numerology.calculateExpression).toBe('function');
		expect(typeof roxy.numerology.generateNumerologyChart).toBe('function');
	});

	it('crystals has expected methods', () => {
		expect(typeof roxy.crystals.listCrystals).toBe('function');
		expect(typeof roxy.crystals.getCrystal).toBe('function');
		expect(typeof roxy.crystals.getDailyCrystal).toBe('function');
	});

	it('iching has expected methods', () => {
		expect(typeof roxy.iching.listHexagrams).toBe('function');
		expect(typeof roxy.iching.castReading).toBe('function');
		expect(typeof roxy.iching.getHexagram).toBe('function');
	});

	it('dreams has expected methods', () => {
		expect(typeof roxy.dreams.searchDreamSymbols).toBe('function');
		expect(typeof roxy.dreams.getDreamSymbol).toBe('function');
	});

	it('location has expected methods', () => {
		expect(typeof roxy.location.listCountries).toBe('function');
		expect(typeof roxy.location.searchCities).toBe('function');
	});

	it('usage has expected methods', () => {
		expect(typeof roxy.usage.getUsageStats).toBe('function');
	});
});
