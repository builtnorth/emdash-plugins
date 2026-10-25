// Browser check of the plugins against the playground (`pnpm dev`, http://localhost:4331).
import { mkdirSync } from "node:fs";
import { chromium } from "playwright";

const base = "http://localhost:4331";
const out = "e2e-output";
mkdirSync(out, { recursive: true });
let failures = 0;
const step = (name) => console.log(`- ${name}`);
const check = (ok, message) => {
	console.log(`  ${ok ? "ok  " : "FAIL"} ${message}`);
	if (!ok) failures++;
};
const errors = [];
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1400, height: 1000 } });
page.on("pageerror", (error) => errors.push(error.message));
page.on("console", (message) => message.type() === "error" && errors.push(message.text()));

try {
	await page.goto(`${base}/_emdash/api/setup/dev-bypass?redirect=/_emdash/admin`);
	await page.waitForURL(/\/_emdash\/admin\/?$/);
	await page.waitForLoadState("networkidle");
	// EmDash's welcome dialog shows on each page until it's dismissed.
	const dismissWelcome = async () => {
		// It appears a moment after the page loads.
		const welcome = page.getByRole("button", { name: "Get Started" });
		if (await welcome.waitFor({ state: "visible", timeout: 6000 }).then(() => true, () => false)) {
			await welcome.click();
			await welcome.waitFor({ state: "hidden" });
		}
	};
	await dismissWelcome();

	const settings = async (values) => {
		await page.goto(`${base}/_emdash/admin/plugins-manager/environment-indicator/settings`);
		await dismissWelcome();
		for (const [label, value] of Object.entries(values)) await page.getByLabel(label).fill(value);
		await page.getByRole("button", { name: "Save Settings" }).first().click();
		await page.waitForLoadState("networkidle");
	};
	const widget = async () => {
		await page.goto(`${base}/_emdash/admin`);
		await dismissWelcome();
		const card = page.getByText("Environment", { exact: true }).locator("xpath=ancestor::*[.//p or .//div][2]");
		await page.getByText(/^(Development|Staging|Production)$/).first().waitFor({ timeout: 20000 });
		return (await card.innerText()).replace(/\s+/g, " ");
	};

	step("environment indicator: the dashboard widget");
	await settings({ "Staging hostnames": "", "Production hostnames": "", "Development hostnames": "" });
	let text = await widget();
	check(text.includes("Development") && text.includes("Nothing you do here reaches the live site") && text.includes("localhost is in the common local hostnames"), `localhost is development (${text})`);
	await page.screenshot({ path: `${out}/environment-development.png` });

	step("hostnames from the plugin's settings");
	await settings({ "Staging hostnames": "localhost" });
	text = await widget();
	check(text.includes("Staging") && text.includes("Pre-release copy") && text.includes("localhost is in Staging hostnames"), `a hostname listed as staging is staging (${text})`);
	await page.screenshot({ path: `${out}/environment-staging.png` });
	await settings({ "Production hostnames": "localhost" });
	text = await widget();
	check(text.includes("Production") && text.includes("Published changes are public immediately") && text.includes("localhost is in Production hostnames"), `production hostnames come first (${text})`);
	await page.screenshot({ path: `${out}/environment-production.png` });

	await settings({ "Staging hostnames": "", "Production hostnames": "" });
	check(errors.length === 0, `no page errors${errors.length ? `: ${errors.join(" | ")}` : ""}`);
} catch (error) {
	failures++;
	console.log(`FAIL ${error.message.split("\n")[0]}`);
	await page.screenshot({ path: `${out}/failure.png` });
} finally {
	await browser.close();
}
process.exit(failures ? 1 : 0);
