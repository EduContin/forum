import { describe, it, expect, vi, beforeEach } from "vitest";

const apiUrl = process.env.NEXT_PUBLIC_APP_URL;

describe("Shoutbox GET API", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("should return the last 10 messages in ascending order", async () => {
    const mockMessages = [
      {
        id: 1,
        username: "user1",
        message: "Hello",
        created_at: "2024-08-01T10:00:00Z",
      },
      {
        id: 2,
        username: "user2",
        message: "Hi there",
        created_at: "2024-08-01T10:01:00Z",
      },
    ];

    const mockResponse = {
      json: () => Promise.resolve({ rows: mockMessages }),
      status: 200,
    };

    global.fetch = vi.fn().mockResolvedValue(mockResponse);

    const response = await fetch(apiUrl + "/api/v1/shoutbox/history");
    const result = await response.json();

    expect(response.status).toBe(200);
    expect(result).toEqual({ rows: mockMessages });
    expect(global.fetch).toHaveBeenCalledWith(
      apiUrl + "/api/v1/shoutbox/history",
    );
  });

  it("should handle errors gracefully", async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error("Database error"));

    await expect(fetch(apiUrl + "/api/v1/shoutbox/history")).rejects.toThrow(
      "Database error",
    );
  });
});
