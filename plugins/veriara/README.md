# Veriara plugin

One plugin directory that both Claude Code (`.claude-plugin/`) and Codex (`.codex-plugin/`)
install. It registers the `veriara` MCP server at the Veriara agent API
(`https://gw.veriara.com/v1/mcp`) and ships the `veriara` skill. The MCP token is read from
`VERIARA_MCP_TOKEN` at start; nothing is stored in the plugin.

Install instructions are in the [repository README](../../README.md).
