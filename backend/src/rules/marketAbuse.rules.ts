import type { Rule } from "../engine/types.js";

/**
 * Abus de marché (Titre VI). Champ d'application simplifié : dans MiCA le
 * régime s'applique dès qu'une demande d'admission à la négociation est
 * faite, y compris avant l'admission effective ; on ne capture ici que le
 * cas "admis à la négociation" pour rester lisible dans le questionnaire.
 */
export const marketAbuseRules: Rule[] = [
  {
    id: "market-abuse-not-applicable",
    area: "market_abuse",
    title: "Régime d'abus de marché non applicable",
    articleRef: "Art. 88 (approximatif)",
    when: { field: "marketAbuse.tokenAdmittedToTradingPlatform", op: "eq", value: false },
    result: {
      verdict: "not_applicable",
      label: "Jeton non admis à la négociation : Titre VI non applicable",
      obligations: [],
      explanation:
        "Le régime d'abus de marché de MiCA (Titre VI) s'applique aux crypto-actifs admis à la négociation sur une plateforme. En l'absence d'admission, ce volet ne s'applique pas encore.",
    },
  },
  {
    id: "market-abuse-scope",
    area: "market_abuse",
    title: "Régime d'abus de marché applicable",
    articleRef: "Art. 88 (approximatif)",
    when: { field: "marketAbuse.tokenAdmittedToTradingPlatform", op: "eq", value: true },
    result: {
      verdict: "applicable",
      label: "Le jeton est admis à la négociation : Titre VI applicable",
      obligations: [],
      explanation:
        "Dès qu'un crypto-actif est admis à la négociation sur une plateforme, les interdictions d'abus de marché du Titre VI s'appliquent à toute personne (pas seulement à l'émetteur ou au CASP).",
    },
  },
  {
    id: "market-abuse-insider-dealing",
    area: "market_abuse",
    title: "Interdiction des opérations d'initiés",
    articleRef: "Art. 89 (approximatif)",
    when: { field: "marketAbuse.tokenAdmittedToTradingPlatform", op: "eq", value: true },
    result: {
      verdict: "applicable",
      label: "Interdiction d'utiliser une information privilégiée",
      obligations: [
        "Ne pas acquérir ni céder le crypto-actif en exploitant une information privilégiée",
        "Ne pas recommander ou inciter un tiers à agir sur la base de cette information",
        "Ne pas annuler ou modifier un ordre sur la base d'une information privilégiée reçue après son placement",
      ],
      explanation:
        "Toute personne disposant d'une information privilégiée sur un crypto-actif admis à la négociation est soumise à cette interdiction, qu'elle soit interne à l'émetteur ou non.",
    },
  },
  {
    id: "market-abuse-unlawful-disclosure",
    area: "market_abuse",
    title: "Interdiction de divulgation illicite",
    articleRef: "Art. 90 (approximatif)",
    when: { field: "marketAbuse.tokenAdmittedToTradingPlatform", op: "eq", value: true },
    result: {
      verdict: "applicable",
      label: "Interdiction de divulguer une information privilégiée hors cadre normal",
      obligations: [
        "Ne communiquer une information privilégiée que dans le cadre normal de l'exercice d'une fonction",
        "Encadrer contractuellement (confidentialité) toute divulgation à des tiers avant publication",
      ],
      explanation:
        "La divulgation d'une information privilégiée en dehors de l'exercice normal d'un travail, d'une profession ou de fonctions est interdite, même sans opération de marché associée.",
    },
  },
  {
    id: "market-abuse-manipulation",
    area: "market_abuse",
    title: "Interdiction des manipulations de marché",
    articleRef: "Art. 91 (approximatif)",
    when: { field: "marketAbuse.tokenAdmittedToTradingPlatform", op: "eq", value: true },
    result: {
      verdict: "applicable",
      label: "Interdiction des manipulations de marché",
      obligations: [
        "Ne pas passer d'ordres ou effectuer des transactions donnant des indications fausses ou trompeuses",
        "Ne pas diffuser d'informations donnant des indications fausses ou trompeuses (y compris via les réseaux sociaux)",
        "Vigilance particulière sur les pratiques de type wash trading, pump-and-dump et spoofing",
      ],
      explanation:
        "Le régime de manipulation de marché de MiCA est calqué sur celui du règlement Abus de Marché (MAR) applicable aux instruments financiers classiques.",
    },
  },
  {
    id: "market-abuse-issuer-disclosure",
    area: "market_abuse",
    title: "Publication d'informations privilégiées par l'émetteur",
    articleRef: "Art. 88 (approximatif)",
    when: {
      all: [
        { field: "marketAbuse.tokenAdmittedToTradingPlatform", op: "eq", value: true },
        { field: "role.isIssuer", op: "eq", value: true },
      ],
    },
    result: {
      verdict: "applicable",
      label: "Obligation de publier toute information privilégiée dès que possible",
      obligations: [
        "Publier toute information privilégiée concernant l'émetteur dès que possible",
        "Documenter et justifier tout report exceptionnel de publication",
        "Tenir une liste des personnes ayant accès à l'information privilégiée",
      ],
      explanation:
        "En tant qu'émetteur d'un crypto-actif admis à la négociation, une obligation de publication rapide des informations privilégiées s'ajoute aux interdictions générales de ce volet.",
    },
  },
];
