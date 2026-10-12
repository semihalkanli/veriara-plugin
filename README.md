# Veriara plugin for Claude and Codex

Ask Claude Code or Codex questions about your own business data. The plugin registers the
`veriara` MCP server, which is the Veriara agent API: the same tools, role authorization,
column masking, row filters and audit trail the Veriara chat uses, with the model running
on your own Claude or Codex subscription instead of ours.

```
Claude Code / Codex ── MCP over HTTPS ──> Veriara agent API ──> gateway ──> Veriara app
                       (your token)       (your role's tools)               (your databases
                                                                             and folders)
```

## What you get

The plugin user can do what the Veriara chat does, in the desktop app or on the web, on
every database and folder their role reaches in the running Veriara app:

| Tool | What it does |
|---|---|
| `veriara_guide` | the working guide for you: your role and its limits, business metrics, reports, table inventory, SQL rules. The model calls it first |
| `schema_search` | search the knowledge pack: tables, columns, enum codes, metric definitions |
| `db_schema` | the table and column reference of one connection |
| `metric_run` | run a defined business metric with optional `where` and `group_by` |
| `report_run` | run a predefined report with `params` |
| `db_query` | read-only SQL on a registered connection |
| `fs_list`, `fs_read`, `fs_search`, `doc_read` | list, read and search the workspace folders; `doc_read` renders xlsx, docx, pdf and csv readably |
| `fs_write`, `fs_edit`, `fs_delete` | change files in the workspace folders; `fs_write` with `mode: "append"` adds to the end of a file |
| `xlsx_write`, `docx_write` | produce an Excel or Word file from rows or Markdown |

The inventory is filtered to what your role may use. A table the role may not read is
refused, masked columns come back masked, and row filters are applied before the SQL runs.

Claude Code also lists three ready-made starting points as slash commands:
`/mcp__veriara__soru` (ask a business question), `/mcp__veriara__rapor` (run or list a
catalog report) and `/mcp__veriara__yetkilerim` (what my role reaches).

The guidance the model works under is served by Veriara, not stored in the plugin, so it
follows your role and your organization's knowledge pack without a plugin update.

## Prerequisites

- **A Veriara user** in your organization, with a role, and the **Veriara app** installed,
  running and connected on the machine that holds the databases (usually the
  organization's own).
- **Your Veriara session token**, the one you get by signing in to Veriara. Calls then run
  under your role and are audited under your name, as your chat turns are. Keep it as you
  would a password.

  During the development phase the **organization's API key** (`kgd_…`, the one the
  Veriara app signed in with) works too, and runs with no role restrictions at all. It
  will stop being accepted before launch.

## Claude and ChatGPT apps (desktop and web)

The plugin is not limited to the terminal. The same endpoint serves the desktop apps and
the web; there it signs you in through the browser instead of reading an environment
variable, so it works once browser sign-in opens (below).

- **Claude** (claude.ai, and the Chat, Cowork and Code tabs of the desktop app): Customize →
  Plugins → Add marketplace → `semihalkanli/veriara-plugin`, then install `veriara`. The
  install belongs to your account, so Claude Code sees it too. Open the plugin's
  Connectors tab and connect `veriara` to sign in. Without the plugin, add
  `https://gw.veriara.com/v1/mcp` under Settings → Connectors → Add custom connector. On a
  Team or Enterprise plan an Owner adds the plugin (Organization settings → Plugins &
  skills) and the connector (Organization settings → Connectors); you then connect with
  your own sign-in.
- **ChatGPT** (web and desktop): on a personal plan, turn on Developer mode (Settings →
  Security and login) and create an app with `https://gw.veriara.com/v1/mcp`. On Business,
  Enterprise or Edu a workspace admin publishes it for the workspace, and you use it
  without Developer mode.

In the chat a tool call shows as one short line with a Turkish label, "SQL sorgusu",
"Rapor", "Excel dosyası", which expands to the details. Reads run without asking; every
file change asks you first. The answer itself is the model's text.

## Browser sign-in (coming)

The plan is to sign in without copying anything: after installing, Claude Code
(`/mcp` → `veriara` → Authenticate) or Codex (`codex mcp login veriara`) opens the Veriara
sign-in page in your browser, you sign in with your e-mail and password, the browser
returns to the client's own "you can close this window" page, and the client keeps and
refreshes the token itself. The same URL, `https://gw.veriara.com/v1/mcp`, then also works
without this plugin as a custom connector in claude.ai and ChatGPT. The Veriara agent API
carries the sign-in already; it opens once the Veriara product has registered it. It will
ship as plugin 3.0, which drops the environment variable. Until then, the terminal clients
use the steps below. Codex is ready for it since 2.3.2: `codex mcp login veriara` works with
or without the variable, and when both are there the signed-in user is the one who runs.

## Install (terminal)

Export the key in the shell profile the CLI starts from (`~/.zshrc`, `~/.bashrc`, or the
Windows user environment for a CLI launched from PowerShell), then open a new shell:

```sh
export VERIARA_API_KEY=<your Veriara session token>
```

Claude Code:

```sh
claude plugin marketplace add semihalkanli/veriara-plugin
claude plugin install veriara@veriara
claude plugin list          # remove with: claude plugin uninstall veriara@veriara
```

