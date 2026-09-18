import { describe, expect, it } from "vitest";
import { evaluateCondition, type Condition } from "../engine/condition.js";

describe("evaluateCondition", () => {
  describe("field conditions", () => {
    it("eq matches equal values and rejects different ones", () => {
      const cond: Condition = { field: "a.b", op: "eq", value: 42 };
      expect(evaluateCondition(cond, { a: { b: 42 } })).toBe(true);
      expect(evaluateCondition(cond, { a: { b: 43 } })).toBe(false);
    });

    it("neq is the inverse of eq", () => {
      const cond: Condition = { field: "a", op: "neq", value: "x" };
      expect(evaluateCondition(cond, { a: "y" })).toBe(true);
      expect(evaluateCondition(cond, { a: "x" })).toBe(false);
    });

    it("in checks membership in an array value", () => {
      const cond: Condition = { field: "country", op: "in", value: ["FR", "DE"] };
      expect(evaluateCondition(cond, { country: "FR" })).toBe(true);
      expect(evaluateCondition(cond, { country: "IT" })).toBe(false);
    });

    it("notIn is the inverse of in", () => {
      const cond: Condition = { field: "country", op: "notIn", value: ["FR", "DE"] };
      expect(evaluateCondition(cond, { country: "IT" })).toBe(true);
      expect(evaluateCondition(cond, { country: "FR" })).toBe(false);
    });

    it("gt/gte/lt/lte compare numbers", () => {
      expect(evaluateCondition({ field: "n", op: "gt", value: 10 }, { n: 11 })).toBe(true);
      expect(evaluateCondition({ field: "n", op: "gt", value: 10 }, { n: 10 })).toBe(false);
      expect(evaluateCondition({ field: "n", op: "gte", value: 10 }, { n: 10 })).toBe(true);
      expect(evaluateCondition({ field: "n", op: "lt", value: 10 }, { n: 9 })).toBe(true);
      expect(evaluateCondition({ field: "n", op: "lt", value: 10 }, { n: 10 })).toBe(false);
      expect(evaluateCondition({ field: "n", op: "lte", value: 10 }, { n: 10 })).toBe(true);
    });

    it("numeric comparisons are false when the resolved value isn't a number", () => {
      expect(evaluateCondition({ field: "n", op: "gt", value: 10 }, { n: "11" })).toBe(false);
      expect(evaluateCondition({ field: "n", op: "gt", value: 10 }, {})).toBe(false);
    });

    it("exists checks for presence, not truthiness", () => {
      const cond: Condition = { field: "a", op: "exists" };
      expect(evaluateCondition(cond, { a: false })).toBe(true);
      expect(evaluateCondition(cond, { a: 0 })).toBe(true);
      expect(evaluateCondition(cond, { a: null })).toBe(false);
      expect(evaluateCondition(cond, {})).toBe(false);
    });

    it("resolves dotted paths and treats missing intermediate objects as undefined", () => {
      const cond: Condition = { field: "a.b.c", op: "eq", value: 1 };
      expect(evaluateCondition(cond, { a: { b: { c: 1 } } })).toBe(true);
      expect(evaluateCondition(cond, { a: {} })).toBe(false);
      expect(evaluateCondition(cond, {})).toBe(false);
    });
  });

  describe("boolean combinators", () => {
    it("all requires every sub-condition to match", () => {
      const cond: Condition = {
        all: [
          { field: "a", op: "eq", value: true },
          { field: "b", op: "eq", value: true },
        ],
      };
      expect(evaluateCondition(cond, { a: true, b: true })).toBe(true);
      expect(evaluateCondition(cond, { a: true, b: false })).toBe(false);
    });

    it("all on an empty array is vacuously true", () => {
      expect(evaluateCondition({ all: [] }, {})).toBe(true);
    });

    it("any requires at least one sub-condition to match", () => {
      const cond: Condition = {
        any: [
          { field: "a", op: "eq", value: true },
          { field: "b", op: "eq", value: true },
        ],
      };
      expect(evaluateCondition(cond, { a: false, b: true })).toBe(true);
      expect(evaluateCondition(cond, { a: false, b: false })).toBe(false);
    });

    it("any on an empty array is vacuously false", () => {
      expect(evaluateCondition({ any: [] }, {})).toBe(false);
    });

    it("not negates its sub-condition", () => {
      const cond: Condition = { not: { field: "a", op: "eq", value: true } };
      expect(evaluateCondition(cond, { a: true })).toBe(false);
      expect(evaluateCondition(cond, { a: false })).toBe(true);
    });

    it("combinators nest arbitrarily", () => {
      const cond: Condition = {
        all: [
          { field: "a", op: "eq", value: true },
          { any: [{ field: "b", op: "eq", value: true }, { not: { field: "c", op: "eq", value: true } }] },
        ],
      };
      expect(evaluateCondition(cond, { a: true, b: false, c: false })).toBe(true);
      expect(evaluateCondition(cond, { a: true, b: false, c: true })).toBe(false);
    });
  });
});
