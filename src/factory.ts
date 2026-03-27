/**
 * Hand-written entry point — NOT auto-generated. Safe to edit.
 * Re-exports all generated SDK classes and types, plus the createRoxy factory.
 */
export * from './index';

import { createClient, createConfig } from './client';
import { Roxy } from './sdk.gen';
import { VERSION } from './version';

type AuthToken = string | (() => Promise<string> | string);

/**
 * Create a configured Roxy instance. API key is required.
 * Sets default baseUrl
 *
 * @example
 * const roxy = createRoxy(process.env.ROXY_API_KEY!);
 * const { data } = await roxy.tarot.getDailyCard();
 */
export function createRoxy(auth: AuthToken): Roxy {
	const client = createClient(
		createConfig({
			baseUrl: 'https://roxyapi.com/api/v2',
			auth,
			headers: {
				'X-SDK-Client': `roxy-sdk-typescript/${VERSION}`,
			},
		}),
	);
	return new Roxy({ client });
}
