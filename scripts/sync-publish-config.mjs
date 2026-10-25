// Writes each package's publishConfig.exports from its exports: the workspace resolves the sources
// (src/*.ts), a published package the build (dist/*.js with .d.ts). `--check` fails instead of writing
// when they're out of step (CI).
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const check = process.argv.includes("--check");
const toDist = (path) => path.replace(/^\.\/src\//, "./dist/");
const built = (path) => {
	if (/\.tsx?$/.test(path) && !path.endsWith(".d.ts")) {
		const js = toDist(path).replace(/\.tsx?$/, ".js");
		return { types: js.replace(/\.js$/, ".d.ts"), default: js };
	}
	return toDist(path);
};
const mapExports = (value) => {
	if (typeof value === "string") return built(value);
	return Object.fromEntries(
		Object.entries(value).map(([condition, target]) => {
			const mapped = mapExports(target);
			// A condition's target with its own types: keep both under the condition.
			return [condition, condition === "types" && typeof mapped === "object" ? mapped.types : mapped];
		}),
	);
};

let stale = [];
for (const name of readdirSync("packages")) {
	const file = join("packages", name, "package.json");
	const pkg = JSON.parse(readFileSync(file, "utf8"));
	const exports = Object.fromEntries(Object.entries(pkg.exports).map(([key, value]) => [key, mapExports(value)]));
	const publishConfig = { ...pkg.publishConfig, exports };
	if (JSON.stringify(publishConfig) === JSON.stringify(pkg.publishConfig)) continue;
	if (check) stale.push(name);
	else writeFileSync(file, `${JSON.stringify({ ...pkg, publishConfig }, null, 2)}\n`);
}
if (stale.length) {
	console.error(`publishConfig.exports out of date in: ${stale.join(", ")}. Run: node scripts/sync-publish-config.mjs`);
	process.exit(1);
}
