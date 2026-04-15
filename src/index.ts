interface McpToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, unknown>;
    required?: string[];
  };
}

interface McpToolExport {
  tools: McpToolDefinition[];
  callTool: (name: string, args: Record<string, unknown>) => Promise<unknown>;
}

/**
 * Gong MCP — wraps the Gong API v2 (OAuth)
 *
 * Tools:
 * - gong_list_calls: list recorded calls with optional date filters and pagination
 * - gong_get_call: get call details including participants and duration
 * - gong_get_transcript: get call transcript
 * - gong_list_users: list Gong users
 * - gong_search_calls: search calls by keyword
 */


const API = 'https://api.gong.io/v2';

interface GongContext {
  gong?: { accessToken: string };
}

// -- Tool definitions --------------------------------------------------------

const tools: McpToolExport['tools'] = [
  {
    name: 'gong_list_calls',
    description:
      'List recorded calls from Gong. Optionally filter by date range. Supports cursor-based pagination.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        fromDateTime: {
          type: 'string',
          description: 'Start of date range (ISO 8601, e.g. "2024-01-01T00:00:00Z")',
        },
        toDateTime: {
          type: 'string',
          description: 'End of date range (ISO 8601)',
        },
        cursor: {
          type: 'string',
          description: 'Pagination cursor from a previous response',
        },
      },
    },
  },
  {
    name: 'gong_get_call',
    description:
      'Get details for a specific Gong call by its ID, including participants, duration, and metadata.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        callId: { type: 'string', description: 'The Gong call ID' },
      },
      required: ['callId'],
    },
  },
  {
    name: 'gong_get_transcript',
    description:
      'Get the transcript for a specific Gong call. Returns the full conversation transcript.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        callId: { type: 'string', description: 'The Gong call ID' },
      },
      required: ['callId'],
    },
  },
  {
    name: 'gong_list_users',
    description: 'List all users in the Gong workspace.',
    inputSchema: {
      type: 'object' as const,
      properties: {},
    },
  },
  {
    name: 'gong_search_calls',
    description:
      'Search Gong calls by keyword. Returns calls that match the search text.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        keyword: { type: 'string', description: 'Keyword to search for in calls' },
      },
      required: ['keyword'],
    },
  },
];

// -- Helpers -----------------------------------------------------------------

function getToken(args: Record<string, unknown>): string {
  const context = (args._context ?? {}) as GongContext;
  const token = context.gong?.accessToken;
  if (!token) throw new Error('Gong OAuth token required. Connect Gong via OAuth first.');
  return token;
}

async function gongPost(token: string, path: string, body: unknown): Promise<unknown> {
  const res = await fetch(`${API}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Gong API error (${res.status}): ${text}`);
  }
  return res.json();
}

async function gongGet(token: string, path: string): Promise<unknown> {
  const res = await fetch(`${API}${path}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Gong API error (${res.status}): ${text}`);
  }
  return res.json();
}

// -- Tool implementations ----------------------------------------------------

async function listCalls(token: string, fromDateTime?: string, toDateTime?: string, cursor?: string) {
  const filter: Record<string, unknown> = {};
  if (fromDateTime) filter.fromDateTime = fromDateTime;
  if (toDateTime) filter.toDateTime = toDateTime;

  const body: Record<string, unknown> = { filter };
  if (cursor) body.cursor = cursor;

  return gongPost(token, '/calls', body);
}

async function getCall(token: string, callId: string) {
  return gongGet(token, `/calls/${encodeURIComponent(callId)}`);
}

async function getTranscript(token: string, callId: string) {
  return gongPost(token, '/calls/transcript', {
    filter: { callIds: [callId] },
  });
}

async function listUsers(token: string) {
  return gongGet(token, '/users');
}

async function searchCalls(token: string, keyword: string) {
  return gongPost(token, '/calls', {
    filter: { textSearch: keyword },
  });
}

// -- callTool dispatcher -----------------------------------------------------

async function callTool(name: string, args: Record<string, unknown>): Promise<unknown> {
  const token = getToken(args);
  delete args._context;

  switch (name) {
    case 'gong_list_calls':
      return listCalls(
        token,
        args.fromDateTime as string | undefined,
        args.toDateTime as string | undefined,
        args.cursor as string | undefined,
      );
    case 'gong_get_call':
      return getCall(token, args.callId as string);
    case 'gong_get_transcript':
      return getTranscript(token, args.callId as string);
    case 'gong_list_users':
      return listUsers(token);
    case 'gong_search_calls':
      return searchCalls(token, args.keyword as string);
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

export default { tools, callTool, meter: { credits: 15 }, provider: 'gong' } satisfies McpToolExport;
