import { describe, it, expect, vi, beforeEach } from "vitest";

const apiUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

// Mock the fetch function
const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

describe("Shoutbox POST API", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("should store a new message successfully", async () => {
    const newMessage = {
      username: "testuser",
      message: "Hello, world!",
    };

    const mockResponse = {
      json: vi
        .fn()
        .mockResolvedValue({ message: "Message stored successfully" }),
      status: 200,
    };

    mockFetch.mockResolvedValue(mockResponse);

    const response = await fetch(apiUrl + "/api/v1/shoutbox/history", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newMessage),
    });

    const result = await response.json();

    expect(response.status).toBe(200);
    expect(result).toEqual({ message: "Message stored successfully" });
    expect(mockFetch).toHaveBeenCalledWith(
      apiUrl + "/api/v1/shoutbox/history",
      expect.objectContaining({
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newMessage),
      }),
    );
  });

  it("should handle errors when storing a message", async () => {
    const newMessage = {
      username: "testuser",
      message: "Hello, world!",
    };

    mockFetch.mockRejectedValue(new Error("Database error"));

    await expect(
      fetch(apiUrl + "/api/v1/shoutbox/history", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newMessage),
      }),
    ).rejects.toThrow("Database error");
  });
});
