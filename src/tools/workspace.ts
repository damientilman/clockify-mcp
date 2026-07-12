import { clockifyFetch } from "../clockify.js";
import type { ToolDef } from "./types.js";

export const workspaceTools: ToolDef[] = [
  {
    name: "listWorkspaces",
    description: "List all workspaces the authenticated user belongs to.",
    inputSchema: { type: "object", properties: {} },
    handler: async () => clockifyFetch("/workspaces"),
  },
  {
    name: "getCurrentUser",
    description:
      "Get the authenticated user (id, email, active workspace, settings).",
    inputSchema: { type: "object", properties: {} },
    handler: async (_args, ctx) => ctx.user,
  },
];
