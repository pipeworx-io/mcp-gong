# mcp-gong

Gong MCP — wraps the Gong API v2 (OAuth)

Part of [Pipeworx](https://pipeworx.io) — an MCP gateway connecting AI agents to 1394+ live data sources.

## Tools

| Tool | Description |
|------|-------------|
| `gong_list_calls` | List recorded calls from your workspace with optional date filtering. Returns call IDs, dates, participants, duration, and engagement metrics. Supports pagination for large result sets. |
| `gong_get_call` | Get full details for a specific call by ID. Returns participants, duration, call metadata, engagement metrics, and key moments. |
| `gong_get_transcript` | Retrieve the full conversation transcript for a call with speaker names, timestamps, and dialogue. Use after gong_get_call to analyze specific conversations. |
| `gong_list_users` | List all users in your workspace. Returns user names, IDs, email addresses, roles, and activity status. |
| `gong_search_calls` | Search calls by keyword or phrase (e.g., 'pricing', 'objection', 'budget'). Returns matching calls ranked by relevance. |

## Quick Start

Add to your MCP client (Claude Desktop, Cursor, Windsurf, etc.):

```json
{
  "mcpServers": {
    "gong": {
      "url": "https://gateway.pipeworx.io/gong/mcp"
    }
  }
}
```

Or connect to the full Pipeworx gateway for access to all 1394+ data sources:

```json
{
  "mcpServers": {
    "pipeworx": {
      "url": "https://gateway.pipeworx.io/mcp"
    }
  }
}
```

## Using with ask_pipeworx

Instead of calling tools directly, you can ask questions in plain English:

```
ask_pipeworx({ question: "your question about Gong data" })
```

The gateway picks the right tool and fills the arguments automatically.

## More

- [Docs and guides](https://pipeworx.io/docs)
- [pipeworx.io](https://pipeworx.io)

## License

MIT
