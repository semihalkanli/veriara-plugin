# Veriara plugin for Claude Code and Codex

Ask Claude Code or Codex questions about your own business data. The plugin registers the
`veriara` MCP server, which is the Veriara agent API: the same tools, seat authorization,
column masking, row filters and audit trail the Veriara chat uses, with the model running
on your side instead of ours.

```
Claude Code / Codex ── MCP over HTTPS ──> Veriara agent API ──> gateway ──> Veriara app
                       (your MCP token)   (your seat's tools)               (your databases
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

A table your seat may not read is refused, masked columns come back masked, and row
filters are applied before the SQL runs. The plugin cannot widen what the seat allows.

## Prerequisites

- **A Veriara seat** in your organization, and the **Veriara app** installed, running and
  connected on the machine that holds the databases (usually the organization's own).
- **An MCP token for your seat.** Issue it from the Veriara seat panel (your own account,
  or ask your organization's administrator). It is a personal credential that lives for
  days, not minutes; keep it as you would a password. Closing or deactivating the seat
  ends it immediately.

## Install

Export the token in the shell profile the CLI starts from (`~/.zshrc`, `~/.bashrc`, or the
Windows user environment for a CLI launched from PowerShell), then open a new shell:

```sh
export VERIARA_MCP_TOKEN=<your MCP token>
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
  --header "Authorization: Bearer <your MCP token>"
```

```toml
# ~/.codex/config.toml
[mcp_servers.veriara]
url = "https://gw.veriara.com/v1/mcp"
bearer_token_env_var = "VERIARA_MCP_TOKEN"
```

## Errors you may see

| Answer | Meaning |
|---|---|
| `mcp_token_required` (401) | no token reached the server; check the environment variable and open a new shell |
| `claim_expired`, `seat_closed` (401) | the token has expired or the seat is gone; issue a new token from the seat panel |
| `employee_inactive` (403) | the seat is deactivated; talk to your administrator |
| `claim_wrong_purpose` (401) | a chat session claim was used instead of an MCP token |
| `tool_unavailable`, a policy refusal | the seat cannot do this; the model should say so and stop |
| "Veriara client is not connected to the gateway" | the Veriara app is not running or not signed in |

## Layout

```
.claude-plugin/marketplace.json     Claude Code marketplace
.agents/plugins/marketplace.json    Codex marketplace
plugins/veriara/                    the plugin: both manifests, the skill
```

The agent API itself is not in this repository.
