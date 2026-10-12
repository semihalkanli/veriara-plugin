# Veriara plugin

One plugin directory that Claude (`.claude-plugin/`: Claude Code, claude.ai and the desktop
app) and Codex (`.codex-plugin/`) install. It registers the `veriara` MCP server at the Veriara agent API
(`https://gw.veriara.com/v1/mcp`) and ships the `veriara` skill. In a terminal the credential (your Veriara session
token, or the organization's API key during the development phase) is read from
`VERIARA_API_KEY` at start. The Claude apps pass no environment variables and sign in
through the browser instead, which arrives with plugin 3.0: while the manifest sets an
`Authorization` header, Claude Code disables the OAuth fallback. Nothing is stored in the
plugin. The working guidance comes from the server (`veriara_guide`), so the skill stays
short.

Install in one step on Claude Code 2.1.275 or later:

```sh
claude plugin install veriara --marketplace semihalkanli/veriara-plugin
```

The full instructions, Codex included, are in the [repository README](../../README.md).
