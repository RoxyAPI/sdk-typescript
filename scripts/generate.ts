#!/usr/bin/env bun
/**
 * Fetch the latest OpenAPI spec from RoxyAPI and regenerate the SDK.
 * Run with: bun run generate
 */
import { execSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';

const SPEC_URL = 'https://roxyapi.com/api/v2/openapi.json';
const SPEC_PATH = 'specs/openapi.json';

console.log('Fetching OpenAPI spec from', SPEC_URL);
const res = await fetch(SPEC_URL, { headers: { 'Cache-Control': 'no-cache' } });
if (!res.ok) throw new Error(`Fetch failed: ${res.status} ${res.statusText}`);

const spec = JSON.parse(await res.text());

// Patch server URL to absolute production URL so the generated default client
// works out of the box without users specifying baseUrl
if (spec.servers?.[0]?.url === '/api/v2') {
	spec.servers[0].url = 'https://roxyapi.com/api/v2';
}

mkdirSync('specs', { recursive: true });
writeFileSync(SPEC_PATH, JSON.stringify(spec, null, 2));
console.log('Spec saved to', SPEC_PATH);

console.log('Running hey-api generator...');
execSync('bunx openapi-ts', { stdio: 'inherit' });
console.log('SDK generated successfully.');
