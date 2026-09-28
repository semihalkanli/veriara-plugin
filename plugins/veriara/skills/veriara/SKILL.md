---
name: veriara
description: Use the Veriara MCP tools (veriara_guide, metric_run, report_run, schema_search, db_query, db_schema and the file and document tools) to answer questions from the databases and workspace folders the user's Veriara role can reach. Use when the user mentions Veriara, their ERP (NETSIS, LOGO), "my database", "my sales", "my stock", or wants a business question answered or a report or document produced from their own data.
---

# Veriara

The `veriara` MCP server is the Veriara agent API: the same tool layer the Veriara chat
uses, running under the user's own role. Tables the role may not read are refused, masked
columns come back masked, row filters are applied on the server, and every call is
audited. Do not try to work around a refusal; report it.

## Start here

**Call `veriara_guide` once, before the first data question of a session.** It returns the
working guide the Veriara chat runs under for this user: their role and its limits, the
databases and what the knowledge pack says about them (business metrics, reports, table
inventory), and the SQL dialect, money and date rules. Follow it. It is served by the
Veriara side, so it is always current; this skill only tells you where to start. If the
server offers no `veriara_guide` tool (an older deployment), go straight to the workflow
below.

## Workflow

1. Find names before writing SQL: `schema_search` (the knowledge pack) or `db_schema` (one
   connection's tables and columns).
2. Prefer `metric_run` and `report_run` when a defined metric or report fits the question;
   they are what the business has agreed the number means.
3. `db_query` for everything else. Read statements only; name every aggregate column; match
   the dialect to the connection's driver.
4. Files: `doc_read` for office documents rather than `fs_read`; `fs_write` with
   `mode: "append"` to add to the end of a file; `xlsx_write` and `docx_write` to produce
   Excel and Word files, never hand-assembled through `fs_write`.

## Rules

- A refused call means the role does not allow it: say so plainly, and never report it as
  "no records".
- A truncated result carries a warning: narrow the query instead of paging.
- A failed call's `hint` names the next action; follow it before retrying.
- Never ask the user for their token in the conversation; it is read from
  `VERIARA_API_KEY` when the plugin starts. If `tools/list` answers `tooling_disabled`
  with reason `discover_failed`, the Veriara app is not running or the credential is not
  registered; tell the user to check both.
