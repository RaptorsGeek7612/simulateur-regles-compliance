import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Badge } from "./Badge";

describe("Badge", () => {
  it.each([
    ["ok", "badge--ok"],
    ["ko", "badge--ko"],
    ["warning", "badge--warning"],
    ["neutral", "badge--neutral"],
  ] as const)("renders the %s tone with class %s", (tone, expectedClass) => {
    render(<Badge tone={tone}>PASS</Badge>);
    const badge = screen.getByText("PASS");
    expect(badge).toHaveClass("badge", expectedClass);
  });
});
