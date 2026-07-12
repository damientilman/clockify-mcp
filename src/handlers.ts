import { getContext } from "./clockify.js";
import type { ToolDef } from "./tools/types.js";
import { workspaceTools } from "./tools/workspace.js";
import { projectTools } from "./tools/projects.js";
import { clientTools } from "./tools/clients.js";
import { tagTools } from "./tools/tags.js";
import { taskTools } from "./tools/tasks.js";
import { timeEntryTools } from "./tools/timeEntries.js";
import { reportTools } from "./tools/reports.js";
import { readonlyTools } from "./tools/readonly.js";

// Registry of every tool the server exposes.
const allTools: ToolDef[] = [
  ...workspaceTools,
  ...projectTools,
  ...clientTools,
  ...tagTools,
  ...taskTools,
  ...timeEntryTools,
  ...reportTools,
  ...readonlyTools,
];

const toolMap = new Map<string, ToolDef>(allTools.map((t) => [t.name, t]));

// Handler that lists available tools (schema only, no handler function).
export async function listToolsHandler() {
  return {
    tools: allTools.map(({ name, description, inputSchema }) => ({
      name,
      description,
      inputSchema,
    })),
  };
}

interface MCPCallToolRequest {
  params: {
    name: string;
    arguments?: Record<string, unknown>;
  };
}

// Handler for calling a tool: look it up, resolve context, run it, wrap the result.
export async function callToolHandler(request: MCPCallToolRequest) {
  const tool = toolMap.get(request.params.name);
  if (!tool) {
    throw new Error(`Unknown tool: ${request.params.name}`);
  }
  const ctx = await getContext();
  const result = await tool.handler(request.params.arguments || {}, ctx);
  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(result, null, 2),
      },
    ],
  };
}
