import { afterEach, describe, expect, it, vi } from 'vitest';
import { pathNamespace } from '../scripts/namespace';
import spec from '../specs/openapi.json';
import { createRoxy, Roxy } from '../src/factory';
import { VERSION } from '../src/version';

type Operation = { operationId?: string; tags?: string[] };

/** Every operation of the committed spec: the only list the SDK surface is checked against. */
const operations = Object.entries(spec.paths).flatMap(([path, methods]) =>
	Object.values(methods as Record<string, Operation>).map((op) => ({
		path,
		namespace: pathNamespace(path),
		operationId: op.operationId,
		tag: op.tags?.[0],
	})),
);

describe('the generated surface mirrors the spec', () => {
	const roxy = new Roxy() as unknown as Record<string, Record<string, unknown>>;

	it('has a method for every operation, on the namespace of its path', () => {
		expect(operations.length).toBeGreaterThan(200);
		for (const { namespace, operationId } of operations) {
			expect(
				operationId,
				`${namespace} operation without operationId`,
			).toBeTruthy();
			expect(
				typeof roxy[namespace]?.[operationId as string],
				`roxy.${namespace}.${operationId}`,
			).toBe('function');
		}
	});

	it('maps each spec tag to exactly one namespace', () => {
		for (const { name } of spec.tags) {
			const namespaces = new Set(
				operations.filter((o) => o.tag === name).map((o) => o.namespace),
			);
			expect(namespaces.size, name).toBe(1);
		}
	});

	it('caches a namespace instance after first access', () => {
		const instance = new Roxy();
		expect(instance.astrology).toBe(instance.astrology);
	});
});

describe('createRoxy', () => {
	const json = (status: number, body: unknown) =>
		new Response(JSON.stringify(body), {
			status,
			headers: { 'Content-Type': 'application/json' },
		});

	afterEach(() => vi.unstubAllGlobals());

	it('calls the production base URL with the key and the SDK header', async () => {
		const fetchMock = vi.fn<(request: Request) => Promise<Response>>(async () =>
			json(200, { sign: 'aries' }),
		);
		vi.stubGlobal('fetch', fetchMock);

		const { data, error } = await createRoxy(
			'test-key',
		).astrology.getDailyHoroscope({ path: { sign: 'aries' } });

		expect(error).toBeUndefined();
		expect(data).toEqual({ sign: 'aries' });
		const request = fetchMock.mock.calls[0]?.[0];
		if (!request) throw new Error('fetch was not called');
		expect(request.url).toBe(
			'https://roxyapi.com/api/v2/astrology/horoscope/aries/daily',
		);
		expect(request.headers.get('X-API-Key')).toBe('test-key');
		expect(request.headers.get('X-SDK-Client')).toBe(
			`roxy-sdk-typescript/${VERSION}`,
		);
	});

	it('returns the API error shape instead of throwing on a non-2xx response', async () => {
		const body = { error: 'API key required', code: 'api_key_required' };
		vi.stubGlobal(
			'fetch',
			vi.fn(async () => json(401, body)),
		);

		const { data, error, response } = await createRoxy(
			'test-key',
		).astrology.getDailyHoroscope({ path: { sign: 'aries' } });

		expect(data).toBeUndefined();
		expect(error).toEqual(body);
		expect(response?.status).toBe(401);
	});
});
