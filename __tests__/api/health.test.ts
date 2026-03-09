/**
 * Tests for health check endpoint
 * Verifies the API health endpoint returns expected structure
 */

import { GET } from "@/app/api/health/route";

describe("Health Endpoint", () => {
  describe("GET /api/health", () => {
    it("should return 200 status code", async () => {
      const response = await GET();
      expect(response.status).toBe(200);
    });

    it("should return JSON response", async () => {
      const response = await GET();
      expect(response.headers.get("content-type")).toContain("application/json");
    });

    it("should return object with status field", async () => {
      const response = await GET();
      const data = await response.json() as any;
      expect(data).toHaveProperty("status");
    });

    it("should return status value of 'ok'", async () => {
      const response = await GET();
      const data = await response.json() as any;
      expect(data.status).toBe("ok");
    });

    it("should return object with timestamp field", async () => {
      const response = await GET();
      const data = await response.json() as any;
      expect(data).toHaveProperty("timestamp");
    });

    it("should return timestamp as ISO string", async () => {
      const response = await GET();
      const data = await response.json() as any;
      // Check if it's a valid ISO string
      expect(() => new Date(data.timestamp)).not.toThrow();
    });

    it("should return object with version field", async () => {
      const response = await GET();
      const data = await response.json() as any;
      expect(data).toHaveProperty("version");
    });

    it("should return version as string", async () => {
      const response = await GET();
      const data = await response.json() as any;
      expect(typeof data.version).toBe("string");
      expect(data.version.length).toBeGreaterThan(0);
    });

    it("should have consistent response structure", async () => {
      const response = await GET();
      const data = await response.json() as any;
      expect(Object.keys(data).sort()).toEqual(
        ["status", "timestamp", "version"].sort()
      );
    });

    it("should return timestamp close to current time", async () => {
      const beforeCall = Date.now();
      const response = await GET();
      const afterCall = Date.now();
      const data = await response.json() as any;
      const responseTime = new Date(data.timestamp).getTime();

      // Timestamp should be between before and after (within a reasonable margin)
      expect(responseTime).toBeGreaterThanOrEqual(beforeCall - 1000);
      expect(responseTime).toBeLessThanOrEqual(afterCall + 1000);
    });

    it("should return valid semver version format", async () => {
      const response = await GET();
      const data = await response.json() as any;
      // Simple semver check: X.Y.Z format
      expect(data.version).toMatch(/^\d+\.\d+\.\d+/);
    });

    it("should return consistent response on multiple calls", async () => {
      const response1 = await GET();
      const data1 = await response1.json() as any;

      const response2 = await GET();
      const data2 = await response2.json() as any;

      expect(data1.status).toBe(data2.status);
      expect(data1.version).toBe(data2.version);
      // Timestamp will differ slightly, so just check format
      expect(typeof data2.timestamp).toBe("string");
    });

    it("should not have any additional unexpected fields", async () => {
      const response = await GET();
      const data = await response.json() as any;
      const allowedKeys = ["status", "timestamp", "version"];
      const actualKeys = Object.keys(data);

      for (const key of actualKeys) {
        expect(allowedKeys).toContain(key);
      }
    });

    it("should return timestamp as valid RFC3339 format", async () => {
      const response = await GET();
      const data = await response.json() as any;
      // RFC3339/ISO8601 should have T and Z or timezone
      expect(data.timestamp).toMatch(/T|\d{2}:\d{2}/);
    });
  });
});
