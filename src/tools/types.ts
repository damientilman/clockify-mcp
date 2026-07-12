// Shared types for the Clockify tool registry.

// Context resolved once per tool call from the /user endpoint.
export interface ClockifyContext {
  workspaceId: string;
  userId: string;
  user: Record<string, unknown>;
}

// A single MCP tool: its schema plus the handler that runs it.
// The handler returns raw data; response wrapping is centralized in the dispatcher.
export interface ToolDef {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
  handler: (
    args: Record<string, unknown>,
    ctx: ClockifyContext,
  ) => Promise<unknown>;
}
