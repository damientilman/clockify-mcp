import { clockifyFetch } from "../clockify.js";
import type { ToolDef } from "./types.js";

// Read-only tools for secondary scopes: users, groups, custom fields, expenses.
export const readonlyTools: ToolDef[] = [
  {
    name: "listUsers",
    description: "List all users in the active workspace.",
    inputSchema: { type: "object", properties: {} },
    handler: async (_args, ctx) =>
      clockifyFetch(`/workspaces/${ctx.workspaceId}/users`),
  },
  {
    name: "listUserGroups",
    description: "List all user groups in the active workspace.",
    inputSchema: { type: "object", properties: {} },
    handler: async (_args, ctx) =>
      clockifyFetch(`/workspaces/${ctx.workspaceId}/user-groups`),
  },
  {
    name: "listCustomFields",
    description: "List all custom fields defined in the active workspace.",
    inputSchema: { type: "object", properties: {} },
    handler: async (_args, ctx) =>
      clockifyFetch(`/workspaces/${ctx.workspaceId}/custom-fields`),
  },
  {
    name: "listExpenses",
    description:
      "List expenses in the active workspace. Monetary amounts are in cents (divide by 100).",
    inputSchema: { type: "object", properties: {} },
    handler: async (_args, ctx) =>
      clockifyFetch(`/workspaces/${ctx.workspaceId}/expenses`),
  },
];
