// Builds the package in the current directory for publishing: TypeScript to dist/ (JS, declarations,
// source maps), plus the files TypeScript doesn't handle (CSS, Astro components, hand-written .d.ts),
// with Astro components' relative .ts imports pointed at the built .js. The workspace itself uses the
// sources; the published exports (publishConfig, see sync-publish-config.mjs) point at dist/.
import { execFileSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join, relative } from "node:path";

const root = process.cwd();
const src = join(root, "src");
const dist = join(root, "dist");
rmSync(dist, { recursive: true, force: true });
// The repository's TypeScript, whatever the PATH.
const tsc = createRequire(import.meta.url).resolve("typescript/bin/tsc");
execFileSync(process.execPath, [tsc, "-p", "tsconfig.build.json"], { stdio: "inherit" });

const copied = [];
const walk = (dir) => {
	for (const name of readdirSync(dir)) {
		const path = join(dir, name);
		if (statSync(path).isDirectory()) walk(path);
		else if (/\.(css|astro)$|\.d\.ts$/.test(name) && !/\.test\./.test(name)) {
			const target = join(dist, relative(src, path));
			mkdirSync(dirname(target), { recursive: true });
			if (name.endsWith(".astro")) {
				// Relative imports of TypeScript modules -> their built JavaScript.
				writeFileSync(target, readFileSync(path, "utf8").replace(/(from\s+["'](?:\.{1,2}\/)[^"']*?)\.tsx?(["'])/g, "$1.js$2"));
			} else cpSync(path, target);
			copied.push(relative(root, target));
		}
	}
};
if (existsSync(src)) walk(src);
console.log(`${relative(process.cwd(), dist)}: built, ${copied.length} files copied`);
