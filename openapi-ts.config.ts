import { defineConfig, OperationPath } from "@hey-api/openapi-ts";

/**
 * Converts a kebab-case path segment to camelCase.
 * e.g., "angel-numbers" -> "angelNumbers", "vedic-astrology" -> "vedicAstrology"
 */
function kebabToCamel(s: string): string {
	return s.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
}

export default defineConfig({
	input: "./specs/openapi.json",
	output: {
		path: "src",
	},
	plugins: [
		"@hey-api/typescript",
		{
			name: "@hey-api/sdk",
			operations: {
				strategy: "single",
				containerName: "Roxy",
				nesting(operation) {
					const path = operation.path as string;
					const segment = path.split("/").filter(Boolean)[0];
					if (!segment) {
						return OperationPath.id()(operation);
					}
					const namespace = kebabToCamel(segment);
					const operationId = operation.operationId ?? operation.id;
					return [namespace, operationId];
				},
			},
		},
		"@hey-api/client-fetch",
	],
});
