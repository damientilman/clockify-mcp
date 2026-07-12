import { describe, it, expect, vi, beforeEach, Mock } from "vitest";
import { listToolsHandler, callToolHandler } from "../src/handlers";

let fetchMock: Mock;

beforeEach(() => {
  vi.restoreAllMocks();
  fetchMock = vi.fn();
  global.fetch = fetchMock;
  process.env.CLOCKIFY_API_KEY = "dummy-key";
});

describe("MCP Server Tools", () => {
  it("should list available tools", async () => {
    const result = await listToolsHandler();
    const tools: Array<{ name: string }> = result.tools;
    expect(tools).toBeDefined();
    expect(tools.some((t) => t.name === "listProjects")).toBe(true);
    expect(tools.some((t) => t.name === "getTimeEntries")).toBe(true);
    expect(tools.some((t) => t.name === "addTimeEntry")).toBe(true);
    expect(tools.some((t) => t.name === "listUsers")).toBe(true);
    expect(tools.some((t) => t.name === "getUserTimeEntries")).toBe(true);
    expect(tools.some((t) => t.name === "getSummaryReport")).toBe(true);
  });

  it("should call listProjects tool and return mocked projects", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ activeWorkspace: "ws1", id: "user1" }),
    });
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => [{ id: "p1", name: "Project 1" }],
    });
    const result = await callToolHandler({
      params: { name: "listProjects", arguments: {} },
    });
    const projects: Array<{ id: string; name: string }> = JSON.parse(
      result.content[0].text,
    );
    expect(projects[0].name).toBe("Project 1");
  });

  it("should call getTimeEntries tool and return mocked entries", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ activeWorkspace: "ws1", id: "user1" }),
    });
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => [{ id: "te1", description: "Worked on X" }],
    });
    const result = await callToolHandler({
      params: { name: "getTimeEntries", arguments: {} },
    });
    const entries: Array<{ id: string; description: string }> = JSON.parse(
      result.content[0].text,
    );
    expect(entries[0].description).toBe("Worked on X");
  });

  it("should call addTimeEntry tool and return mocked entry", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ activeWorkspace: "ws1", id: "user1" }),
    });
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: "te2", description: "Added entry" }),
    });
    const result = await callToolHandler({
      params: {
        name: "addTimeEntry",
        arguments: {
          projectId: "p1",
          description: "Added entry",
          start: "2024-01-01T00:00:00Z",
          end: "2024-01-01T01:00:00Z",
        },
      },
    });
    const entry: { id: string; description: string } = JSON.parse(
      result.content[0].text,
    );
    expect(entry.description).toBe("Added entry");
  });

  it("should call listUsers tool and return mocked users", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ activeWorkspace: "ws1", id: "user1" }),
    });
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => [
        { id: "u1", name: "Alice" },
        { id: "u2", name: "Bob" },
      ],
    });
    const result = await callToolHandler({
      params: { name: "listUsers", arguments: {} },
    });
    const users: Array<{ id: string; name: string }> = JSON.parse(
      result.content[0].text,
    );
    expect(users.length).toBe(2);
    expect(users[0].name).toBe("Alice");
  });

  it("should call getUserTimeEntries tool and return mocked entries", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ activeWorkspace: "ws1", id: "user1" }),
    });
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => [{ id: "te1", description: "Worked on Project" }],
    });
    const result = await callToolHandler({
      params: {
        name: "getUserTimeEntries",
        arguments: { userId: "u1", start: "2024-01-01", end: "2024-01-31" },
      },
    });
    const entries: Array<{ id: string; description: string }> = JSON.parse(
      result.content[0].text,
    );
    expect(entries[0].description).toBe("Worked on Project");
  });

  it("should call getSummaryReport tool and return mocked summary", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ activeWorkspace: "ws1", id: "user1" }),
    });
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        totals: [
          { userId: "u1", projectId: "p1", totalTime: 3600 },
          { userId: "u2", projectId: "p2", totalTime: 1800 },
        ],
      }),
    });
    const result = await callToolHandler({
      params: {
        name: "getSummaryReport",
        arguments: {
          start: "2024-01-01",
          end: "2024-01-31",
          userIds: ["u1", "u2"],
          projectIds: ["p1", "p2"],
        },
      },
    });
    const summary: {
      totals: Array<{ userId: string; projectId: string; totalTime: number }>;
    } = JSON.parse(result.content[0].text);
    expect(summary.totals.length).toBe(2);
    expect(summary.totals[0].userId).toBe("u1");
    expect(summary.totals[1].totalTime).toBe(1800);

    const [reportUrl, reportInit] = fetchMock.mock.calls[1];
    expect(reportUrl).toBe(
      "https://reports.api.clockify.me/v1/workspaces/ws1/reports/summary",
    );
    const sentBody = JSON.parse(reportInit.body);
    expect(sentBody.summaryFilter.groups).toEqual(["USER", "PROJECT"]);
    expect(sentBody.users).toEqual({
      ids: ["u1", "u2"],
      contains: "CONTAINS",
      status: "ALL",
    });
    expect(sentBody.projects).toEqual({
      ids: ["p1", "p2"],
      contains: "CONTAINS",
      status: "ALL",
    });
  });

  it("should call getUserTimeEntriesByName tool and return mocked entries", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ activeWorkspace: "ws1", id: "user1" }),
    });
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => [
        { id: "u1", name: "Inaki Anduaga" },
        { id: "u2", name: "Bob" },
      ],
    });
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => [{ id: "te1", description: "Worked on Project" }],
    });
    const result = await callToolHandler({
      params: {
        name: "getUserTimeEntriesByName",
        arguments: {
          userName: "inaki anduaga",
          start: "2024-04-01",
          end: "2024-04-30",
        },
      },
    });
    const entries: Array<{ id: string; description: string }> = JSON.parse(
      result.content[0].text,
    );
    expect(entries[0].description).toBe("Worked on Project");
  });

  it("should expose the extended tool set", async () => {
    const result = await listToolsHandler();
    const names = result.tools.map((t) => t.name);
    for (const name of [
      "listClients",
      "createClient",
      "deleteTimeEntry",
      "startTimer",
      "stopTimer",
      "getInProgress",
      "getDetailedReport",
      "getWeeklyReport",
      "listTags",
      "createTask",
    ]) {
      expect(names).toContain(name);
    }
  });

  it("should call createClient with a POST to the clients endpoint", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ activeWorkspace: "ws1", id: "user1" }),
    });
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: "c1", name: "New Client" }),
    });
    const result = await callToolHandler({
      params: { name: "createClient", arguments: { name: "New Client" } },
    });
    const [url, init] = fetchMock.mock.calls[1];
    expect(url).toBe("https://api.clockify.me/api/v1/workspaces/ws1/clients");
    expect(init.method).toBe("POST");
    expect(JSON.parse(init.body)).toEqual({ name: "New Client" });
    const client = JSON.parse(result.content[0].text);
    expect(client.name).toBe("New Client");
  });

  it("should delete a time entry and tolerate a 204 empty response", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ activeWorkspace: "ws1", id: "user1" }),
    });
    fetchMock.mockResolvedValueOnce({ ok: true, status: 204 });
    const result = await callToolHandler({
      params: { name: "deleteTimeEntry", arguments: { timeEntryId: "te9" } },
    });
    const [url, init] = fetchMock.mock.calls[1];
    expect(url).toBe(
      "https://api.clockify.me/api/v1/workspaces/ws1/time-entries/te9",
    );
    expect(init.method).toBe("DELETE");
    expect(JSON.parse(result.content[0].text)).toEqual({ success: true });
  });

  it("should start a timer with a start and no end", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ activeWorkspace: "ws1", id: "user1" }),
    });
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: "te10", timeInterval: { end: null } }),
    });
    await callToolHandler({
      params: {
        name: "startTimer",
        arguments: { projectId: "p1", description: "Focus" },
      },
    });
    const [url, init] = fetchMock.mock.calls[1];
    expect(url).toBe(
      "https://api.clockify.me/api/v1/workspaces/ws1/time-entries",
    );
    expect(init.method).toBe("POST");
    const body = JSON.parse(init.body);
    expect(body.end).toBeUndefined();
    expect(typeof body.start).toBe("string");
    expect(body.projectId).toBe("p1");
  });

  it("should stop the running timer with a PATCH setting end", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ activeWorkspace: "ws1", id: "user1" }),
    });
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: "te10" }),
    });
    await callToolHandler({
      params: { name: "stopTimer", arguments: { end: "2026-07-12T10:00:00Z" } },
    });
    const [url, init] = fetchMock.mock.calls[1];
    expect(url).toBe(
      "https://api.clockify.me/api/v1/workspaces/ws1/user/user1/time-entries",
    );
    expect(init.method).toBe("PATCH");
    expect(JSON.parse(init.body)).toEqual({ end: "2026-07-12T10:00:00Z" });
  });

  it("should call getDetailedReport against the reports host with pagination", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ activeWorkspace: "ws1", id: "user1" }),
    });
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ timeentries: [] }),
    });
    await callToolHandler({
      params: {
        name: "getDetailedReport",
        arguments: {
          start: "2026-07-01T00:00:00.000Z",
          end: "2026-07-12T23:59:59.999Z",
          pageSize: 100,
        },
      },
    });
    const [url, init] = fetchMock.mock.calls[1];
    expect(url).toBe(
      "https://reports.api.clockify.me/v1/workspaces/ws1/reports/detailed",
    );
    const body = JSON.parse(init.body);
    expect(body.detailedFilter).toEqual({ page: 1, pageSize: 100 });
  });

  it("should throw on an unknown tool", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ activeWorkspace: "ws1", id: "user1" }),
    });
    await expect(
      callToolHandler({ params: { name: "nope", arguments: {} } }),
    ).rejects.toThrow(/Unknown tool/);
  });
});
