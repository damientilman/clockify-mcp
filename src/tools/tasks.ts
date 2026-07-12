import { clockifyFetch, requireString, pickBody } from "../clockify.js";
import type { ToolDef } from "./types.js";

// Tasks are nested under a project in the Clockify API.
export const taskTools: ToolDef[] = [
  {
    name: "listTasks",
    description: "List all tasks for a given project.",
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
        `/workspaces/${ctx.workspaceId}/projects/${projectId}/tasks`,
      );
    },
  },
  {
    name: "createTask",
    description: "Create a new task inside a project.",
    inputSchema: {
      type: "object",
      properties: {
        projectId: { type: "string", description: "Project id" },
        name: { type: "string", description: "Task name" },
        assigneeIds: {
          type: "array",
          items: { type: "string" },
          description: "User ids to assign (optional)",
        },
      },
      required: ["projectId", "name"],
    },
    handler: async (args, ctx) => {
      const projectId = requireString(args, "projectId");
      requireString(args, "name");
      const body = pickBody(args, ["name", "assigneeIds"]);
      return clockifyFetch(
        `/workspaces/${ctx.workspaceId}/projects/${projectId}/tasks`,
        { method: "POST", body: JSON.stringify(body) },
      );
    },
  },
  {
    name: "updateTask",
    description: "Update a task inside a project. Only provided fields change.",
    inputSchema: {
      type: "object",
      properties: {
        projectId: { type: "string", description: "Project id" },
        taskId: { type: "string", description: "Task id" },
        name: { type: "string" },
        assigneeIds: { type: "array", items: { type: "string" } },
        status: {
          type: "string",
          description: "ACTIVE or DONE",
        },
      },
      required: ["projectId", "taskId"],
    },
    handler: async (args, ctx) => {
      const projectId = requireString(args, "projectId");
      const taskId = requireString(args, "taskId");
      const body = pickBody(args, ["name", "assigneeIds", "status"]);
      return clockifyFetch(
        `/workspaces/${ctx.workspaceId}/projects/${projectId}/tasks/${taskId}`,
        { method: "PUT", body: JSON.stringify(body) },
      );
    },
  },
  {
    name: "deleteTask",
    description: "Delete a task from a project.",
    inputSchema: {
      type: "object",
      properties: {
        projectId: { type: "string", description: "Project id" },
        taskId: { type: "string", description: "Task id" },
      },
      required: ["projectId", "taskId"],
    },
    handler: async (args, ctx) => {
      const projectId = requireString(args, "projectId");
      const taskId = requireString(args, "taskId");
      return clockifyFetch(
        `/workspaces/${ctx.workspaceId}/projects/${projectId}/tasks/${taskId}`,
        { method: "DELETE" },
      );
    },
  },
];
