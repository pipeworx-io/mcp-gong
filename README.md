# mcp-gong

Gong MCP — wraps the Gong API v2 (OAuth)

Part of the [Pipeworx](https://pipeworx.io) open MCP gateway.

## Tools

| Tool | Description |
|------|-------------|
| `gong_list_users` | List all users in the Gong workspace. |

## Quick Start

Add to your MCP client config:

```json
{
  "mcpServers": {
    "gong": {
      "url": "https://gateway.pipeworx.io/gong/mcp"
    }
  }
}
```

Or use the CLI:

```bash
npx pipeworx use gong
```

## License

MIT
