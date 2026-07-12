import process from "node:process";
import type { ClockifyContext } from "./tools/types.js";

// Get API key from MCP config.
export function getApiKey(): string {
  const apiKey = process.env.CLOCKIFY_API_KEY;
  if (!apiKey) {
    throw new Error("CLOCKIFY_API_KEY is not set in MCP config.");
  }
  return apiKey;
}

// Call the Clockify API. Relative paths hit the main API host; absolute URLs
// (starting with http) are used as-is, which is how the Reports API host is reached.
export async function clockifyFetch(
  endpoint: string,
  options: RequestInit = {},
) {
  const apiKey = getApiKey();
  const baseUrl = "https://api.clockify.me/api/v1";
  const url = endpoint.startsWith("http") ? endpoint : `${baseUrl}${endpoint}`;
  const headers = {
    "X-Api-Key": apiKey,
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };
  const response = await fetch(url, { ...options, headers });

  if (!response.ok) {
    const text = await response.text();
    console.error(
      `[Error] Clockify API ${url} failed: ${response.status} ${text}`,
    );
    throw new Error(`Clockify API error: ${response.status} ${text}`);
  }
  // Some endpoints (e.g. deleting a time entry) reply 204 with no body.
  if (response.status === 204 || response.status === 205) {
    return { success: true };
  }
  return response.json();
}

// Resolve the workspace and user for the current API key. Fetched per call so
// that mocked tests keep a stable "/user first" contract.
export async function getContext(): Promise<ClockifyContext> {
  const user = await clockifyFetch("/user");
  return {
    workspaceId: user.activeWorkspace,
    userId: user.id,
    user,
  };
}

// Read a required string argument or throw a clear error.
export function requireString(
  args: Record<string, unknown>,
  key: string,
): string {
  const value = args[key];
  if (typeof value !== "string" || !value) {
    throw new Error(`${key} is required`);
  }
  return value;
}

// Append optional start/end ISO8601 filters as a query string.
export function withDateRange(
  base: string,
  args: Record<string, unknown>,
): string {
  const params: string[] = [];
  const { start, end } = args;
  if (typeof start === "string" && start) {
    params.push(`start=${encodeURIComponent(start)}`);
  }
  if (typeof end === "string" && end) {
    params.push(`end=${encodeURIComponent(end)}`);
  }
  return params.length ? `${base}?${params.join("&")}` : base;
}

// Build a request body from the arguments that were actually provided.
export function pickBody(
  args: Record<string, unknown>,
  keys: string[],
): Record<string, unknown> {
  const body: Record<string, unknown> = {};
  for (const key of keys) {
    if (args[key] !== undefined) {
      body[key] = args[key];
    }
  }
  return body;
}
