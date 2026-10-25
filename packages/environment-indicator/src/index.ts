import type { PluginDescriptor } from "emdash";

export const PLUGIN_ID = "environment-indicator";

/**
 * Shows which environment the site is (development, staging or production) on the EmDash dashboard.
 * Add to `emdash({ plugins: [environmentIndicator()] })`. Set `EMDASH_ENVIRONMENT` on each deployment,
 * or list each environment's hostnames in the plugin's settings.
 */
export function environmentIndicator(): PluginDescriptor {
	return {
		id: PLUGIN_ID,
		version: "0.0.0",
		format: "standard",
		entrypoint: "@kitaris/emdash-environment-indicator/plugin",
		adminWidgets: [{ id: "environment", title: "Environment", size: "full" }],
		settingsSchema: {
			stagingHosts: {
				type: "string",
				label: "Staging hostnames",
				description: "One per line. * matches any part, e.g. staging.example.com or *.staging.example.com.",
				multiline: true,
			},
			productionHosts: {
				type: "string",
				label: "Production hostnames",
				description: "One per line. Anything not listed as development or staging is taken as production anyway.",
				multiline: true,
			},
			developmentHosts: {
				type: "string",
				label: "Development hostnames",
				description: "One per line, besides local ones (localhost, *.local, *.test, ...), which are always development.",
				multiline: true,
			},
		},
	};
}

export { detectEnvironment, type Detection, type Environment } from "./detect.ts";
