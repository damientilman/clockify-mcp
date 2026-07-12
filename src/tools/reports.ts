import { clockifyFetch, requireString } from "../clockify.js";
import type { ToolDef } from "./types.js";

const REPORTS_BASE = "https://reports.api.clockify.me/v1";

// Shared start/end + optional users/projects filters for every report type.
const dateRangeSchema = {
  start: { type: "string", description: "Start date (ISO8601)" },
  end: { type: "string", description: "End date (ISO8601)" },
  userIds: {
    type: "array",
    items: { type: "string" },
    description: "Filter by user ids (optional)",
  },
  projectIds: {
    type: "array",
    items: { type: "string" },
    description: "Filter by project ids (optional)",
  },
};

// Build the base report body plus id filters when provided.
function reportBody(args: Record<string, unknown>): Record<string, unknown> {
  const start = requireString(args, "start");
  const end = requireString(args, "end");
  const body: Record<string, unknown> = {
    dateRangeStart: start,
    dateRangeEnd: end,
    sortOrder: "ASCENDING",
  };
  const { userIds, projectIds } = args;
  if (Array.isArray(userIds) && userIds.length > 0) {
    body.users = { ids: userIds, contains: "CONTAINS", status: "ALL" };
  }
  if (Array.isArray(projectIds) && projectIds.length > 0) {
    body.projects = { ids: projectIds, contains: "CONTAINS", status: "ALL" };
  }
  return body;
}

function postReport(workspaceId: string, type: string, body: unknown) {
  return clockifyFetch(
    `${REPORTS_BASE}/workspaces/${workspaceId}/reports/${type}`,
    { method: "POST", body: JSON.stringify(body) },
  );
}

export const reportTools: ToolDef[] = [
  {
    name: "getSummaryReport",
    description:
      "Summary report of hours grouped by user then project for a date range. Monetary amounts are in cents (divide by 100).",
    inputSchema: {
      type: "object",
      properties: dateRangeSchema,
      required: ["start", "end"],
    },
    handler: async (args, ctx) => {
      const body = reportBody(args);
      body.summaryFilter = { groups: ["USER", "PROJECT"] };
      return postReport(ctx.workspaceId, "summary", body);
    },
  },
  {
    name: "getDetailedReport",
    description:
      "Detailed report: one row per time entry for a date range, paginated. Monetary amounts are in cents (divide by 100).",
    inputSchema: {
      type: "object",
      properties: {
        ...dateRangeSchema,
        page: { type: "number", description: "Page number (default 1)" },
        pageSize: {
          type: "number",
          description: "Rows per page (default 50, max 1000)",
        },
      },
      required: ["start", "end"],
    },
    handler: async (args, ctx) => {
      const body = reportBody(args);
      body.detailedFilter = {
        page: typeof args.page === "number" ? args.page : 1,
        pageSize: typeof args.pageSize === "number" ? args.pageSize : 50,
      };
      return postReport(ctx.workspaceId, "detailed", body);
    },
  },
  {
    name: "getWeeklyReport",
    description:
      "Weekly report of hours grouped by user for a date range. Monetary amounts are in cents (divide by 100).",
    inputSchema: {
      type: "object",
      properties: dateRangeSchema,
      required: ["start", "end"],
    },
    handler: async (args, ctx) => {
      const body = reportBody(args);
      body.weeklyFilter = { group: "USER", subgroup: "TIME" };
      return postReport(ctx.workspaceId, "weekly", body);
    },
  },
];