Codex:

```sh
codex plugin marketplace add semihalkanli/veriara-plugin
codex plugin add veriara@veriara
codex plugin list           # the veriara row should read "installed, enabled"
codex mcp get veriara       # url https://gw.veriara.com/v1/mcp, env_http_headers x-veriara-apikey=VERIARA_API_KEY
```

Codex needs the `@veriara` marketplace suffix (or `--marketplace veriara`) on `plugin add`
and `plugin remove`; a bare `veriara` is refused.

**Codex without a terminal session (`codex exec`).** Reads run, but every file change
(`fs_write`, `fs_edit`, `fs_append`, `fs_delete`, `xlsx_write`, `docx_write`) asks for
approval, and `codex exec` never asks: the call fails with "MCP tool call requires
approval, but approval policy is never". To let a script write, allow the tools it needs in
`~/.codex/config.toml`, under the plugin's own section:

```toml
[plugins."veriara@veriara".mcp_servers.veriara.tools.fs_write]
approval_mode = "approve"
```

Not under `[mcp_servers.veriara.tools.fs_write]`: that table declares a second, manual
server with no URL, and Codex then refuses to load the whole config ("invalid transport in
`mcp_servers.veriara`").

Both accept a local clone instead of the GitHub form (`claude plugin marketplace add
<repo-dir>`, `codex plugin marketplace add <repo-dir>`).

**Updates.** A new plugin version is a commit on `main` (the version in both manifests and
the marketplace is bumped, and the commit is tagged). A marketplace added without a ref
follows `main`, so whatever is on `main` is what the next update installs; the tag only
names it. To stay on one version, add the marketplace at its tag
(`codex plugin marketplace add semihalkanli/veriara-plugin --ref <tag>`, a tag from this
repository's tag list). An installed
plugin picks up a new version with `claude plugin marketplace update veriara` followed by
`claude plugin update veriara@veriara`. In Codex, `codex plugin marketplace upgrade`
refreshes the marketplace and moves the installed plugin to the new version in the same
step; `codex plugin list` then shows it. The next session runs it.

Remove a manual `claude mcp add veriara` / `codex mcp add veriara` registration before
installing the plugin. Claude Code would see two servers with the same name; Codex
silently keeps the manual one and ignores the plugin's, so `codex mcp get veriara` would
show the old address.

## First try

Open a **new** session (registration does not affect a running one) and ask something
your data can answer: "bu ayın satış cirosu ne kadar?", "en çok satan 10 ürünü listele",
"stok raporunu Excel olarak kaydet". The model calls `veriara_guide` first, then
`schema_search` or `db_schema`, then `metric_run`, `report_run` or `db_query`.

## Manual registration (without the plugin)

```sh
claude mcp add --transport http veriara https://gw.veriara.com/v1/mcp \
  --header "Authorization: Bearer <your Veriara session token>"
```

```toml
# ~/.codex/config.toml
[mcp_servers.veriara]
url = "https://gw.veriara.com/v1/mcp"
env_http_headers = { "x-veriara-apikey" = "VERIARA_API_KEY" }
```

Use `env_http_headers`, not `bearer_token_env_var`: with the latter Codex does not open its connection to the
server at all while the variable is unset, and never offers browser sign-in.

## Errors you may see

| Answer | Meaning |
|---|---|
| `MCP endpoint not found at https://gw.veriara.com` in `claude mcp list`, or Codex logging `HTTP 404 ... Cannot POST /v1/mcp` | the endpoint is not served on that host yet; nothing to fix on your side, ask the Veriara team |
| `credential_required` (401), in Claude Code with "Kimlik bilgisi gerekli" | no key was sent: `VERIARA_API_KEY` is not set in the shell the CLI started from; set it and open a new shell |
| Codex: `veriara` shows "Not logged in", or the log says `Auth required` | no credential reached the server: set `VERIARA_API_KEY` and open a new shell; `codex mcp login veriara` works only once the Veriara product has opened browser sign-in |
| Codex: `Environment variable VERIARA_API_KEY for MCP server 'veriara' is not set` | plugin 2.3.1 or older with the variable unset; set it, or update the plugin |
| `user_token_invalid` (401) | the session token is unknown or expired; sign in again and update the variable |
| `user_token_required` (401) | the organization key is no longer accepted; use your session token |
| `user_inactive` (403) | your Veriara access is closed; ask your administrator |
| `role_required` (403) | you have no role yet; ask your administrator to assign one |
| `identity_unavailable` (503) | Veriara could not confirm who you are right now; retry shortly |
| `tooling_disabled` with reason `discover_failed` | the Veriara app is not running or not signed in, or the credential is not registered. On plugin 2.3.0 or older in Claude Code it also means `VERIARA_API_KEY` is not set; update the plugin |
| `tool_unavailable`, a policy refusal | your role cannot do this; the model should say so and stop |
| "Veriara client is not connected to the gateway" | the Veriara app is not running or not signed in |

## Layout

```
.claude-plugin/marketplace.json     Claude Code marketplace
.agents/plugins/marketplace.json    Codex marketplace
plugins/veriara/                    the plugin: both manifests, the skill
.github/check-manifests.mjs         CI check: the files parse, versions and server URLs agree
```

The agent API itself is not in this repository.
