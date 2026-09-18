import { apiFetch } from "./client";
import type { ModuleObligationLink, QuestionnaireAnswers, RuleResult } from "../types/mica";

export function getQuestionnaireTemplate() {
  return apiFetch<QuestionnaireAnswers>("/api/mica/questionnaire-template");
}

export function getModuleMap() {
  return apiFetch<ModuleObligationLink[]>("/api/mica/module-map");
}

export function evaluateQuestionnaire(answers: QuestionnaireAnswers) {
  return apiFetch<{ results: RuleResult[] }>("/api/mica/evaluate", {
    method: "POST",
    body: JSON.stringify(answers),
  });
}
