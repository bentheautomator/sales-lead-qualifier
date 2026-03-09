/**
 * Tests for URL parameter utilities
 * Comprehensive coverage of result URL creation and parsing
 */

import {
  RESULT_PARAMS,
  createResultUrl,
  parseResultParams,
} from "@/lib/queryParams";

describe("Query Parameters Utilities", () => {
  describe("RESULT_PARAMS", () => {
    it("should have SCORE key defined", () => {
      expect(RESULT_PARAMS).toHaveProperty("SCORE");
      expect(typeof RESULT_PARAMS.SCORE).toBe("string");
    });

    it("should have QUALIFIED key defined", () => {
      expect(RESULT_PARAMS).toHaveProperty("QUALIFIED");
      expect(typeof RESULT_PARAMS.QUALIFIED).toBe("string");
    });

    it("should have BREAKDOWN key defined", () => {
      expect(RESULT_PARAMS).toHaveProperty("BREAKDOWN");
      expect(typeof RESULT_PARAMS.BREAKDOWN).toBe("string");
    });

    it("should have string values for all keys", () => {
      Object.values(RESULT_PARAMS).forEach((value) => {
        expect(typeof value).toBe("string");
        expect(value.length).toBeGreaterThan(0);
      });
    });
  });

  describe("createResultUrl", () => {
    it("should create URL starting with /result?", () => {
      const url = createResultUrl(85, true, { budget: 80, authority: 75 });
      expect(url).toMatch(/^\/result\?/);
    });

    it("should encode score parameter", () => {
      const url = createResultUrl(85, true, {});
      expect(url).toContain(RESULT_PARAMS.SCORE);
      expect(url).toContain("85");
    });

    it("should encode qualified as true", () => {
      const url = createResultUrl(85, true, {});
      expect(url).toContain(RESULT_PARAMS.QUALIFIED);
      expect(url).toContain("true");
    });

    it("should encode qualified as false", () => {
      const url = createResultUrl(45, false, {});
      expect(url).toContain(RESULT_PARAMS.QUALIFIED);
      expect(url).toContain("false");
    });

    it("should encode breakdown as JSON parameter", () => {
      const breakdown = { budget: 80, authority: 75, need: 90, timeline: 60 };
      const url = createResultUrl(85, true, breakdown);
      expect(url).toContain(RESULT_PARAMS.BREAKDOWN);
    });

    it("should handle empty breakdown object", () => {
      const url = createResultUrl(50, false, {});
      expect(url).toContain(RESULT_PARAMS.BREAKDOWN);
    });

    it("should handle score of 0", () => {
      const url = createResultUrl(0, false, {});
      expect(url).toContain("0");
    });

    it("should handle score of 100", () => {
      const url = createResultUrl(100, true, {});
      expect(url).toContain("100");
    });

    it("should create valid URL that can be parsed", () => {
      const breakdown = { test_key: 50 };
      const url = createResultUrl(75, true, breakdown);
      expect(() => new URL(url, "http://localhost")).not.toThrow();
    });

    it("should create valid URL with multiple breakdown dimensions", () => {
      const breakdown = {
        budget: 100,
        authority: 80,
        need: 90,
        timeline: 70,
      };
      const url = createResultUrl(85, true, breakdown);
      expect(url).toMatch(/^\/result\?/);
      const searchParams = new URLSearchParams(url.split("?")[1]);
      expect(searchParams.size).toBe(3);
    });

    it("should create consistent URLs for same input", () => {
      const breakdown = { budget: 80, authority: 75 };
      const url1 = createResultUrl(85, true, breakdown);
      const url2 = createResultUrl(85, true, breakdown);
      expect(url1).toBe(url2);
    });

    it("should separate parameters with ampersand", () => {
      const url = createResultUrl(85, true, { budget: 80 });
      const paramCount = (url.match(/&/g) || []).length;
      expect(paramCount).toBeGreaterThanOrEqual(2);
    });
  });

  describe("parseResultParams", () => {
    it("should parse valid URLSearchParams", () => {
      const params = new URLSearchParams();
      params.set(RESULT_PARAMS.SCORE, "85");
      params.set(RESULT_PARAMS.QUALIFIED, "true");
      params.set(RESULT_PARAMS.BREAKDOWN, JSON.stringify({ budget: 80 }));

      const result = parseResultParams(params);
      expect(result).not.toBeNull();
      expect(result!.score).toBe(85);
    });

    it("should parse qualified as boolean", () => {
      const params = new URLSearchParams();
      params.set(RESULT_PARAMS.SCORE, "85");
      params.set(RESULT_PARAMS.QUALIFIED, "true");
      params.set(RESULT_PARAMS.BREAKDOWN, "{}");

      const result = parseResultParams(params);
      expect(result).not.toBeNull();
      expect(result!.qualified).toBe(true);
    });

    it("should parse qualified=false as boolean", () => {
      const params = new URLSearchParams();
      params.set(RESULT_PARAMS.SCORE, "45");
      params.set(RESULT_PARAMS.QUALIFIED, "false");
      params.set(RESULT_PARAMS.BREAKDOWN, "{}");

      const result = parseResultParams(params);
      expect(result).not.toBeNull();
      expect(result!.qualified).toBe(false);
    });

    it("should parse breakdown as object", () => {
      const breakdown = { budget: 80, authority: 75 };
      const params = new URLSearchParams();
      params.set(RESULT_PARAMS.SCORE, "85");
      params.set(RESULT_PARAMS.QUALIFIED, "true");
      params.set(RESULT_PARAMS.BREAKDOWN, JSON.stringify(breakdown));

      const result = parseResultParams(params);
      expect(result).not.toBeNull();
      expect(result!.breakdown).toEqual(breakdown);
    });

    it("should return null for missing score", () => {
      const params = new URLSearchParams();
      params.set(RESULT_PARAMS.QUALIFIED, "true");
      params.set(RESULT_PARAMS.BREAKDOWN, "{}");

      const result = parseResultParams(params);
      expect(result).toBeNull();
    });

    it("should return null for missing qualified", () => {
      const params = new URLSearchParams();
      params.set(RESULT_PARAMS.SCORE, "85");
      params.set(RESULT_PARAMS.BREAKDOWN, "{}");

      const result = parseResultParams(params);
      expect(result).toBeNull();
    });

    it("should return null for missing breakdown", () => {
      const params = new URLSearchParams();
      params.set(RESULT_PARAMS.SCORE, "85");
      params.set(RESULT_PARAMS.QUALIFIED, "true");

      const result = parseResultParams(params);
      expect(result).toBeNull();
    });

    it("should return null for empty URLSearchParams", () => {
      const params = new URLSearchParams();
      const result = parseResultParams(params);
      expect(result).toBeNull();
    });

    it("should parse score of 0", () => {
      const params = new URLSearchParams();
      params.set(RESULT_PARAMS.SCORE, "0");
      params.set(RESULT_PARAMS.QUALIFIED, "false");
      params.set(RESULT_PARAMS.BREAKDOWN, "{}");

      const result = parseResultParams(params);
      expect(result).not.toBeNull();
      expect(result!.score).toBe(0);
    });

    it("should parse score of 100", () => {
      const params = new URLSearchParams();
      params.set(RESULT_PARAMS.SCORE, "100");
      params.set(RESULT_PARAMS.QUALIFIED, "true");
      params.set(RESULT_PARAMS.BREAKDOWN, "{}");

      const result = parseResultParams(params);
      expect(result).not.toBeNull();
      expect(result!.score).toBe(100);
    });

    it("should return null for score out of range (negative)", () => {
      const params = new URLSearchParams();
      params.set(RESULT_PARAMS.SCORE, "-1");
      params.set(RESULT_PARAMS.QUALIFIED, "true");
      params.set(RESULT_PARAMS.BREAKDOWN, "{}");

      const result = parseResultParams(params);
      expect(result).toBeNull();
    });

    it("should parse complex breakdown with multiple dimensions", () => {
      const breakdown = {
        budget: 100,
        authority: 80,
        need: 90,
        timeline: 70,
      };
      const params = new URLSearchParams();
      params.set(RESULT_PARAMS.SCORE, "85");
      params.set(RESULT_PARAMS.QUALIFIED, "true");
      params.set(RESULT_PARAMS.BREAKDOWN, JSON.stringify(breakdown));

      const result = parseResultParams(params);
      expect(result).not.toBeNull();
      expect(result!.breakdown).toEqual(breakdown);
      expect(Object.keys(result!.breakdown)).toHaveLength(4);
    });

    it("should parse empty breakdown object", () => {
      const params = new URLSearchParams();
      params.set(RESULT_PARAMS.SCORE, "50");
      params.set(RESULT_PARAMS.QUALIFIED, "false");
      params.set(RESULT_PARAMS.BREAKDOWN, "{}");

      const result = parseResultParams(params);
      expect(result).not.toBeNull();
      expect(result!.breakdown).toEqual({});
    });
  });

  describe("Round-trip: createResultUrl -> parseResultParams", () => {
    it("should preserve data in round-trip", () => {
      const breakdown = { budget: 80, authority: 75 };
      const url = createResultUrl(85, true, breakdown);
      const searchParams = new URLSearchParams(url.split("?")[1]);
      const parsed = parseResultParams(searchParams);

      expect(parsed).not.toBeNull();
      expect(parsed!.score).toBe(85);
      expect(parsed!.qualified).toBe(true);
      expect(parsed!.breakdown).toEqual(breakdown);
    });

    it("should preserve zero score in round-trip", () => {
      const url = createResultUrl(0, false, {});
      const searchParams = new URLSearchParams(url.split("?")[1]);
      const parsed = parseResultParams(searchParams);

      expect(parsed).not.toBeNull();
      expect(parsed!.score).toBe(0);
      expect(parsed!.qualified).toBe(false);
    });

    it("should preserve complex breakdown in round-trip", () => {
      const breakdown = {
        budget: 100,
        authority: 80,
        need: 90,
        timeline: 70,
      };
      const url = createResultUrl(85, true, breakdown);
      const searchParams = new URLSearchParams(url.split("?")[1]);
      const parsed = parseResultParams(searchParams);

      expect(parsed).not.toBeNull();
      expect(parsed!.breakdown).toEqual(breakdown);
    });
  });
});
