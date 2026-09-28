# Veriara plugin

One plugin directory that both Claude Code (`.claude-plugin/`) and Codex (`.codex-plugin/`)
install. It registers the `veriara` MCP server at the Veriara agent API
(`https://gw.veriara.com/v1/mcp`) and ships the `veriara` skill. The credential (your Veriara session token, or the
organization's API key during the development phase) is read from `VERIARA_API_KEY` at
start; nothing is stored in the plugin. The working guidance comes from the server
(`veriara_guide`), so the skill stays short.

Install instructions are in the [repository README](../../README.md).
