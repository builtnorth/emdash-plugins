import { describe, expect, it } from "vitest";
import { detectEnvironment, environmentFromVariable, matchesHost, parsePatterns } from "./detect.ts";

describe("detectEnvironment", () => {
	it("takes the variable first, by name or alias", () => {
		expect(detectEnvironment({ variable: "staging", hostname: "example.com" })).toEqual({ environment: "staging", source: "variable", match: "staging" });
		expect(detectEnvironment({ variable: " PROD ", hostname: "localhost" })).toEqual({ environment: "production", source: "variable", match: "PROD" });
		expect(environmentFromVariable("preview")).toBe("staging");
		expect(environmentFromVariable("qa")).toBeUndefined();
	});

	it("falls back to the configured hostnames, production first", () => {
		const rules = { staging: "staging.example.com, *.staging.example.com", production: "example.com\nwww.example.com", development: "dev.example.com" };
		expect(detectEnvironment({ hostname: "staging.example.com", rules }).environment).toBe("staging");
		expect(detectEnvironment({ hostname: "pr-12.staging.example.com", rules })).toEqual({ environment: "staging", source: "hostname", match: "*.staging.example.com" });
		expect(detectEnvironment({ hostname: "www.example.com", rules })).toEqual({ environment: "production", source: "hostname", match: "www.example.com" });
		expect(detectEnvironment({ hostname: "dev.example.com", rules }).environment).toBe("development");
		expect(detectEnvironment({ variable: "nonsense", hostname: "staging.example.com", rules }).environment).toBe("staging");
	});

	it("knows common local hostnames, and calls anything else production", () => {
		for (const hostname of ["localhost", "127.0.0.1", "site.localhost", "mysite.local", "project.test"]) {
			expect(detectEnvironment({ hostname })).toMatchObject({ environment: "development", source: "local hostname" });
		}
		expect(detectEnvironment({ hostname: "site.localhost" }).match).toBe("*.localhost");
		expect(detectEnvironment({ hostname: "example.com" })).toEqual({ environment: "production", source: "default" });
	});
});

describe("hostname patterns", () => {
	it("match whole names, with * for one or more parts", () => {
		expect(matchesHost("a.b.example.com", "*.example.com")).toBe(true);
		expect(matchesHost("example.com", "*.example.com")).toBe(false);
		expect(matchesHost("example.com.evil.net", "example.com")).toBe(false);
		expect(matchesHost("staging-example.com", "staging.example.com")).toBe(false);
	});

	it("are read one per line or comma separated", () => {
		expect(parsePatterns(" A.com ,\n\nb.com ")).toEqual(["a.com", "b.com"]);
	});
});
