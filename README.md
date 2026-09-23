# Veriara plugin for Claude Code and Codex

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
| `fs_write`, `fs_append`, `fs_edit`, `fs_delete` | change files in the workspace folders |
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

## Browser sign-in (coming)

The plan is to sign in without copying anything: after installing, Claude Code
(`/mcp` → `veriara` → Authenticate) or Codex (`codex mcp login veriara`) opens the Veriara
sign-in page in your browser, you sign in with your e-mail and password, the browser
returns to the client's own "you can close this window" page, and the client keeps and
refreshes the token itself. The Veriara agent API already points clients at the sign-in;
the sign-in side is not open to MCP clients yet. It will ship as plugin 3.0, which drops
the environment variable. Until then, use the steps below.

## Install

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
codex plugin add veriara
codex plugin list           # the veriara row should read "enabled"
```

Both accept a local clone instead of the GitHub form (`claude plugin marketplace add
<repo-dir>`, `codex plugin marketplace add <repo-dir>`).

**Updates.** A new plugin version is a commit on this repository (the version in both
manifests and the marketplace is bumped, and the commit is tagged). An installed plugin
picks it up with `claude plugin marketplace update veriara` followed by
`claude plugin update veriara@veriara`. Codex refreshes its marketplace snapshot with
`codex plugin marketplace upgrade` and has no per-plugin update command: run
`codex plugin remove veriara` and `codex plugin add veriara` to move to the new version.
The next session runs it.

An installed plugin replaces a manual `claude mcp add veriara` / `codex mcp add veriara`
registration; remove that first, or the client sees two servers with the same name.

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
bearer_token_env_var = "VERIARA_API_KEY"
```

## Errors you may see

| Answer | Meaning |
|---|---|
| `MCP endpoint not found at https://gw.veriara.com` in `claude mcp list`, or Codex logging `HTTP 404 ... Cannot POST /v1/mcp` | the endpoint is not served on that host yet; nothing to fix on your side, ask the Veriara team |
| `credential_required` (401) | nothing reached the server; check the environment variable and open a new shell |
| `user_token_invalid` (401) | the session token is unknown or expired; sign in again and update the variable |
| `user_token_required` (401) | the organization key is no longer accepted; use your session token |
| `user_inactive` (403) | your Veriara access is closed; ask your administrator |
| `role_required` (403) | you have no role yet; ask your administrator to assign one |
| `identity_unavailable` (503) | Veriara could not confirm who you are right now; retry shortly |
| `tooling_disabled` with reason `discover_failed` | the Veriara app is not running or not signed in, or the credential is not registered |
| `tool_unavailable`, a policy refusal | your role cannot do this; the model should say so and stop |
| "Veriara client is not connected to the gateway" | the Veriara app is not running or not signed in |

## Layout

```
.claude-plugin/marketplace.json     Claude Code marketplace
.agents/plugins/marketplace.json    Codex marketplace
plugins/veriara/                    the plugin: both manifests, the skill
```

The agent API itself is not in this repository.
