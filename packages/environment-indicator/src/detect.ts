/**
 * Which environment a site is running in: development, staging or production. From an explicit
 * variable when the deployment sets one (EMDASH_ENVIRONMENT), else from the site's hostname: the
 * hostnames configured for each environment, then common local ones, else production.
 *
 * Plain data, no dependencies.
 */

export type Environment = "development" | "staging" | "production";

export interface HostRules {
	development?: string;
	staging?: string;
	production?: string;
}

export interface Detection {
	environment: Environment;
	/** How it was decided, for the widget to say. */
	source: "variable" | "hostname" | "local hostname" | "default";
}

/** Hostnames that are local unless configured otherwise. */
export const LOCAL_HOSTS = ["localhost", "127.0.0.1", "[::1]", "*.localhost", "*.local", "*.test"];

/** The values the variable accepts for each environment. */
const ALIASES: Record<string, Environment> = {
	development: "development",
	dev: "development",
	local: "development",
	staging: "staging",
	stage: "staging",
	preview: "staging",
	production: "production",
	prod: "production",
	live: "production",
};

/** An environment named in the variable, or undefined (unset or not a name it knows). */
export function environmentFromVariable(value: string | undefined): Environment | undefined {
	return value ? ALIASES[value.trim().toLowerCase()] : undefined;
}

/** Hostname patterns from a setting: one per line or comma separated; `*` matches any part. */
export function parsePatterns(value: string | undefined): string[] {
	return (value ?? "")
		.split(/[\n,]/)
		.map((pattern) => pattern.trim().toLowerCase())
		.filter(Boolean);
}

/** Whether a hostname matches a pattern such as `staging.example.com` or `*.staging.example.com`. */
export function matchesHost(hostname: string, pattern: string): boolean {
	const escaped = pattern.replace(/[.+?^${}()|[\]\\]/g, "\\$&").replace(/\*/g, "[^.]+(?:\\.[^.]+)*");
	return new RegExp(`^${escaped}$`, "i").test(hostname);
}

/**
 * The environment, from the variable if it names one, else the hostname: configured production, then
 * staging, then development hostnames, then common local ones; anything else is production.
 */
export function detectEnvironment({ variable, hostname, rules = {} }: { variable?: string; hostname: string; rules?: HostRules }): Detection {
	const named = environmentFromVariable(variable);
	if (named) return { environment: named, source: "variable" };
	const host = hostname.toLowerCase();
	for (const environment of ["production", "staging", "development"] as const) {
		if (parsePatterns(rules[environment]).some((pattern) => matchesHost(host, pattern))) return { environment, source: "hostname" };
	}
	if (LOCAL_HOSTS.some((pattern) => matchesHost(host, pattern))) return { environment: "development", source: "local hostname" };
	return { environment: "production", source: "default" };
}
