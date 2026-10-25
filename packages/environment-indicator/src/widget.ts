import type { Block } from "@emdash-cms/blocks";
import type { Detection, Environment } from "./detect.ts";

const TITLES: Record<Environment, string> = { development: "Development", staging: "Staging", production: "Production" };

const DESCRIPTIONS: Record<Environment, string> = {
	development: "A development copy of the site. Changes here don't reach visitors.",
	staging: "The staging site, for checking changes before they go live. Visitors don't see it.",
	production: "The live site. Changes here are what visitors see.",
};

/** Banner variants by environment: production stands out, as the one to be careful with. */
const VARIANTS: Record<Environment, "default" | "alert" | "error"> = { development: "default", staging: "alert", production: "error" };

const SOURCES: Record<Detection["source"], (host: string) => string> = {
	variable: () => "Set by EMDASH_ENVIRONMENT.",
	hostname: (host) => `From the hostname ${host}, in the plugin's settings.`,
	"local hostname": (host) => `From the hostname ${host}, a local address.`,
	default: (host) => `${host} isn't listed as development or staging, so it's taken as production.`,
};

/** The dashboard widget: which environment this is, and how that was decided. */
export function environmentWidget(detection: Detection, hostname: string): Block[] {
	return [
		{ type: "banner", title: TITLES[detection.environment], description: DESCRIPTIONS[detection.environment], variant: VARIANTS[detection.environment] },
		{ type: "context", text: SOURCES[detection.source](hostname) },
	];
}
