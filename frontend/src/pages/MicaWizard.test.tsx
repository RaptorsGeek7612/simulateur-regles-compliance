import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MicaWizard } from "./MicaWizard";
import { DEFAULT_QUESTIONNAIRE, type RuleResult } from "../types/mica";

const { mockGetQuestionnaireTemplate, mockGetModuleMap, mockEvaluateQuestionnaire } = vi.hoisted(() => ({
  mockGetQuestionnaireTemplate: vi.fn(),
  mockGetModuleMap: vi.fn(),
  mockEvaluateQuestionnaire: vi.fn(),
}));

vi.mock("../api/mica", () => ({
  getQuestionnaireTemplate: mockGetQuestionnaireTemplate,
  getModuleMap: mockGetModuleMap,
  evaluateQuestionnaire: mockEvaluateQuestionnaire,
}));

const sampleResult: RuleResult = {
  ruleId: "classification-emt",
  area: "classification",
  title: "Jeton de monnaie électronique (EMT)",
  articleRef: "Art. 3§1(7)",
  verdict: "applicable",
  label: "Classé jeton de monnaie électronique (EMT)",
  obligations: ["Régime du Titre IV"],
  explanation: "Le jeton vise à maintenir une valeur stable.",
};

async function goToResultsStep(user: ReturnType<typeof userEvent.setup>) {
  await user.click(await screen.findByRole("button", { name: "Suivant" })); // rôle -> token
  await user.click(screen.getByRole("button", { name: "Suivant" })); // token -> casp
  await user.click(screen.getByRole("button", { name: "Suivant" })); // casp -> abus de marché
  await user.click(screen.getByRole("button", { name: "Évaluer" }));
}

describe("MicaWizard", () => {
  beforeEach(() => {
    mockGetQuestionnaireTemplate.mockResolvedValue(DEFAULT_QUESTIONNAIRE);
    mockGetModuleMap.mockResolvedValue([]);
    mockEvaluateQuestionnaire.mockResolvedValue({ results: [sampleResult] });
  });

  it("starts on the role step", async () => {
    render(<MicaWizard />);
    expect(await screen.findByText("Votre rôle")).toBeInTheDocument();
    expect(screen.getByText("Rôle")).toHaveClass("wizard__step--active");
  });

  it("walks through every step and shows the evaluated results", async () => {
    const user = userEvent.setup();
    render(<MicaWizard />);

    await goToResultsStep(user);

    expect(await screen.findByRole("heading", { name: "Résultat" })).toBeInTheDocument();
    expect(screen.getByText("Jeton de monnaie électronique (EMT)")).toBeInTheDocument();
    expect(mockEvaluateQuestionnaire).toHaveBeenCalledWith(DEFAULT_QUESTIONNAIRE);
  });

  it("shows an error message and stays on the same step if evaluation fails", async () => {
    const { ApiError } = await import("../api/client");
    mockEvaluateQuestionnaire.mockRejectedValueOnce(new ApiError("panne serveur", 502));
    const user = userEvent.setup();
    render(<MicaWizard />);

    await user.click(await screen.findByRole("button", { name: "Suivant" }));
    await user.click(screen.getByRole("button", { name: "Suivant" }));
    await user.click(screen.getByRole("button", { name: "Suivant" }));
    await user.click(screen.getByRole("button", { name: "Évaluer" }));

    expect(await screen.findByText("panne serveur")).toBeInTheDocument();
    expect(screen.getByText("Abus de marché", { selector: "li" })).toHaveClass("wizard__step--active");
  });

  it("resets back to the role step from the results screen", async () => {
    const user = userEvent.setup();
    render(<MicaWizard />);

    await goToResultsStep(user);
    await screen.findByRole("heading", { name: "Résultat" });

    await user.click(screen.getByRole("button", { name: "Recommencer" }));

    expect(await screen.findByText("Votre rôle")).toBeInTheDocument();
  });

  it("falls back to the built-in default questionnaire if the template fetch fails", async () => {
    mockGetQuestionnaireTemplate.mockRejectedValueOnce(new Error("offline"));
    render(<MicaWizard />);
    await waitFor(() => expect(mockGetQuestionnaireTemplate).toHaveBeenCalled());
    expect(await screen.findByText("Votre rôle")).toBeInTheDocument();
  });
});
