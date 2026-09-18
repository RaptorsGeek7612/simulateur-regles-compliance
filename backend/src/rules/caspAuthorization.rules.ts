import type { Rule } from "../engine/types.js";

/**
 * Agrément et obligations des prestataires de services sur crypto-actifs
 * (CASP — Titre V). Seuils de fonds propres minimaux simplifiés depuis
 * l'Annexe IV MiCA à des fins pédagogiques (voir README).
 */
export const caspAuthorizationRules: Rule[] = [
  {
    id: "casp-authorization-required",
    area: "casp_authorization",
    title: "Agrément CASP requis",
    articleRef: "Art. 59 (approximatif)",
    when: {
      all: [
        { field: "role.isCASP", op: "eq", value: true },
        { field: "casp.isAlreadyAuthorisedEntity", op: "eq", value: false },
      ],
    },
    result: {
      verdict: "applicable",
      label: "Agrément CASP requis auprès de l'autorité nationale compétente",
      obligations: [
        "Constituer un dossier d'agrément (programme d'activité, gouvernance, dispositif AML/CFT)",
        "Désigner des dirigeants honorables et compétents (art. 68)",
        "Une fois agréé, passeport européen possible vers les autres États membres (art. 65)",
      ],
      explanation:
        "Fournir un ou plusieurs services sur crypto-actifs au public nécessite en principe un agrément CASP délivré par l'autorité compétente de l'État membre d'origine.",
    },
  },
  {
    id: "casp-simplified-notification",
    area: "casp_authorization",
    title: "Procédure allégée de notification",
    articleRef: "Art. 60 (approximatif)",
    when: {
      all: [
        { field: "role.isCASP", op: "eq", value: true },
        { field: "casp.isAlreadyAuthorisedEntity", op: "eq", value: true },
      ],
    },
    result: {
      verdict: "applicable",
      label: "Procédure allégée : notification plutôt que nouvel agrément",
      obligations: [
        "Notifier l'autorité compétente au moins 40 jours ouvrables avant le début des services",
        "Pas de nouvel agrément CASP complet requis",
      ],
      explanation:
        "Un établissement de crédit, une EME, une entreprise d'investissement ou un gestionnaire déjà agréé au titre d'un autre texte européen bénéficie d'une procédure de notification allégée plutôt que d'un agrément CASP complet.",
    },
  },
  {
    id: "casp-custody",
    area: "casp_authorization",
    title: "Service de conservation",
    articleRef: "Art. 75, Annexe IV (approximatif)",
    when: { field: "casp.providesCustody", op: "eq", value: true },
    result: {
      verdict: "applicable",
      label: "Conservation et administration de crypto-actifs pour compte de tiers",
      obligations: [
        "Fonds propres minimaux indicatifs : 150 000 €",
        "Tenir un registre de position par client, restituable à tout moment",
        "Politique de conservation ségréguée des clés / actifs clients",
      ],
      explanation:
        "La conservation pour compte de tiers est l'un des services les plus exigeants en fonds propres et en sauvegarde des actifs clients (art. 70, 75).",
    },
  },
  {
    id: "casp-exchange",
    area: "casp_authorization",
    title: "Service d'échange",
    articleRef: "Art. 76-77, Annexe IV (approximatif)",
    when: {
      any: [
        { field: "casp.providesExchangeForFunds", op: "eq", value: true },
        { field: "casp.providesExchangeForOtherCrypto", op: "eq", value: true },
      ],
    },
    result: {
      verdict: "applicable",
      label: "Échange de crypto-actifs contre fonds ou contre d'autres crypto-actifs",
      obligations: [
        "Fonds propres minimaux indicatifs : 50 000 €",
        "Publier une politique commerciale non discriminatoire et les prix pratiqués",
        "Exécuter les ordres clients au meilleur prix disponible dans les conditions annoncées",
      ],
      explanation:
        "L'échange pour compte propre (ou l'exécution en tant que contrepartie) impose des règles de transparence des prix et de non-discrimination entre clients.",
    },
  },
  {
    id: "casp-trading-platform",
    area: "casp_authorization",
    title: "Exploitation d'une plateforme de négociation",
    articleRef: "Art. 78-81, Annexe IV (approximatif)",
    when: { field: "casp.operatesTradingPlatform", op: "eq", value: true },
    result: {
      verdict: "applicable",
      label: "Exploitation d'une plateforme de négociation de crypto-actifs",
      obligations: [
        "Fonds propres minimaux indicatifs : 150 000 €",
        "Règles de fonctionnement transparentes et non discriminatoires, admission des actifs négociés documentée",
        "Transparence pré- et post-négociation, résilience opérationnelle du système d'appariement",
      ],
      explanation:
        "L'exploitation d'une plateforme de négociation est le service le plus proche d'un marché réglementé classique : elle emporte des obligations de transparence de marché spécifiques (Titre V + Titre VI abus de marché).",
    },
  },
  {
    id: "casp-execution-placing",
    area: "casp_authorization",
    title: "Exécution d'ordres / placement",
    articleRef: "Art. 78, 83, Annexe IV (approximatif)",
    when: {
      any: [
        { field: "casp.providesExecutionOfOrders", op: "eq", value: true },
        { field: "casp.providesPlacing", op: "eq", value: true },
        { field: "casp.providesReceptionAndTransmission", op: "eq", value: true },
        { field: "casp.providesTransferService", op: "eq", value: true },
      ],
    },
    result: {
      verdict: "applicable",
      label: "Exécution, placement, réception-transmission ou transfert de crypto-actifs",
      obligations: [
        "Fonds propres minimaux indicatifs : 50 000 €",
        "Politique d'exécution au mieux des intérêts du client, documentée et communiquée",
      ],
      explanation:
        "Ces services d'intermédiation imposent une obligation de meilleure exécution et de transparence sur les éventuels conflits d'intérêts (rémunération de tiers, etc.).",
    },
  },
  {
    id: "casp-advice-portfolio",
    area: "casp_authorization",
    title: "Conseil / gestion de portefeuille",
    articleRef: "Art. 81-82, Annexe IV (approximatif)",
    when: {
      any: [
        { field: "casp.providesAdvice", op: "eq", value: true },
        { field: "casp.providesPortfolioManagement", op: "eq", value: true },
      ],
    },
    result: {
      verdict: "applicable",
      label: "Conseil en crypto-actifs ou gestion de portefeuille",
      obligations: [
        "Fonds propres minimaux indicatifs : 125 000 €",
        "Évaluer l'adéquation du service au profil du client (connaissances, objectifs, capacité de perte)",
        "Personnel disposant des connaissances et compétences nécessaires",
      ],
      explanation:
        "Le conseil et la gestion de portefeuille exigent une évaluation d'adéquation proche de celle exigée par MiFID II pour les instruments financiers.",
    },
  },
  {
    id: "casp-general-conduct",
    area: "casp_authorization",
    title: "Obligations générales de conduite CASP",
    articleRef: "Art. 66-74 (approximatif)",
    when: { field: "role.isCASP", op: "eq", value: true },
    result: {
      verdict: "applicable",
      label: "Obligations générales applicables à tout CASP",
      obligations: [
        "Agir honnêtement, loyalement et professionnellement dans l'intérêt des clients",
        "Dispositif de gestion des conflits d'intérêts et de traitement des réclamations",
        "Dispositif de lutte contre le blanchiment et le financement du terrorisme (au titre du droit AML applicable)",
        "Résilience opérationnelle numérique (exigences DORA pour les systèmes critiques)",
      ],
      explanation:
        "Indépendamment des services fournis, tout CASP agréé est soumis à un socle commun de règles de conduite et de résilience opérationnelle.",
    },
  },
];
