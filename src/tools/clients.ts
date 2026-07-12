import { clockifyFetch, requireString, pickBody } from "../clockify.js";
import type { ToolDef } from "./types.js";

export const clientTools: ToolDef[] = [
  {
    name: "listClients",
    description: "List all clients in the active workspace.",
    inputSchema: { type: "object", properties: {} },
    handler: async (_args, ctx) =>
      clockifyFetch(`/workspaces/${ctx.workspaceId}/clients`),
  },
  {
    name: "createClient",
    description: "Create a new client in the active workspace.",
    inputSchema: {
      type: "object",
      properties: {
        name: { type: "string", description: "Client name" },
        note: { type: "string" },
        address: { type: "string" },
      },
      required: ["name"],
    },
    handler: async (args, ctx) => {
      requireString(args, "name");
      const body = pickBody(args, ["name", "note", "address"]);
      return clockifyFetch(`/workspaces/${ctx.workspaceId}/clients`, {
        method: "POST",
        body: JSON.stringify(body),
      });
    },
  },
  {
    name: "updateClient",
    description: "Update a client. Only provided fields are changed.",
    inputSchema: {
      type: "object",
      properties: {
        clientId: { type: "string", description: "Client id" },
        name: { type: "string" },
        note: { type: "string" },
        address: { type: "string" },
        archived: { type: "boolean" },
      },
      required: ["clientId"],
    },
    handler: async (args, ctx) => {
      const clientId = requireString(args, "clientId");
      const body = pickBody(args, ["name", "note", "address", "archived"]);
      return clockifyFetch(
        `/workspaces/${ctx.workspaceId}/clients/${clientId}`,
        { method: "PUT", body: JSON.stringify(body) },
      );
    },
  },
  {
    name: "deleteClient",
    description: "Delete a client by id.",
    inputSchema: {
      type: "object",
      properties: {
        clientId: { type: "string", description: "Client id" },
      },
      required: ["clientId"],
    },
    handler: async (args, ctx) => {
      const clientId = requireString(args, "clientId");
      return clockifyFetch(
        `/workspaces/${ctx.workspaceId}/clients/${clientId}`,
        { method: "DELETE" },
      );
    },
  },
];
