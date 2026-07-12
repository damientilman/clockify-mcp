import { clockifyFetch, requireString, pickBody } from "../clockify.js";
import type { ToolDef } from "./types.js";

export const tagTools: ToolDef[] = [
  {
    name: "listTags",
    description: "List all tags in the active workspace.",
    inputSchema: { type: "object", properties: {} },
    handler: async (_args, ctx) =>
      clockifyFetch(`/workspaces/${ctx.workspaceId}/tags`),
  },
  {
    name: "createTag",
    description: "Create a new tag in the active workspace.",
    inputSchema: {
      type: "object",
      properties: {
        name: { type: "string", description: "Tag name" },
      },
      required: ["name"],
    },
    handler: async (args, ctx) => {
      requireString(args, "name");
      const body = pickBody(args, ["name"]);
      return clockifyFetch(`/workspaces/${ctx.workspaceId}/tags`, {
        method: "POST",
        body: JSON.stringify(body),
      });
    },
  },
  {
    name: "updateTag",
    description: "Update a tag (rename or archive).",
    inputSchema: {
      type: "object",
      properties: {
        tagId: { type: "string", description: "Tag id" },
        name: { type: "string" },
        archived: { type: "boolean" },
      },
      required: ["tagId"],
    },
    handler: async (args, ctx) => {
      const tagId = requireString(args, "tagId");
      const body = pickBody(args, ["name", "archived"]);
      return clockifyFetch(`/workspaces/${ctx.workspaceId}/tags/${tagId}`, {
        method: "PUT",
        body: JSON.stringify(body),
      });
    },
  },
  {
    name: "deleteTag",
    description: "Delete a tag by id.",
    inputSchema: {
      type: "object",
      properties: {
        tagId: { type: "string", description: "Tag id" },
      },
      required: ["tagId"],
    },
    handler: async (args, ctx) => {
      const tagId = requireString(args, "tagId");
      return clockifyFetch(`/workspaces/${ctx.workspaceId}/tags/${tagId}`, {
        method: "DELETE",
      });
    },
  },
];
