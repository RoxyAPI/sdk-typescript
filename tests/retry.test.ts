import { readFileSync } from 'node:fs';
import { describe, expect, it, vi } from 'vitest';
import spec from '../specs/openapi.json';
import { createRoxy, type ErrorCode, ErrorCodes } from '../src/factory';
import { createRetryFetch, retryAfterSeconds } from '../src/retry';

const reply = (status: number, code: string, headers: HeadersInit = {}) =>
	new Response(JSON.stringify({ error: code, code }), {
		status,
		headers: { 'Content-Type': 'application/json', ...headers },
	});

/** A retrying fetch over a scripted transport, a recording sleep and a fixed random. */
function harness(
	responses: (Response | Error)[],
	options: Parameters<typeof createRetryFetch>[0],
	random = 0.5,
) {
	const send = vi.fn(async (_request: Request) => {
		const next = responses.shift();
		if (!next) throw new Error('transport exhausted');
		if (next instanceof Error) throw next;
		return next;
	});
	const sleeps: number[] = [];
	const retryFetch = createRetryFetch(options, {
		fetch: send,
		sleep: async (ms) => {
			sleeps.push(ms);
		},
		random: () => random,
	});
	const request = () =>
		new Request('https://roxyapi.com/api/v2/x', {
			method: 'POST',
			body: JSON.stringify({ a: 1 }),
		});
	return { send, sleeps, retryFetch, request };
}

describe('retries', () => {
	it('retries a 429 rate_limit_per_minute once with Retry-After, then succeeds', async () => {
		const h = harness(
			[
				reply(429, 'rate_limit_per_minute', { 'Retry-After': '1' }),
				new Response('{}', { status: 200 }),
			],
			{ maxRetries: 2 },
		);
		const res = await h.retryFetch(h.request());
		expect(res.status).toBe(200);
		expect(h.send).toHaveBeenCalledTimes(2);
		expect(h.sleeps).toEqual([1000 + 0.5 * 500]);
		const bodies = await Promise.all(h.send.mock.calls.map(([r]) => r.text()));
		expect(bodies).toEqual(['{"a":1}', '{"a":1}']);
	});

	it('does not retry rate_limit_exceeded when Retry-After exceeds the max delay', async () => {
		const h = harness(
			[reply(429, 'rate_limit_exceeded', { 'Retry-After': '86400' })],
			{ maxRetries: 3 },
		);
		const res = await h.retryFetch(h.request());
		expect(res.status).toBe(429);
		expect(h.send).toHaveBeenCalledTimes(1);
		expect(retryAfterSeconds(res)).toBe(86400);
	});

	it('retries a 503 compute_saturated with full jitter backoff', async () => {
		const h = harness(
			[
				reply(503, 'compute_saturated'),
				reply(503, 'compute_saturated'),
				new Response('{}', { status: 200 }),
			],
			{ maxRetries: 3 },
			1,
		);
		await h.retryFetch(h.request());
		expect(h.sleeps).toEqual([500, 1000]);
	});

	it('keeps jitter inside [0, min(max, initial * 2^attempt)]', async () => {
		const low = harness([reply(502, 'x'), reply(200, 'ok')], {}, 0);
		const lowFetch = createRetryFetch(
			{ maxRetries: 1, maxDelayMs: 800 },
			{
				fetch: low.send,
				sleep: async (ms) => void low.sleeps.push(ms),
				random: () => 0.999,
			},
		);
		await lowFetch(low.request());
		expect(low.sleeps[0]).toBeLessThanOrEqual(500);
		expect(low.sleeps[0]).toBeGreaterThanOrEqual(0);
	});

	it('retries a 500', async () => {
		const h = harness([reply(500, 'internal_error'), reply(200, 'ok')], {
			maxRetries: 3,
		});
		const res = await h.retryFetch(h.request());
		expect(res.status).toBe(200);
		expect(h.send).toHaveBeenCalledTimes(2);
	});

	it('never retries a 501 or a 4xx other than 429', async () => {
		for (const status of [400, 401, 501]) {
			const h = harness([reply(status, 'x')], { maxRetries: 3 });
			expect((await h.retryFetch(h.request())).status).toBe(status);
			expect(h.send).toHaveBeenCalledTimes(1);
		}
	});

	it('retries a refused connection but not other network errors', async () => {
		const refused = new TypeError('fetch failed', {
			cause: { code: 'ECONNREFUSED' },
		});
		const ok = harness([refused, new Response('{}')], { maxRetries: 1 });
		expect((await ok.retryFetch(ok.request())).status).toBe(200);

		const reset = new TypeError('fetch failed', {
			cause: { code: 'ECONNRESET' },
		});
		const bad = harness([reset], { maxRetries: 3 });
		await expect(bad.retryFetch(bad.request())).rejects.toBe(reset);
		expect(bad.send).toHaveBeenCalledTimes(1);
	});

	it('stops after maxRetries and returns the last response', async () => {
		const h = harness(
			[reply(503, 'compute_saturated'), reply(503, 'compute_saturated')],
			{ maxRetries: 1 },
		);
		expect((await h.retryFetch(h.request())).status).toBe(503);
		expect(h.send).toHaveBeenCalledTimes(2);
	});

	it('returns the response when the request is aborted during the wait', async () => {
		const controller = new AbortController();
		const send = vi.fn(async () => reply(503, 'compute_saturated'));
		const retryFetch = createRetryFetch(
			{ maxRetries: 3 },
			{
				fetch: send,
				sleep: async () => {
					controller.abort();
					throw controller.signal.reason;
				},
			},
		);
		const res = await retryFetch(
			new Request('https://roxyapi.com/api/v2/x', {
				signal: controller.signal,
			}),
		);
		expect(res.status).toBe(503);
		expect(send).toHaveBeenCalledTimes(1);
	});

	it('cancels a discarded response body, and leaves a returned one readable', async () => {
		const first = reply(503, 'compute_saturated');
		const h = harness([first, reply(200, 'ok')], { maxRetries: 1 });
		await h.retryFetch(h.request());
		expect(first.bodyUsed).toBe(true);
		await expect(first.text()).rejects.toThrow();

		const kept = reply(429, 'rate_limit_exceeded', { 'Retry-After': '86400' });
		const k = harness([kept], { maxRetries: 1 });
		const res = await k.retryFetch(k.request());
		expect(await res.json()).toMatchObject({ code: 'rate_limit_exceeded' });
	});

	it('reads Retry-After as seconds or an HTTP date', () => {
		const now = Date.parse('2026-01-01T00:00:00Z');
		const at = (v: string) =>
			new Response(null, { headers: { 'Retry-After': v } });
		expect(retryAfterSeconds(at('7'))).toBe(7);
		expect(retryAfterSeconds(at('Thu, 01 Jan 2026 00:00:10 GMT'), now)).toBe(
			10,
		);
		expect(retryAfterSeconds(at('garbage'))).toBeUndefined();
		expect(retryAfterSeconds(new Response(null))).toBeUndefined();
	});
});

