/** Retry options for `createRoxy`. Retries are on by default; `maxRetries: 0` turns them off. */
export interface RetryOptions {
	/** Retries after the first attempt. Default 2; 0 never retries. */
	maxRetries?: number;
	/** Base of the backoff and the jitter added to a `Retry-After` wait, in milliseconds. Default 500. */
	initialDelayMs?: number;
	/** Longest wait in milliseconds. A `Retry-After` above it is not waited for. Default 30000. */
	maxDelayMs?: number;
}

/** Injection points, so a test controls the transport, the clock and the randomness. */
export interface RetryDeps {
	fetch?: (request: Request) => Promise<Response>;
	sleep?: (ms: number, signal: AbortSignal) => Promise<void>;
	random?: () => number;
}

const RETRY_STATUSES = new Set([429, 500, 502, 503, 504]);
/** Connection errors raised before any byte of the request is sent. */
const NEVER_SENT_CODES = new Set(['ECONNREFUSED', 'ENOTFOUND', 'EAI_AGAIN']);

/**
 * The wait a response asks for in its `Retry-After` header, in seconds, or `undefined` when absent.
 * Reads both the seconds form and the HTTP-date form.
 *
 * @example
 * const { error, response } = await roxy.astrology.getDailyHoroscope({ path: { sign: 'aries' } });
 * if (error) console.log(error.code, retryAfterSeconds(response));
 */
export function retryAfterSeconds(
	response: Response | undefined,
	now: number = Date.now(),
): number | undefined {
	const value = response?.headers.get('Retry-After')?.trim();
	if (!value) return undefined;
	if (/^\d+$/.test(value)) return Number(value);
	const date = Date.parse(value);
	return Number.isNaN(date) ? undefined : Math.max(0, (date - now) / 1000);
}

function neverSent(err: unknown): boolean {
	const code = (err as { cause?: { code?: string } })?.cause?.code;
	return code !== undefined && NEVER_SENT_CODES.has(code);
}

function sleepUnlessAborted(ms: number, signal: AbortSignal): Promise<void> {
	return new Promise((resolve, reject) => {
		const timer = setTimeout(() => {
			signal.removeEventListener('abort', onAbort);
			resolve();
		}, ms);
		const onAbort = () => {
			clearTimeout(timer);
			reject(signal.reason);
		};
		signal.addEventListener('abort', onAbort, { once: true });
	});
}

/**
 * Wrap `fetch` so a 429, 500, 502, 503 or 504, or a connection that was never made, is sent again.
 * Every attempt sends a clone of the request, so a body replays. A wait never outlives the
 * request's abort signal: an abort surfaces the last response instead.
 */
export function createRetryFetch(
	options: RetryOptions,
	deps: RetryDeps = {},
): (input: RequestInfo | URL, init?: RequestInit) => Promise<Response> {
	const maxRetries = options.maxRetries ?? 2;
	const initialDelayMs = options.initialDelayMs ?? 500;
	const maxDelayMs = options.maxDelayMs ?? 30_000;
	const send = deps.fetch ?? ((request: Request) => globalThis.fetch(request));
	const sleep = deps.sleep ?? sleepUnlessAborted;
	const random = deps.random ?? Math.random;

	return async (input, init) => {
		const request = new Request(input, init);
		for (let attempt = 0; ; attempt++) {
			const last = attempt >= maxRetries;
			let response: Response | undefined;
			try {
				response = await send(last ? request : request.clone());
			} catch (err) {
				if (last || !neverSent(err) || request.signal.aborted) throw err;
			}
			const backoff =
				random() * Math.min(maxDelayMs, initialDelayMs * 2 ** attempt);
			let delayMs = backoff;
			if (response) {
				if (last || !RETRY_STATUSES.has(response.status)) return response;
				const wait = retryAfterSeconds(response);
				if (wait !== undefined) {
					if (wait * 1000 > maxDelayMs) return response;
					delayMs = Math.min(
						maxDelayMs,
						wait * 1000 + random() * initialDelayMs,
					);
				}
			}
			try {
				await sleep(delayMs, request.signal);
			} catch {
				if (response) return response;
				throw request.signal.reason;
			}
			// Release the connection held by the discarded response, only once it is certain to be discarded.
			await response?.body?.cancel().catch(() => {});
		}
	};
}
