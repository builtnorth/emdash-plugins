import type { Block } from "@emdash-cms/blocks";
import type { Detection, Environment } from "./detect.ts";

const TITLES: Record<Environment, string> = { development: "Development", staging: "Staging", production: "Production" };

const DESCRIPTIONS: Record<Environment, string> = {
	development: "Local build. Nothing you do here reaches the live site.",
	staging: "Pre-release copy for testing before you deploy.",
	production: "Live site. Published changes are public immediately.",
};

/** Banner variants by environment: production stands out, as the one to be careful with. */
const VARIANTS: Record<Environment, "default" | "alert" | "error"> = { development: "default", staging: "alert", production: "error" };

/** How the environment was decided, for developers: what matched, and where to change it. */
function sourceText({ environment, source, match }: Detection, host: string): string {
	const matched = (where: string) => (match && match !== host ? `${host} matched ${match} in ${where}.` : `${host} is in ${where}.`);
	switch (source) {
		case "variable":
			return `Set by EMDASH_ENVIRONMENT=${match}.`;
		case "hostname":
			return matched(`${TITLES[environment]} hostnames`);
		case "local hostname":
			return matched("the common local hostnames");
		case "default":
			return `${host} matched no rule, so it defaults to production. Set EMDASH_ENVIRONMENT or add the hostname in the plugin's settings.`;
	}
}

/** The dashboard widget: which environment this is, and how that was decided. */
export function environmentWidget(detection: Detection, hostname: string): Block[] {
	return [
		{ type: "banner", title: TITLES[detection.environment], description: DESCRIPTIONS[detection.environment], variant: VARIANTS[detection.environment] },
		{ type: "context", text: sourceText(detection, hostname) },
	];
}
