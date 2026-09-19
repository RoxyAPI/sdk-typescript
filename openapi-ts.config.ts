import { defineConfig } from '@hey-api/openapi-ts';
import { pathNamespace } from './scripts/namespace';

export default defineConfig({
	input: './specs/openapi.json',
	output: {
		path: 'src',
		clean: false,
		// Node ESM resolution (`moduleResolution: NodeNext`) needs fully specified relative imports.
		// Without this every `.d.ts` re-export silently fails to resolve there and the SDK types collapse to `any`.
		importFileExtension: '.js',
	},
	plugins: [
		'@hey-api/typescript',
		{
			name: '@hey-api/sdk',
			operations: {
				strategy: 'single',
				containerName: 'Roxy',
				nesting: (operation) => [
					pathNamespace(operation.path as string),
					operation.operationId ?? operation.id,
				],
			},
		},
		'@hey-api/client-fetch',
	],
});
