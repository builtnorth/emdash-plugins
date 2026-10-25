import type { Block } from "@emdash-cms/blocks";
import type { Detection, Environment } from "./detect.ts";

const TITLES: Record<Environment, string> = { development: "Development", staging: "Staging", production: "Production" };

const DESCRIPTIONS: Record<Environment, string> = {
	development: "Changes here aren't live.",
	staging: "For testing. Changes here aren't live.",
	production: "This is the live site.",
};

/** Banner variants by environment: production stands out, as the one to be careful with. */
const VARIANTS: Record<Environment, "default" | "alert" | "error"> = { development: "default", staging: "alert", production: "error" };

const SOURCES: Record<Detection["source"], (host: string) => string> = {
	variable: () => "Set by EMDASH_ENVIRONMENT.",
	hostname: (host) => `${host} is listed in the plugin's settings.`,
	"local hostname": (host) => `${host} is a local address.`,
	default: (host) => `${host} isn't listed in the plugin's settings.`,
};

/** The dashboard widget: which environment this is, and how that was decided. */
export function environmentWidget(detection: Detection, hostname: string): Block[] {
	return [
		{ type: "banner", title: TITLES[detection.environment], description: DESCRIPTIONS[detection.environment], variant: VARIANTS[detection.environment] },
		{ type: "context", text: SOURCES[detection.source](hostname) },
	];
}
