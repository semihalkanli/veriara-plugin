---
name: veriara
description: Use the Veriara MCP tools (metric_run, report_run, schema_search, db_query, db_schema, fs_list, fs_read, fs_search, doc_read, fs_write, fs_append, fs_edit, fs_delete, xlsx_write, docx_write) to answer questions from the databases and workspace folders the user's Veriara seat can reach. Use when the user mentions Veriara, their ERP (NETSIS, LOGO), "my database", "my sales", "my stock", or wants a business question answered or a report or document produced from their own data.
---

# Veriara

The `veriara` MCP server is the Veriara agent API: the same tool layer the Veriara chat
uses, reached with the organization's Veriara API key (or a per-seat MCP token). Every
call runs under the organization's authorization. Tables the seat may not read are refused, masked columns come back masked,
row filters are applied on the server, and every call is audited. Do not try to work
around a refusal; report it.

The tool list you receive is already the seat's inventory. A tool that is absent is not
available to this seat or this deployment; do not ask for it.

## Workflow

1. **Find the right name before writing SQL.** `schema_search` searches the knowledge
   pack: the table and column dictionary, enum code maps and metric definitions. Call it
   when you are unsure of a table or column name. `db_schema` returns the table and column
   reference of one connection (`dbname`), or a pointer to the engine's own metadata
   tables when the connection has no knowledge pack.
2. **Prefer the packaged tools over hand-written SQL.** `metric_run` runs a defined
   business metric (by its id from the enum) with the correct tables, filters and formula;
   add conditions with `where` and breakdowns with `group_by`. `report_run` runs a
   predefined report with `params`. When a question maps to a metric or a report, use
   them; they are what the business has agreed the number means.
3. **`db_query` for everything else.** Pass `dbname` and `sql`. Only read statements are
   accepted (`SELECT`, `WITH`, SQLite metadata pragmas); data-changing or administrative
   statements are refused server-side. Name every aggregate column (`SELECT MAX(a) AS
   max_a`); unnamed or duplicate columns are refused. Match the SQL dialect to the
   connection's driver as reported in the `dbname` description.
4. **Files.** `fs_list` (`path=""` lists the workspace folders), `fs_read`, `fs_search`
   (searches inside Excel, Word, PDF and CSV too), `doc_read` (readable form of xlsx, docx,
   pdf, csv and text; call it without `part` first to get the file's map). Use `doc_read`
   rather than `fs_read` for office documents. `fs_write`, `fs_append`, `fs_edit` and
   `fs_delete` change files; `xlsx_write` and `docx_write` produce Excel and Word files
   from rows or Markdown. Use the writers when the user asks for a file; never assemble an
   office document by hand through `fs_write`.

## Rules

- Use database names exactly as the `dbname` enum spells them.
- Large results come back truncated with a `warning` field. Narrow the query instead of
  paging through a truncated payload.
- A failed call carries `error`, often a `code` and a `hint` naming the next action
  (a column lookup, a different tool, a smaller result). Follow the hint before retrying.
- `tool_unavailable` or a policy refusal means the seat cannot do this; say so and stop.
- Never ask the user for their key in the conversation. It is read from
  `VERIARA_API_KEY` when the plugin starts. If `tools/list` answers `tooling_disabled`
  with reason `discover_failed`, the key is not registered or the Veriara app is not
  running; tell the user to check both.
