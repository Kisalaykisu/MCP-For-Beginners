# Claude Desktop MCP Configuration

Add this to your Claude Desktop configuration file:
**Location**: `~/Library/Application Support/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "ollama-prompts": {
      "command": "node",
      "args": ["/Users/jeremy/demos/mcpstuff/ollamademo/server.js"],
      "env": {}
    }
  }
}
```

After adding this configuration:
1. Restart Claude Desktop
2. You should see a "Prompts" section in the Claude interface
3. Your custom prompts will be available there
