/**
 * Tests for score calculation API endpoint
 * Comprehensive coverage of POST /api/score request handling and validation
 */

import { POST } from "@/app/api/score/route";

describe("Score API Endpoint", () => {
  describe("POST /api/score - Valid Requests", () => {
    it("should return 200 status for valid request", async () => {
      const answers = {
        "budget-range": "large",
        "budget-approval": "approved",
        "decision-role": "decision_maker",
        "buying-process": "agile",
        "pain-points": "critical",
        urgency: "immediate",
        implementation: "quick",
      };

      const req = new Request("http://localhost/api/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      });

      const response = await POST(req as any);
      expect(response.status).toBe(200);
    });

    it("should return JSON response", async () => {
      const answers = {
        "budget-range": "large",
        "budget-approval": "approved",
        "decision-role": "decision_maker",
        "buying-process": "standard",
        "pain-points": "critical",
        urgency: "immediate",
        implementation: "quick",
      };

      const req = new Request("http://localhost/api/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      });

      const response = await POST(req as any);
      expect(response.headers.get("content-type")).toContain("application/json");
    });

    it("should return totalScore property", async () => {
      const answers = {
        "budget-range": "large",
        "budget-approval": "approved",
        "decision-role": "decision_maker",
        "buying-process": "agile",
        "pain-points": "critical",
        urgency: "immediate",
        implementation: "quick",
      };

      const req = new Request("http://localhost/api/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      });

      const response = await POST(req as any);
      const data = (await response.json()) as any;
      expect(data).toHaveProperty("totalScore");
      expect(typeof data.totalScore).toBe("number");
    });

    it("should return qualified property as boolean", async () => {
      const answers = {
        "budget-range": "large",
        "budget-approval": "approved",
        "decision-role": "decision_maker",
        "buying-process": "agile",
        "pain-points": "critical",
        urgency: "immediate",
        implementation: "quick",
      };

      const req = new Request("http://localhost/api/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      });

      const response = await POST(req as any);
      const data = (await response.json()) as any;
      expect(data).toHaveProperty("qualified");
      expect(typeof data.qualified).toBe("boolean");
    });

    it("should return breakdown property as object", async () => {
      const answers = {
        "budget-range": "large",
        "budget-approval": "approved",
        "decision-role": "decision_maker",
        "buying-process": "agile",
        "pain-points": "critical",
        urgency: "immediate",
        implementation: "quick",
      };

      const req = new Request("http://localhost/api/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      });

      const response = await POST(req as any);
      const data = (await response.json()) as any;
      expect(data).toHaveProperty("breakdown");
      expect(typeof data.breakdown).toBe("object");
    });

    it("should return totalScore between 0 and 100", async () => {
      const answers = {
        "budget-range": "large",
        "budget-approval": "approved",
        "decision-role": "decision_maker",
        "buying-process": "agile",
        "pain-points": "critical",
        urgency: "immediate",
        implementation: "quick",
      };

      const req = new Request("http://localhost/api/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      });

      const response = await POST(req as any);
      const data = (await response.json()) as any;
      expect(data.totalScore).toBeGreaterThanOrEqual(0);
      expect(data.totalScore).toBeLessThanOrEqual(100);
    });

    it("should return breakdown with numeric percentage values", async () => {
      const answers = {
        "budget-range": "large",
        "budget-approval": "approved",
        "decision-role": "decision_maker",
        "buying-process": "agile",
        "pain-points": "critical",
        urgency: "immediate",
        implementation: "quick",
      };

      const req = new Request("http://localhost/api/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      });

      const response = await POST(req as any);
      const data = (await response.json()) as any;
      Object.values(data.breakdown).forEach((value) => {
        expect(typeof value).toBe("number");
        expect(value).toBeGreaterThanOrEqual(0);
        expect(value).toBeLessThanOrEqual(100);
      });
    });

    it("should qualify high-scoring leads", async () => {
      const answers = {
        "budget-range": "large",
        "budget-approval": "approved",
        "decision-role": "decision_maker",
        "buying-process": "agile",
        "pain-points": "critical",
        urgency: "immediate",
        implementation: "quick",
      };

      const req = new Request("http://localhost/api/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      });

      const response = await POST(req as any);
      const data = (await response.json()) as any;
      expect(data.qualified).toBe(true);
      expect(data.totalScore).toBeGreaterThan(50);
    });

    it("should disqualify low-scoring leads", async () => {
      const answers = {
        "budget-range": "minimal",
        "budget-approval": "unapproved",
        "decision-role": "researcher",
        "buying-process": "complex",
        "pain-points": "low",
        urgency: "someday",
        implementation: "distant",
      };

      const req = new Request("http://localhost/api/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      });

      const response = await POST(req as any);
      const data = (await response.json()) as any;
      expect(data.qualified).toBe(false);
      expect(data.totalScore).toBeLessThan(50);
    });

    it("should handle partial answers (missing some questions)", async () => {
      const answers = {
        "budget-range": "large",
        "budget-approval": "approved",
        "decision-role": "decision_maker",
        // Missing other questions
      };

      const req = new Request("http://localhost/api/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      });

      const response = await POST(req as any);
      expect(response.status).toBe(200);
      const data = (await response.json()) as any;
      expect(typeof data.totalScore).toBe("number");
      expect(typeof data.qualified).toBe("boolean");
    });
  });

  describe("POST /api/score - Empty Answers", () => {
    it("should handle empty answers object", async () => {
      const req = new Request("http://localhost/api/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: {} }),
      });

      const response = await POST(req as any);
      expect(response.status).toBe(200);
      const data = (await response.json()) as any;
      expect(typeof data.totalScore).toBe("number");
      expect(typeof data.qualified).toBe("boolean");
    });

    it("should return score of 0 for empty answers", async () => {
      const req = new Request("http://localhost/api/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: {} }),
      });

      const response = await POST(req as any);
      const data = (await response.json()) as any;
      expect(data.totalScore).toBe(0);
    });

    it("should return unqualified for empty answers", async () => {
      const req = new Request("http://localhost/api/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: {} }),
      });

      const response = await POST(req as any);
      const data = (await response.json()) as any;
      expect(data.qualified).toBe(false);
    });
  });

  describe("POST /api/score - Invalid Format", () => {
    it("should reject invalid JSON with 400", async () => {
      const req = new Request("http://localhost/api/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "{invalid json}",
      });

      const response = await POST(req as any);
      expect(response.status).toBe(400);
    });

    it("should return error message for invalid JSON", async () => {
      const req = new Request("http://localhost/api/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "{invalid json}",
      });

      const response = await POST(req as any);
      const data = (await response.json()) as any;
      expect(data).toHaveProperty("error");
      expect(data.error).toBe("Invalid request body");
    });

    it("should reject non-object body with 400", async () => {
      const req = new Request("http://localhost/api/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify([1, 2, 3]),
      });

      const response = await POST(req as any);
      expect(response.status).toBe(400);
    });

    it("should reject array body with error", async () => {
      const req = new Request("http://localhost/api/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify([1, 2, 3]),
      });

      const response = await POST(req as any);
      const data = (await response.json()) as any;
      expect(data).toHaveProperty("error");
    });

    it("should reject string body with 400", async () => {
      const req = new Request("http://localhost/api/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify("not an object"),
      });

      const response = await POST(req as any);
      expect(response.status).toBe(400);
    });

    it("should reject null body with 400", async () => {
      const req = new Request("http://localhost/api/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(null),
      });

      const response = await POST(req as any);
      expect(response.status).toBe(400);
    });
  });

  describe("POST /api/score - Invalid Answers", () => {
    it("should reject non-string answer values with 400", async () => {
      const answers = {
        "budget-range": 123, // Should be string
      };

      const req = new Request("http://localhost/api/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      });

      const response = await POST(req as any);
      expect(response.status).toBe(400);
    });

    it("should return error for invalid answers format", async () => {
      const answers = {
        "budget-range": 123,
      };

      const req = new Request("http://localhost/api/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      });

      const response = await POST(req as any);
      const data = (await response.json()) as any;
      expect(data).toHaveProperty("error");
      expect(data.error).toBe("Invalid answers");
    });

    it("should reject answers with null values", async () => {
      const answers = {
        "budget-range": null,
      };

      const req = new Request("http://localhost/api/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      });

      const response = await POST(req as any);
      expect(response.status).toBe(400);
    });

    it("should handle answers with undefined values (stripped in JSON)", async () => {
      // Note: JSON.stringify removes undefined values, so this becomes empty object
      const answers = {
        "budget-range": undefined,
      };

      const req = new Request("http://localhost/api/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      });

      const response = await POST(req as any);
      // Empty answers object is valid, returns a score
      expect(response.status).toBe(200);
    });

    it("should reject answers with excessively long values", async () => {
      const answers = {
        "budget-range": "a".repeat(51),
      };

      const req = new Request("http://localhost/api/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      });

      const response = await POST(req as any);
      expect(response.status).toBe(400);
    });

    it("should reject more than 50 answers", async () => {
      const answers: any = {};
      for (let i = 0; i < 51; i++) {
        answers[`q-${i}`] = "answer";
      }

      const req = new Request("http://localhost/api/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      });

      const response = await POST(req as any);
      expect(response.status).toBe(400);
    });

    it("should reject answers object with invalid key names", async () => {
      const answers = {
        "invalid<key>": "value",
      };

      const req = new Request("http://localhost/api/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      });

      const response = await POST(req as any);
      expect(response.status).toBe(400);
    });
  });

  describe("POST /api/score - Missing Request Body", () => {
    it("should return 400 for missing answers property", async () => {
      const req = new Request("http://localhost/api/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      const response = await POST(req as any);
      expect(response.status).toBe(400);
    });

    it("should return error for missing answers property", async () => {
      const req = new Request("http://localhost/api/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      const response = await POST(req as any);
      const data = (await response.json()) as any;
      expect(data).toHaveProperty("error");
      expect(data.error).toBe("Invalid answers");
    });

    it("should reject null answers property", async () => {
      const req = new Request("http://localhost/api/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: null }),
      });

      const response = await POST(req as any);
      expect(response.status).toBe(400);
    });

    it("should reject answers as array", async () => {
      const req = new Request("http://localhost/api/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: [] }),
      });

      const response = await POST(req as any);
      expect(response.status).toBe(400);
    });

    it("should reject answers as string", async () => {
      const req = new Request("http://localhost/api/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: "not an object" }),
      });

      const response = await POST(req as any);
      expect(response.status).toBe(400);
    });
  });

  describe("POST /api/score - Response Consistency", () => {
    it("should return consistent structure for multiple calls", async () => {
      const answers = {
        "budget-range": "large",
        "budget-approval": "approved",
        "decision-role": "decision_maker",
        "buying-process": "agile",
        "pain-points": "critical",
        urgency: "immediate",
        implementation: "quick",
      };

      const req1 = new Request("http://localhost/api/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      });

      const response1 = await POST(req1 as any);
      const data1 = (await response1.json()) as any;

      const req2 = new Request("http://localhost/api/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      });

      const response2 = await POST(req2 as any);
      const data2 = (await response2.json()) as any;

      expect(data1.totalScore).toBe(data2.totalScore);
      expect(data1.qualified).toBe(data2.qualified);
      expect(data1.breakdown).toEqual(data2.breakdown);
    });

    it("should not have error property in success response", async () => {
      const answers = {
        "budget-range": "large",
        "budget-approval": "approved",
        "decision-role": "decision_maker",
        "buying-process": "agile",
        "pain-points": "critical",
        urgency: "immediate",
        implementation: "quick",
      };

      const req = new Request("http://localhost/api/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      });

      const response = await POST(req as any);
      const data = (await response.json()) as any;
      expect(data).not.toHaveProperty("error");
    });

    it("should have error property in error response", async () => {
      const req = new Request("http://localhost/api/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "{invalid}",
      });

      const response = await POST(req as any);
      const data = (await response.json()) as any;
      expect(data).toHaveProperty("error");
    });
  });
});
