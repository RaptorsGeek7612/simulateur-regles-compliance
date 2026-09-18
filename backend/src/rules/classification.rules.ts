import type { Rule } from "../engine/types.js";

/**
 * Classification du crypto-actif au sens MiCA (règlement UE 2023/1114).
 *
 * Les conditions lisent `derived.*`, calculé une seule fois par
 * `evaluateQuestionnaire()` (backend/src/engine/evaluate.ts) à partir des
 * réponses brutes. Les autres fichiers de règles (issuerObligations,
 * caspAuthorization) réutilisent les mêmes flags `derived.*` : ne pas
 * redupliquer la logique de classification dans un `when` ailleurs, sous
 * peine de désynchronisation.
 *
 * Références d'articles approximatives, à vérifier contre le texte officiel
 * avant toute décision réelle (voir README).
 */
export const classificationRules: Rule[] = [
  {
    id: "classification-excluded-financial-instrument",
    area: "classification",
    title: "Instrument financier — hors champ MiCA",
    articleRef: "Art. 2§4 (approximatif)",
    when: { field: "token.isFinancialInstrument", op: "eq", value: true },
    result: {
      verdict: "not_applicable",
      label: "Hors champ MiCA : qualifie d'instrument financier",
      obligations: [],
      explanation:
        "Un crypto-actif qui répond à la définition d'un instrument financier (MiFID II) est explicitement exclu du champ de MiCA. C'est le droit des marchés financiers classique (prospectus, MiFID II) qui s'applique, pas MiCA.",
    },
  },
  {
    id: "classification-excluded-nft",
    area: "classification",
    title: "NFT unique et non fongible — hors champ MiCA",
    articleRef: "Considérant 11 (approximatif)",
    when: {
      all: [
        { field: "token.isNFTUnique", op: "eq", value: true },
        { field: "token.isFinancialInstrument", op: "eq", value: false },
      ],
    },
    result: {
      verdict: "not_applicable",
      label: "Hors champ MiCA : unique et non fongible",
      obligations: [],
      explanation:
        "Les crypto-actifs uniques et non fongibles (au sens strict — pas une simple collection fractionnée ou en grande série) sont en principe exclus de MiCA. Attention : une collection de NFT quasi-identiques peut être requalifiée en crypto-actif fongible par le régulateur.",
    },
  },
  {
    id: "classification-emt",
    area: "classification",
    title: "Jeton de monnaie électronique (EMT)",
    articleRef: "Art. 3§1(7), Titre IV (approximatif)",
    when: { field: "derived.isEMT", op: "eq", value: true },
    result: {
      verdict: "applicable",
      label: "Classé jeton de monnaie électronique (EMT)",
      obligations: [
        "Régime du Titre IV : livre blanc, agrément et réserve d'actifs dédiés à l'EMT",
      ],
      explanation:
        "Le jeton vise à maintenir une valeur stable en référençant une seule monnaie fiat ayant cours légal — c'est la définition d'un electronic money token (EMT). Il relève du Titre IV de MiCA, avec des obligations proches de la monnaie électronique classique (directive 2009/110/CE).",
    },
  },
  {
    id: "classification-art",
    area: "classification",
    title: "Jeton se référant à un ou plusieurs actifs (ART)",
    articleRef: "Art. 3§1(6), Titre III (approximatif)",
    when: { field: "derived.isART", op: "eq", value: true },
    result: {
      verdict: "applicable",
      label: "Classé jeton se référant à un ou plusieurs actifs (ART)",
      obligations: [
        "Régime du Titre III : livre blanc, agrément de l'autorité compétente, réserve d'actifs",
      ],
      explanation:
        "Le jeton vise à maintenir une valeur stable en référençant plusieurs actifs, une matière première ou un panier — c'est la définition d'un asset-referenced token (ART). Il relève du Titre III de MiCA.",
    },
  },
  {
    id: "classification-utility-exempt",
    area: "classification",
    title: "Jeton utilitaire — exemption partielle de livre blanc",
    articleRef: "Art. 4§3 (approximatif)",
    when: {
      all: [
        { field: "derived.isEMT", op: "eq", value: false },
        { field: "derived.isART", op: "eq", value: false },
        { field: "derived.isUtilityExempt", op: "eq", value: true },
      ],
    },
    result: {
      verdict: "warning",
      label: "Jeton utilitaire, usage restreint à l'écosystème de l'émetteur",
      obligations: [
        "Exemption de l'obligation de livre blanc et de sa notification (art. 4§3), pas d'exemption des autres obligations d'émetteur",
      ],
      explanation:
        "Le jeton donne accès à un bien ou service et n'est utilisable que dans l'écosystème de l'émetteur : il bénéficie de l'exemption de livre blanc prévue à l'art. 4§3. Les autres obligations générales d'émetteur (honnêteté, gestion des conflits d'intérêts, réclamations) restent applicables.",
    },
  },
  {
    id: "classification-other-crypto-asset",
    area: "classification",
    title: "Autre crypto-actif (ni EMT, ni ART)",
    articleRef: "Titre II, art. 4 à 14 (approximatif)",
    when: { field: "derived.isOtherCryptoAsset", op: "eq", value: true },
    result: {
      verdict: "applicable",
      label: "Classé « autre crypto-actif » (régime général du Titre II)",
      obligations: ["Régime du Titre II : livre blanc et obligations générales d'émetteur"],
      explanation:
        "Le jeton ne se référence pas à une monnaie fiat unique, ni à un panier d'actifs, et n'est pas un jeton utilitaire à usage restreint : il relève du régime général du Titre II (offre au public / admission à la négociation de crypto-actifs autres que ART et EMT).",
    },
  },
];
