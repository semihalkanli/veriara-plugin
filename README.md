# Veriara plugin for Claude Code and Codex

Ask Claude Code or Codex questions about your own business data. The plugin registers the
`veriara` MCP server, which is the Veriara agent API: the same tools, seat authorization,
column masking, row filters and audit trail the Veriara chat uses, with the model running
on your side instead of ours.

```
Claude Code / Codex ── MCP over HTTPS ──> Veriara agent API ──> gateway ──> Veriara app
                       (your API key)     (the seat's tools)                (your databases
                                                                             and folders)
```

## What you get

Fifteen tools, filtered to what your seat may use:

| Tool | What it does |
|---|---|
| `schema_search` | search the knowledge pack: tables, columns, enum codes, metric definitions |
| `db_schema` | the table and column reference of one connection |
| `metric_run` | run a defined business metric with optional `where` and `group_by` |
| `report_run` | run a predefined report with `params` |
| `db_query` | read-only SQL on a registered connection |
| `fs_list`, `fs_read`, `fs_search`, `doc_read` | list, read and search the workspace folders; `doc_read` renders xlsx, docx, pdf and csv readably |
| `fs_write`, `fs_append`, `fs_edit`, `fs_delete` | change files in the workspace folders |
| `xlsx_write`, `docx_write` | produce an Excel or Word file from rows or Markdown |

Where the organization administers seats and the deployment enforces it on this route, a
table the seat may not read is refused, masked columns come back masked, and row filters
are applied before the SQL runs. During the development phase the key runs with no seat
policy: every registered database and folder, as the Veriara app itself sees them.

## Prerequisites

- **A Veriara seat** in your organization, and the **Veriara app** installed, running and
  connected on the machine that holds the databases (usually the organization's own).
- **Your organization's Veriara API key** (`kgd_…`), the one the Veriara app signed in
  with. A subscription is all the plugin needs. Keep the key as you would a password; it
  is what the app itself authenticates with.

  An organization that administers seats and wants a developer's calls to run under that
  person's own role can hand them a per-seat MCP token instead (issued by the seat
  administration API); it goes into the same variable.

## Install

Export the key in the shell profile the CLI starts from (`~/.zshrc`, `~/.bashrc`, or the
Windows user environment for a CLI launched from PowerShell), then open a new shell:

```sh
export VERIARA_API_KEY=<your Veriara API key>
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
"stok raporunu Excel olarak kaydet". The model calls `schema_search` or `db_schema` first,
then `metric_run`, `report_run` or `db_query`.

## Manual registration (without the plugin)

```sh
claude mcp add --transport http veriara https://gw.veriara.com/v1/mcp \
  --header "Authorization: Bearer <your Veriara API key>"
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
| `credential_required` (401) | nothing reached the server; check the environment variable and open a new shell |
| `tooling_disabled` with reason `discover_failed` | the key is not registered, or the Veriara app is not running or not signed in |
| `role_required` (403) | only on a deployment that enforces seat policy on this route (`MCP_SEAT_POLICY=1`): the organization has no default role; ask the owner to set one, or use a per-seat MCP token |
| `claim_expired`, `seat_closed`, `employee_inactive` | a per-seat MCP token that has expired or whose seat is gone; ask the owner for a new one |
| `tool_unavailable`, a policy refusal | the seat cannot do this; the model should say so and stop |
| "Veriara client is not connected to the gateway" | the Veriara app is not running or not signed in |

## Layout

```
.claude-plugin/marketplace.json     Claude Code marketplace
.agents/plugins/marketplace.json    Codex marketplace
plugins/veriara/                    the plugin: both manifests, the skill
```

The agent API itself is not in this repository.
