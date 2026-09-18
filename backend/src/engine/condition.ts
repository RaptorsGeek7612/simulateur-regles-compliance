export type FieldPath = string; // notation pointée, ex. "token.referencesMultipleAssets"

export type ComparisonOp = "eq" | "neq" | "in" | "notIn" | "gt" | "gte" | "lt" | "lte" | "exists";

export interface FieldCondition {
  field: FieldPath;
  op: ComparisonOp;
  value?: unknown; // absent pour "exists"
}

export interface AllCondition {
  all: Condition[];
}
export interface AnyCondition {
  any: Condition[];
}
export interface NotCondition {
  not: Condition;
}

export type Condition = FieldCondition | AllCondition | AnyCondition | NotCondition;

function getByPath(obj: unknown, path: FieldPath): unknown {
  return path.split(".").reduce<unknown>((acc, key) => {
    if (acc === undefined || acc === null) return undefined;
    return (acc as Record<string, unknown>)[key];
  }, obj);
}

function isCondition(c: Condition): c is FieldCondition {
  return "field" in c && "op" in c;
}

function evaluateFieldCondition(condition: FieldCondition, scenario: unknown): boolean {
  const resolved = getByPath(scenario, condition.field);

  switch (condition.op) {
    case "exists":
      return resolved !== undefined && resolved !== null;
    case "eq":
      return resolved === condition.value;
    case "neq":
      return resolved !== condition.value;
    case "in":
      return Array.isArray(condition.value) && condition.value.includes(resolved);
    case "notIn":
      return Array.isArray(condition.value) && !condition.value.includes(resolved);
    case "gt":
      return typeof resolved === "number" && typeof condition.value === "number" && resolved > condition.value;
    case "gte":
      return typeof resolved === "number" && typeof condition.value === "number" && resolved >= condition.value;
    case "lt":
      return typeof resolved === "number" && typeof condition.value === "number" && resolved < condition.value;
    case "lte":
      return typeof resolved === "number" && typeof condition.value === "number" && resolved <= condition.value;
    default:
      return false;
  }
}

export function evaluateCondition(condition: Condition, scenario: unknown): boolean {
  if ("all" in condition) return condition.all.every((c) => evaluateCondition(c, scenario));
  if ("any" in condition) return condition.any.some((c) => evaluateCondition(c, scenario));
  if ("not" in condition) return !evaluateCondition(condition.not, scenario);
  if (isCondition(condition)) return evaluateFieldCondition(condition, scenario);
  return false;
}
