# @kitaris/emdash-environment-indicator

An [EmDash](https://github.com/emdash-cms/emdash) plugin that shows which environment a site is on the
dashboard: **Development**, **Staging** or **Production**, so nobody edits the live site thinking it's
staging (or the other way round).

## Install

```sh
pnpm add @kitaris/emdash-environment-indicator
```

```js
// astro.config.mjs
import { environmentIndicator } from "@kitaris/emdash-environment-indicator";

emdash({
	// ...
	plugins: [environmentIndicator()],
});
```

## How it knows

1. **`EMDASH_ENVIRONMENT`**, if the deployment sets it: `development` (or `dev`, `local`), `staging`
   (`stage`, `preview`) or `production` (`prod`, `live`). Read when the plugin runs in-process.
2. Otherwise **the site's hostname**, against the hostnames in the plugin's settings (Plugins →
   environment-indicator → Settings): production first, then staging, then development. One per line;
   `*` matches any part, e.g. `*.staging.example.com`.
3. Local hostnames (`localhost`, `127.0.0.1`, `*.localhost`, `*.local`, `*.test`) are development.
4. Anything else is production.

The widget says how it decided, e.g. "From the hostname staging.example.com, in the plugin's settings."
