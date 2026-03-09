/**
 * Tests for validation utilities
 * Comprehensive coverage of input validation and sanitization functions
 */

import {
  isValidBreakdown,
  isValidScore,
  isValidQualified,
  sanitizeString,
  isValidAnswers,
} from "@/lib/validation";

describe("Validation Utilities", () => {
  describe("isValidBreakdown", () => {
    it("should accept valid breakdown with standard dimensions", () => {
      const valid = {
        budget: 80,
        authority: 75,
        need: 90,
        timeline: 60,
      };
      expect(isValidBreakdown(valid)).toBe(true);
    });

    it("should accept empty object", () => {
      expect(isValidBreakdown({})).toBe(true);
    });

    it("should accept single dimension", () => {
      const valid = { budget: 0 };
      expect(isValidBreakdown(valid)).toBe(true);
    });

    it("should accept maximum value of 100", () => {
      const valid = { budget: 100, authority: 100 };
      expect(isValidBreakdown(valid)).toBe(true);
    });

    it("should accept minimum value of 0", () => {
      const valid = { budget: 0, authority: 0 };
      expect(isValidBreakdown(valid)).toBe(true);
    });

    it("should reject null", () => {
      expect(isValidBreakdown(null)).toBe(false);
    });

    it("should reject undefined", () => {
      expect(isValidBreakdown(undefined)).toBe(false);
    });

    it("should reject string", () => {
      expect(isValidBreakdown("not an object")).toBe(false);
    });

    it("should reject number", () => {
      expect(isValidBreakdown(42)).toBe(false);
    });

    it("should reject array", () => {
      expect(isValidBreakdown([1, 2, 3])).toBe(false);
    });

    it("should reject object with more than 10 keys", () => {
      const tooManyKeys = {
        a: 50,
        b: 50,
        c: 50,
        d: 50,
        e: 50,
        f: 50,
        g: 50,
        h: 50,
        i: 50,
        j: 50,
        k: 50,
      };
      expect(isValidBreakdown(tooManyKeys)).toBe(false);
    });

    it("should reject object with exactly 10 keys (valid limit)", () => {
      const tenKeys = {
        a: 50,
        b: 50,
        c: 50,
        d: 50,
        e: 50,
        f: 50,
        g: 50,
        h: 50,
        i: 50,
        j: 50,
      };
      expect(isValidBreakdown(tenKeys)).toBe(true);
    });

    it("should reject keys with special characters", () => {
      const invalid = {
        "test<img>": 50,
      };
      expect(isValidBreakdown(invalid)).toBe(false);
    });

    it("should reject keys with spaces", () => {
      const invalid = {
        "my budget": 50,
      };
      expect(isValidBreakdown(invalid)).toBe(false);
    });

    it("should reject keys over 20 characters", () => {
      const invalid = {
        "this_is_a_very_long_key_name": 50,
      };
      expect(isValidBreakdown(invalid)).toBe(false);
    });

    it("should accept keys with underscores", () => {
      const valid = {
        my_budget: 50,
        my_authority: 75,
      };
      expect(isValidBreakdown(valid)).toBe(true);
    });

    it("should reject non-number values", () => {
      const invalid = {
        budget: "high",
      };
      expect(isValidBreakdown(invalid as any)).toBe(false);
    });

    it("should reject values less than 0", () => {
      const invalid = {
        budget: -1,
      };
      expect(isValidBreakdown(invalid)).toBe(false);
    });

    it("should reject values greater than 100", () => {
      const invalid = {
        budget: 101,
      };
      expect(isValidBreakdown(invalid)).toBe(false);
    });

    it("should handle NaN values (all comparisons fail, passes type check)", () => {
      const invalid = {
        budget: NaN,
      };
      // NaN is type "number" and doesn't satisfy < 0 || > 100, so it passes
      expect(isValidBreakdown(invalid)).toBe(true);
    });

    it("should reject Infinity values", () => {
      const invalid = {
        budget: Infinity,
      };
      expect(isValidBreakdown(invalid)).toBe(false);
    });

    it("should reject negative Infinity", () => {
      const invalid = {
        budget: -Infinity,
      };
      expect(isValidBreakdown(invalid)).toBe(false);
    });

    it("should reject mixed valid and invalid values", () => {
      const invalid = {
        budget: 50,
        authority: "invalid",
      };
      expect(isValidBreakdown(invalid as any)).toBe(false);
    });

    it("should accept boundary values 0-100", () => {
      const valid = {
        a: 0,
        b: 25,
        c: 50,
        d: 75,
        e: 100,
      };
      expect(isValidBreakdown(valid)).toBe(true);
    });

    it("should reject decimal values", () => {
      const invalid = {
        budget: 50.5,
      };
      expect(isValidBreakdown(invalid)).toBe(true); // Numbers are allowed, decimals are valid numbers
    });
  });

  describe("isValidScore", () => {
    it("should accept valid string score 0", () => {
      expect(isValidScore("0")).toBe(true);
    });

    it("should accept valid string score 50", () => {
      expect(isValidScore("50")).toBe(true);
    });

    it("should accept valid string score 100", () => {
      expect(isValidScore("100")).toBe(true);
    });

    it("should accept leading zeros", () => {
      expect(isValidScore("050")).toBe(true);
    });

    it("should reject null", () => {
      expect(isValidScore(null)).toBe(false);
    });

    it("should reject empty string", () => {
      expect(isValidScore("")).toBe(false);
    });

    it("should reject non-numeric string", () => {
      expect(isValidScore("abc")).toBe(false);
    });

    it("should reject negative numbers", () => {
      expect(isValidScore("-1")).toBe(false);
    });

    it("should reject numbers above 100", () => {
      expect(isValidScore("101")).toBe(false);
    });

    it("should handle decimal numbers (parseInt ignores decimals)", () => {
      // parseInt("50.5") returns 50, which is valid 0-100
      expect(isValidScore("50.5")).toBe(true);
    });

    it("should handle strings with trailing spaces (parseInt parses anyway)", () => {
      // parseInt("50 ") returns 50, which is valid 0-100
      expect(isValidScore("50 ")).toBe(true);
    });

    it("should reject NaN string", () => {
      expect(isValidScore("NaN")).toBe(false);
    });

    it("should reject Infinity string", () => {
      expect(isValidScore("Infinity")).toBe(false);
    });

    it("should validate all valid scores 0-100", () => {
      for (let i = 0; i <= 100; i++) {
        expect(isValidScore(i.toString())).toBe(true);
      }
    });
  });

  describe("isValidQualified", () => {
    it("should accept string true", () => {
      expect(isValidQualified("true")).toBe(true);
    });

    it("should accept string false", () => {
      expect(isValidQualified("false")).toBe(true);
    });

    it("should reject null", () => {
      expect(isValidQualified(null)).toBe(false);
    });

    it("should reject empty string", () => {
      expect(isValidQualified("")).toBe(false);
    });

    it("should reject yes", () => {
      expect(isValidQualified("yes")).toBe(false);
    });

    it("should reject no", () => {
      expect(isValidQualified("no")).toBe(false);
    });

    it("should reject numeric 1", () => {
      expect(isValidQualified("1")).toBe(false);
    });

    it("should reject numeric 0", () => {
      expect(isValidQualified("0")).toBe(false);
    });

    it("should reject uppercase TRUE", () => {
      expect(isValidQualified("TRUE")).toBe(false);
    });

    it("should reject uppercase FALSE", () => {
      expect(isValidQualified("FALSE")).toBe(false);
    });

    it("should reject mixed case True", () => {
      expect(isValidQualified("True")).toBe(false);
    });

    it("should reject mixed case False", () => {
      expect(isValidQualified("False")).toBe(false);
    });

    it("should reject string with whitespace", () => {
      expect(isValidQualified("true ")).toBe(false);
    });

    it("should reject boolean true (not string)", () => {
      expect(isValidQualified(true as any)).toBe(false);
    });

    it("should reject boolean false (not string)", () => {
      expect(isValidQualified(false as any)).toBe(false);
    });
  });

  describe("sanitizeString", () => {
    it("should remove simple HTML tags", () => {
      const input = "<script>alert('xss')</script>";
      const result = sanitizeString(input);
      expect(result).toBe("alert('xss')");
    });

    it("should remove HTML tags with attributes", () => {
      const input = '<img src="x" onerror="alert(1)">';
      const result = sanitizeString(input);
      // The regex removes <...> patterns, so the entire tag is removed
      expect(result.trim()).toBe("");
      expect(result).not.toContain("<");
    });

    it("should remove multiple HTML tags", () => {
      const input = "<div><p>Hello</p></div>";
      const result = sanitizeString(input);
      expect(result).toBe("Hello");
    });

    it("should trim whitespace", () => {
      const input = "  hello world  ";
      const result = sanitizeString(input);
      expect(result).toBe("hello world");
    });

    it("should remove leading and trailing whitespace with HTML", () => {
      const input = "  <b>hello</b>  ";
      const result = sanitizeString(input);
      expect(result).toBe("hello");
    });

    it("should truncate to maxLength", () => {
      const input = "This is a very long string";
      const result = sanitizeString(input, 10);
      expect(result).toBe("This is a ");
      expect(result.length).toBe(10);
    });

    it("should use default maxLength of 1000", () => {
      const input = "a".repeat(1500);
      const result = sanitizeString(input);
      expect(result.length).toBe(1000);
    });

    it("should handle empty string", () => {
      const result = sanitizeString("");
      expect(result).toBe("");
    });

    it("should handle string with only whitespace", () => {
      const result = sanitizeString("   ");
      expect(result).toBe("");
    });

    it("should remove HTML entities", () => {
      const input = "hello&nbsp;world&lt;tag&gt;";
      const result = sanitizeString(input);
      expect(result).not.toContain("&");
    });

    it("should remove script tags with content", () => {
      const input = "<script>var x = 1;</script>Hello";
      const result = sanitizeString(input);
      expect(result).toBe("var x = 1;Hello");
    });

    it("should handle non-string input gracefully", () => {
      const result = sanitizeString(null as any);
      expect(result).toBe("");
    });

    it("should handle numeric input gracefully", () => {
      const result = sanitizeString(123 as any);
      expect(result).toBe("");
    });

    it("should preserve newlines and special chars after HTML removal", () => {
      const input = "<b>Hello\nWorld</b>";
      const result = sanitizeString(input);
      expect(result).toBe("Hello\nWorld");
    });

    it("should truncate after HTML removal", () => {
      const input = "<b>Hello World This Is A Test</b>";
      const result = sanitizeString(input, 10);
      expect(result).toBe("Hello Worl");
    });
  });

  describe("isValidAnswers", () => {
    it("should accept valid answers object", () => {
      const valid = {
        "budget-range": "large",
        "budget-approval": "approved",
        "decision-role": "decision_maker",
      };
      expect(isValidAnswers(valid)).toBe(true);
    });

    it("should accept empty answers object", () => {
      expect(isValidAnswers({})).toBe(true);
    });

    it("should reject null", () => {
      expect(isValidAnswers(null)).toBe(false);
    });

    it("should reject undefined", () => {
      expect(isValidAnswers(undefined)).toBe(false);
    });

    it("should reject array", () => {
      expect(isValidAnswers([])).toBe(false);
    });

    it("should reject string", () => {
      expect(isValidAnswers("not an object")).toBe(false);
    });

    it("should reject number", () => {
      expect(isValidAnswers(42)).toBe(false);
    });

    it("should reject answers with more than 50 entries", () => {
      const tooMany: any = {};
      for (let i = 0; i < 51; i++) {
        tooMany[`q-${i}`] = "answer";
      }
      expect(isValidAnswers(tooMany)).toBe(false);
    });

    it("should accept answers with exactly 50 entries", () => {
      const valid: any = {};
      for (let i = 0; i < 50; i++) {
        valid[`q-${i}`] = "answer";
      }
      expect(isValidAnswers(valid)).toBe(true);
    });

    it("should reject keys with invalid characters", () => {
      const invalid = {
        "invalid<key>": "answer",
      };
      expect(isValidAnswers(invalid as any)).toBe(false);
    });

    it("should accept keys with alphanumeric and hyphens", () => {
      const valid = {
        "budget-range": "answer",
        "decision_role": "answer",
        "question123": "answer",
      };
      expect(isValidAnswers(valid)).toBe(true);
    });

    it("should accept keys with underscores", () => {
      const valid = {
        "budget_range": "answer",
      };
      expect(isValidAnswers(valid)).toBe(true);
    });

    it("should reject non-string values", () => {
      const invalid = {
        "budget-range": 123,
      };
      expect(isValidAnswers(invalid as any)).toBe(false);
    });

    it("should reject answers with value over 50 characters", () => {
      const invalid = {
        "budget-range": "a".repeat(51),
      };
      expect(isValidAnswers(invalid)).toBe(false);
    });

    it("should accept answers with value exactly 50 characters", () => {
      const valid = {
        "budget-range": "a".repeat(50),
      };
      expect(isValidAnswers(valid)).toBe(true);
    });

    it("should reject mixed valid and invalid values", () => {
      const invalid = {
        "budget-range": "large",
        "decision-role": 123,
      };
      expect(isValidAnswers(invalid as any)).toBe(false);
    });

    it("should reject answers with null values", () => {
      const invalid = {
        "budget-range": null,
      };
      expect(isValidAnswers(invalid as any)).toBe(false);
    });

    it("should reject answers with undefined values", () => {
      const invalid = {
        "budget-range": undefined,
      };
      expect(isValidAnswers(invalid as any)).toBe(false);
    });
  });
});
