# Veriara plugin

One plugin directory that Claude (`.claude-plugin/`: Claude Code, claude.ai and the desktop
app) and Codex (`.codex-plugin/`) install. It registers the `veriara` MCP server at the Veriara agent API
(`https://gw.veriara.com/v1/mcp`) and ships the `veriara` skill. In a terminal the credential (your Veriara session
token, or the organization's API key during the development phase) is read from
`VERIARA_API_KEY` at start; in the Claude apps you sign in from the plugin's Connectors tab.
Nothing is stored in the plugin. The working guidance comes from the server
(`veriara_guide`), so the skill stays short.

Install instructions are in the [repository README](../../README.md).
