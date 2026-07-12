import {
  clockifyFetch,
  requireString,
  withDateRange,
  pickBody,
} from "../clockify.js";
import type { ToolDef } from "./types.js";

type NamedUser = { id: string; name: string };

export const timeEntryTools: ToolDef[] = [
  {
    name: "getTimeEntries",
    description:
      "List time entries for the authenticated user, with optional start/end ISO8601 filters.",
    inputSchema: {
      type: "object",
      properties: {
        start: {
          type: "string",
          description: "Start date (ISO8601, optional)",
        },
        end: { type: "string", description: "End date (ISO8601, optional)" },
      },
    },
    handler: async (args, ctx) =>
      clockifyFetch(
        withDateRange(
          `/workspaces/${ctx.workspaceId}/user/${ctx.userId}/time-entries`,
          args,
        ),
      ),
  },
  {
    name: "getUserTimeEntries",
    description:
      "List time entries for a specific user id, with optional start/end filters.",
    inputSchema: {
      type: "object",
      properties: {
        userId: { type: "string", description: "Target user id" },
        start: {
          type: "string",
          description: "Start date (ISO8601, optional)",
        },
        end: { type: "string", description: "End date (ISO8601, optional)" },
      },
      required: ["userId"],
    },
    handler: async (args, ctx) => {
      const targetUserId = requireString(args, "userId");
      return clockifyFetch(
        withDateRange(
          `/workspaces/${ctx.workspaceId}/user/${targetUserId}/time-entries`,
          args,
        ),
      );
    },
  },
  {
    name: "getUserTimeEntriesByName",
    description:
      "List time entries for a user matched by name (case-insensitive, partial). Optional start/end filters.",
    inputSchema: {
      type: "object",
      properties: {
        userName: {
          type: "string",
          description: "User name (partial/case-insensitive)",
        },
        start: {
          type: "string",
          description: "Start date (ISO8601, optional)",
        },
        end: { type: "string", description: "End date (ISO8601, optional)" },
      },
      required: ["userName"],
    },
    handler: async (args, ctx) => {
      const userName = requireString(args, "userName");
      const users = (await clockifyFetch(
        `/workspaces/${ctx.workspaceId}/users`,
      )) as NamedUser[];
      const match = users.find(
        (u) => u.name && u.name.toLowerCase().includes(userName.toLowerCase()),
      );
      if (!match) {
        throw new Error(`No user found matching name: ${userName}`);
      }
      return clockifyFetch(
        withDateRange(
          `/workspaces/${ctx.workspaceId}/user/${match.id}/time-entries`,
          args,
        ),
      );
    },
  },
  {
    name: "getTimeEntry",
    description: "Get a single time entry by id.",
    inputSchema: {
      type: "object",
      properties: {
        timeEntryId: { type: "string", description: "Time entry id" },
      },
      required: ["timeEntryId"],
    },
    handler: async (args, ctx) => {
      const id = requireString(args, "timeEntryId");
      return clockifyFetch(`/workspaces/${ctx.workspaceId}/time-entries/${id}`);
    },
  },
  {
    name: "addTimeEntry",
    description:
      "Add a completed time entry (start and end both set) to a project.",
    inputSchema: {
      type: "object",
      properties: {
        projectId: { type: "string" },
        description: { type: "string" },
        start: { type: "string", description: "Start (ISO8601)" },
        end: { type: "string", description: "End (ISO8601)" },
        taskId: { type: "string" },
        tagIds: { type: "array", items: { type: "string" } },
        billable: { type: "boolean" },
      },
      required: ["projectId", "description", "start", "end"],
    },
    handler: async (args, ctx) => {
      requireString(args, "projectId");
      requireString(args, "description");
      requireString(args, "start");
      requireString(args, "end");
      const body = pickBody(args, [
        "start",
        "end",
        "description",
        "projectId",
        "taskId",
        "tagIds",
        "billable",
      ]);
      return clockifyFetch(`/workspaces/${ctx.workspaceId}/time-entries`, {
        method: "POST",
        body: JSON.stringify(body),
      });
    },
  },
  {
    name: "updateTimeEntry",
    description:
      "Update a time entry. Clockify requires start; include it plus any fields to change.",
    inputSchema: {
      type: "object",
      properties: {
        timeEntryId: { type: "string" },
        start: {
          type: "string",
          description: "Start (ISO8601, required by API)",
        },
        end: { type: "string", description: "End (ISO8601)" },
        description: { type: "string" },
        projectId: { type: "string" },
        taskId: { type: "string" },
        tagIds: { type: "array", items: { type: "string" } },
        billable: { type: "boolean" },
      },
      required: ["timeEntryId", "start"],
    },
    handler: async (args, ctx) => {
      const id = requireString(args, "timeEntryId");
      requireString(args, "start");
      const body = pickBody(args, [
        "start",
        "end",
        "description",
        "projectId",
        "taskId",
        "tagIds",
        "billable",
      ]);
      return clockifyFetch(
        `/workspaces/${ctx.workspaceId}/time-entries/${id}`,
        { method: "PUT", body: JSON.stringify(body) },
      );
    },
  },
  {
    name: "deleteTimeEntry",
    description: "Delete a time entry by id.",
    inputSchema: {
      type: "object",
      properties: {
        timeEntryId: { type: "string", description: "Time entry id" },
      },
      required: ["timeEntryId"],
    },
    handler: async (args, ctx) => {
      const id = requireString(args, "timeEntryId");
      return clockifyFetch(
        `/workspaces/${ctx.workspaceId}/time-entries/${id}`,
        { method: "DELETE" },
      );
    },
  },
  {
    name: "startTimer",
    description:
      "Start a running timer for the authenticated user (a time entry with no end). Defaults start to now.",
    inputSchema: {
      type: "object",
      properties: {
        description: { type: "string" },
        projectId: { type: "string" },
        taskId: { type: "string" },
        tagIds: { type: "array", items: { type: "string" } },
        billable: { type: "boolean" },
        start: {
          type: "string",
          description: "Start (ISO8601, defaults to now)",
        },
      },
    },
    handler: async (args, ctx) => {
      const body = pickBody(args, [
        "description",
        "projectId",
        "taskId",
        "tagIds",
        "billable",
      ]);
      body.start =
        typeof args.start === "string" && args.start
          ? args.start
          : new Date().toISOString();
      return clockifyFetch(`/workspaces/${ctx.workspaceId}/time-entries`, {
        method: "POST",
        body: JSON.stringify(body),
      });
    },
  },
  {
    name: "stopTimer",
    description:
      "Stop the running timer for the authenticated user by setting its end. Defaults end to now.",
    inputSchema: {
      type: "object",
      properties: {
        end: { type: "string", description: "End (ISO8601, defaults to now)" },
      },
    },
    handler: async (args, ctx) => {
      const end =
        typeof args.end === "string" && args.end
          ? args.end
          : new Date().toISOString();
      return clockifyFetch(
        `/workspaces/${ctx.workspaceId}/user/${ctx.userId}/time-entries`,
        { method: "PATCH", body: JSON.stringify({ end }) },
      );
    },
  },
  {
    name: "getInProgress",
    description:
      "Get the currently running time entry in the workspace, if any.",
    inputSchema: { type: "object", properties: {} },
    handler: async (_args, ctx) =>
      clockifyFetch(
        `/workspaces/${ctx.workspaceId}/time-entries/status/in-progress`,
      ),
  },
];