describe('createRoxy retries', () => {
	const saturated = () =>
		reply(503, 'compute_saturated', { 'Retry-After': '0' });

	it('retries twice by default, then returns the error', async () => {
		const fetchMock = vi.fn(async () => saturated());
		vi.stubGlobal('fetch', fetchMock);
		const { error, response } = await createRoxy(
			'k',
		).astrology.getDailyHoroscope({ path: { sign: 'aries' } });
		expect(fetchMock).toHaveBeenCalledTimes(3);
		expect(response?.status).toBe(503);
		expect(error).toMatchObject({ code: 'compute_saturated' });
		vi.unstubAllGlobals();
	});

	it('never retries with maxRetries: 0', async () => {
		const fetchMock = vi.fn(async () => saturated());
		vi.stubGlobal('fetch', fetchMock);
		await createRoxy('k', { maxRetries: 0 }).astrology.getDailyHoroscope({
			path: { sign: 'aries' },
		});
		expect(fetchMock).toHaveBeenCalledTimes(1);
		vi.unstubAllGlobals();
	});

	it('retries through the client when maxRetries is set', async () => {
		const fetchMock = vi
			.fn<(r: Request) => Promise<Response>>()
			.mockResolvedValueOnce(
				reply(503, 'compute_saturated', { 'Retry-After': '0' }),
			)
			.mockResolvedValueOnce(
				new Response('{"sign":"aries"}', {
					headers: { 'Content-Type': 'application/json' },
				}),
			);
		vi.stubGlobal('fetch', fetchMock);
		const { data } = await createRoxy('k', {
			maxRetries: 1,
			initialDelayMs: 1,
		}).astrology.getDailyHoroscope({ path: { sign: 'aries' } });
		expect(fetchMock).toHaveBeenCalledTimes(2);
		expect(data).toEqual({ sign: 'aries' });
		vi.unstubAllGlobals();
	});
});

describe('ErrorCodes', () => {
	it('has exactly the spec codes as values', () => {
		expect(Object.values(ErrorCodes)).toEqual(
			spec.info['x-error-codes'].map((c) => c.code),
		);
		expect(ErrorCodes.RateLimitPerMinute).toBe('rate_limit_per_minute');
	});

	it('accepts an unknown future code in the ErrorCode type', () => {
		const known: ErrorCode = ErrorCodes.ComputeSaturated;
		const future: ErrorCode = 'a_code_added_later';
		expect([known, future]).toHaveLength(2);
	});
});

describe('the ERRORS docs region', () => {
	const codes = spec.info['x-error-codes'].map((c) => c.code);
	for (const file of ['README.md', 'AGENTS.md', 'docs/llms-full.txt']) {
		it(`${file} lists exactly the spec error codes in spec order`, async () => {
			const text = readFileSync(file, 'utf8');
			const region =
				text
					.split('<!-- BEGIN:ERRORS -->')[1]
					?.split('<!-- END:ERRORS -->')[0] ?? '';
			const listed = [
				...region.matchAll(/^\| (?:\d+|Any) \| `([^`]+)` \|/gm),
			].map((m) => m[1]);
			expect(listed).toEqual(codes);
		});
	}
});
