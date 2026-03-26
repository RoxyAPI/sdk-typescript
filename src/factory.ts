/**
 * Hand-written entry point — NOT auto-generated. Safe to edit.
 * Re-exports all generated SDK classes and types, plus the createRoxy factory.
 */
export * from './index';

import { Roxy } from './sdk.gen';
import { createClient, createConfig } from './client';

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
				'X-SDK-Client': 'roxyapi-sdk-typescript/1.0.0',
			},
		}),
	);
	return new Roxy({ client });
}
