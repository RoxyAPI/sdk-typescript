# Publishing @roxyapi/sdk

## Initial npm publish (first time only)

```bash
bun run generate
bun run build
bun run test
npm publish --access public
```

## GitHub secrets

### NPM_TOKEN (required for CI releases)

1. Go to npmjs.com > Access Tokens > Granular Access Token
2. Scope: `@roxyapi/sdk`, read + write
3. Set the secret:

```bash
gh secret set NPM_TOKEN --repo roxyapi/sdk-typescript
```

### GITHUB_TOKEN

Built-in, no setup required. The release workflow uses the default token with `contents: write` permission.

## Triggering a manual release

```bash
gh workflow run release.yml --repo roxyapi/sdk-typescript -f version_bump=patch
```

Replace `patch` with `minor` or `major` as needed.

## Automated releases

The release workflow runs:
- **Daily** at 06:00 UTC (cron schedule) -- only publishes if the OpenAPI spec changed
- **On `repository_dispatch`** with type `openapi-updated` -- triggered by the server repo after deploy
- **On `workflow_dispatch`** -- manual trigger, always publishes regardless of spec changes

## Connecting the server repo (future step)

Add a step to the server deploy workflow that sends a `repository_dispatch` event:

```yaml
- name: Notify SDK repo
  run: |
    gh api repos/roxyapi/sdk-typescript/dispatches \
      -f event_type=openapi-updated
  env:
    GH_TOKEN: ${{ secrets.SDK_REPO_TOKEN }}
```

`SDK_REPO_TOKEN` is a fine-grained PAT with `contents: write` on `roxyapi/sdk-typescript`. Set it in the server repo secrets:

```bash
gh secret set SDK_REPO_TOKEN --repo roxyapi/roxyapi-simple
```

## Version bump convention

| Bump | When |
|------|------|
| `patch` | Description changes, bug fixes, no new endpoints |
| `minor` | New endpoint or response field added |
| `major` | Breaking type change (field renamed or removed) |

## New API packages

No config change needed. The combined spec at `/api/v2/openapi.json` automatically includes all registered packages. Namespace is derived from the URL path segment (e.g., `/crystals/` becomes `roxy.crystals`).
