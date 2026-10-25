# emdash-plugins

Small plugins for [EmDash](https://github.com/emdash-cms/emdash), published under `@kitaris`.

| Package | What it does |
| --- | --- |
| [`@kitaris/emdash-environment-indicator`](packages/environment-indicator) | Shows which environment a site is (development, staging or production) on the dashboard. |

Plugins are written in EmDash's standard format (Block Kit admin UI, settings), so they run installed
from npm (`emdash({ plugins: [...] })`) and can also run sandboxed.

## Development

Requires Node 24 (`.node-version`) and pnpm via corepack.

```sh
pnpm install
pnpm dev        # playground (a minimal EmDash site) at http://localhost:4331
pnpm test       # unit tests
pnpm typecheck
pnpm e2e        # browser check of the plugins, against a running `pnpm dev`
pnpm build      # each package to dist/
```

Sign in to the playground at http://localhost:4331/_emdash/api/setup/dev-bypass?redirect=/_emdash/admin.
Packages export their TypeScript sources in the workspace; packed or published they export `dist/`
(`publishConfig.exports`, from `node scripts/sync-publish-config.mjs`). Add a changeset (`pnpm changeset`)
to changes that affect a package.

## License

GPL-2.0-or-later.
