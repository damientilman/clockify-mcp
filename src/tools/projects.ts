import { clockifyFetch, requireString, pickBody } from "../clockify.js";
import type { ToolDef } from "./types.js";

export const projectTools: ToolDef[] = [
  {
    name: "listProjects",
    description:
      "List all projects in the active workspace. Monetary fields (hourlyRate.amount) are in cents; divide by 100 for the currency value.",
    inputSchema: { type: "object", properties: {} },
    handler: async (_args, ctx) =>
      clockifyFetch(`/workspaces/${ctx.workspaceId}/projects`),
  },
  {
    name: "getProject",
    description:
      "Get a single project by id. Monetary fields are in cents (divide by 100).",
    inputSchema: {
      type: "object",
      properties: {
        projectId: { type: "string", description: "Project id" },
      },
      required: ["projectId"],
    },
    handler: async (args, ctx) => {
      const projectId = requireString(args, "projectId");
      return clockifyFetch(
        `/workspaces/${ctx.workspaceId}/projects/${projectId}`,
      );
    },
  },
  {
    name: "createProject",
    description: "Create a new project in the active workspace.",
    inputSchema: {
      type: "object",
      properties: {
        name: { type: "string", description: "Project name" },
        clientId: { type: "string", description: "Client id (optional)" },
        color: { type: "string", description: "Hex color, e.g. #039BE5" },
        isPublic: { type: "boolean" },
        billable: { type: "boolean" },
        note: { type: "string" },
      },
      required: ["name"],
    },
    handler: async (args, ctx) => {
      requireString(args, "name");
      const body = pickBody(args, [
        "name",
        "clientId",
        "color",
        "isPublic",
        "billable",
        "note",
      ]);
      return clockifyFetch(`/workspaces/${ctx.workspaceId}/projects`, {
        method: "POST",
        body: JSON.stringify(body),
      });
    },
  },
  {
    name: "updateProject",
    description:
      "Update an existing project. Only provided fields are changed.",
    inputSchema: {
      type: "object",
      properties: {
        projectId: { type: "string", description: "Project id" },
        name: { type: "string" },
        clientId: { type: "string" },
        color: { type: "string" },
        isPublic: { type: "boolean" },
        billable: { type: "boolean" },
        note: { type: "string" },
        archived: { type: "boolean" },
      },
      required: ["projectId"],
    },
    handler: async (args, ctx) => {
      const projectId = requireString(args, "projectId");
      const body = pickBody(args, [
        "name",
        "clientId",
        "color",
        "isPublic",
        "billable",
        "note",
        "archived",
      ]);
      return clockifyFetch(
        `/workspaces/${ctx.workspaceId}/projects/${projectId}`,
        { method: "PUT", body: JSON.stringify(body) },
      );
    },
  },
  {
    name: "deleteProject",
    description:
      "Delete a project by id. The project must be archived first (set archived: true via updateProject).",
    inputSchema: {
      type: "object",
      properties: {
        projectId: { type: "string", description: "Project id" },
      },
      required: ["projectId"],
    },
    handler: async (args, ctx) => {
      const projectId = requireString(args, "projectId");
      return clockifyFetch(
        `/workspaces/${ctx.workspaceId}/projects/${projectId}`,
        { method: "DELETE" },
      );
    },
  },
];
