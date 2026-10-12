// Checks the marketplaces and the plugin manifests before they reach main.
// A merge to main is a release: an unpinned marketplace installs whatever main
// holds on its next refresh, so a broken manifest reaches every user at once.
//
// Run: node .github/check-manifests.mjs

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const errors = [];

function readJson(path) {
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch (error) {
    errors.push(`${path}: ${error.message}`);
    return null;
  }
}

const claudeMarketplace = readJson(".claude-plugin/marketplace.json");
const codexMarketplace = readJson(".agents/plugins/marketplace.json");

const claudeEntry = claudeMarketplace?.plugins?.find((p) => p.name === "veriara");
const codexEntry = codexMarketplace?.plugins?.find((p) => p.name === "veriara");

if (!claudeEntry) errors.push(".claude-plugin/marketplace.json: no veriara entry");
if (!codexEntry) errors.push(".agents/plugins/marketplace.json: no veriara entry");

const pluginDir = claudeEntry?.source ?? "./plugins/veriara";

if (codexEntry && codexEntry.source?.path !== pluginDir) {
  errors.push(`the two marketplaces point at different plugin directories: ${pluginDir}, ${codexEntry.source?.path}`);
}

const claudeManifest = readJson(join(pluginDir, ".claude-plugin/plugin.json"));
const codexManifest = readJson(join(pluginDir, ".codex-plugin/plugin.json"));

const versions = {
  "Claude marketplace entry": claudeEntry?.version,
  "Claude manifest": claudeManifest?.version,
  "Codex manifest": codexManifest?.version,
};

if (new Set(Object.values(versions)).size !== 1) {
  errors.push(`versions disagree: ${JSON.stringify(versions)}`);
}

for (const [label, manifest] of [["Claude", claudeManifest], ["Codex", codexManifest]]) {
  if (manifest && manifest.name !== "veriara") {
    errors.push(`${label} manifest: name is ${manifest.name}, expected veriara`);
  }
}

const claudeServer = claudeManifest?.mcpServers?.veriara;
const codexServer = codexManifest?.mcpServers?.veriara;

if (!claudeServer?.url?.startsWith("https://")) errors.push("Claude manifest: veriara server needs an https url");
if (!codexServer?.url?.startsWith("https://")) errors.push("Codex manifest: veriara server needs an https url");

if (claudeServer?.url !== codexServer?.url) {
  errors.push(`the manifests point at different servers: ${claudeServer?.url}, ${codexServer?.url}`);
}

// Claude Code sends an unset ${NAME} as the literal text, which the server then
// reads as a credential; ${NAME:-} sends nothing in its place.
for (const [header, value] of Object.entries(claudeServer?.headers ?? {})) {
  for (const [, name] of String(value).matchAll(/\$\{([^}:]+)\}/g)) {
    errors.push(`Claude manifest: header ${header} uses \${${name}} without a default; write \${${name}:-}`);
  }
}

// Codex refuses to start a server whose bearer_token_env_var is unset and skips
// `codex mcp login` for it, so a user who signed in by browser would get no
// tools. env_http_headers leaves an unset variable's header out instead.
if (codexServer && "bearer_token_env_var" in codexServer) {
  errors.push("Codex manifest: bearer_token_env_var blocks browser sign-in; send the variable through env_http_headers");
}

const skill = join(pluginDir, "skills/veriara/SKILL.md");

if (!existsSync(skill)) {
  errors.push(`${skill} is missing`);
} else {
  const frontmatter = /^---\n([\s\S]*?)\n---/.exec(readFileSync(skill, "utf8").replace(/\r\n/g, "\n"));

  if (!/^name: veriara$/m.test(frontmatter?.[1] ?? "") || !/^description: \S/m.test(frontmatter?.[1] ?? "")) {
    errors.push(`${skill}: frontmatter needs name: veriara and a description`);
  }
}

if (errors.length > 0) {
  for (const error of errors) console.error(`error: ${error}`);
  process.exit(1);
}

console.log(`manifests ok: veriara ${claudeManifest.version}, ${claudeServer.url}`);
