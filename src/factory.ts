/**
 * Hand-written entry point — NOT auto-generated. Safe to edit.
 * Re-exports all generated SDK classes and types, plus the createRoxy factory.
 */

export { type ErrorCode, ErrorCodes } from './error-codes.gen.js';
export * from './index.js';

import { createClient, createConfig } from './client/index.js';
import { createRetryFetch, type RetryOptions } from './retry.js';
import { Roxy } from './sdk.gen.js';
import { VERSION } from './version.js';

export { type RetryOptions, retryAfterSeconds } from './retry.js';

type AuthToken = string | (() => Promise<string> | string);

/**
 * Create a configured Roxy instance. API key is required.
 * Sets default baseUrl. A request is resent up to twice after a 429, 500, 502,
 * 503 or 504; pass `{ maxRetries: 0 }` to turn that off.
 *
 * @example
 * const roxy = createRoxy(process.env.ROXY_API_KEY!);
 * const { data } = await roxy.tarot.getDailyCard();
 *
 * @example
 * const roxy = createRoxy(process.env.ROXY_API_KEY!, { maxRetries: 0 });
 */
export function createRoxy(auth: AuthToken, retry: RetryOptions = {}): Roxy {
	const client = createClient(
		createConfig({
			baseUrl: 'https://roxyapi.com/api/v2',
			auth,
			...(retry.maxRetries === 0 ? {} : { fetch: createRetryFetch(retry) }),
			headers: {
				'X-SDK-Client': `roxy-sdk-typescript/${VERSION}`,
			},
		}),
	);
	return new Roxy({ client });
}
