import type { SandboxedPlugin } from "emdash/plugin";
import { detectEnvironment, type HostRules } from "./detect.ts";
import { environmentWidget } from "./widget.ts";

/** The deployment's variable, where the plugin can read it (in-process; sandboxed plugins can't). */
function variable(): string | undefined {
	const env = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env;
	return env?.EMDASH_ENVIRONMENT;
}

/**
 * The plugin: a dashboard widget saying which environment the site is (Block Kit, so it also runs
 * sandboxed). Hostname rules come from the plugin's settings.
 */
const plugin: SandboxedPlugin = {
	routes: {
		admin: {
			handler: async (routeCtx, ctx) => {
				const input = routeCtx.input as { type?: string; page?: string } | undefined;
				if (input?.type !== "page_load" || input.page !== "widget:environment") return { blocks: [] };
				const hostname = new URL(routeCtx.request.url).hostname;
				const rules: HostRules = {
					development: (await ctx.settings.get<string>("developmentHosts")) ?? undefined,
					staging: (await ctx.settings.get<string>("stagingHosts")) ?? undefined,
					production: (await ctx.settings.get<string>("productionHosts")) ?? undefined,
				};
				return { blocks: environmentWidget(detectEnvironment({ variable: variable(), hostname, rules }), hostname) };
			},
		},
	},
};

export default plugin;
