import type { Rule } from "../engine/types.js";

/**
 * Obligations d'émetteur. Seuils chiffrés simplifiés à des fins pédagogiques
 * (voir disclaimer du README) — l'art. 16 MiCA prévoit deux voies de dispense
 * alternatives (valeur moyenne en circulation ≤ 5 000 000 € sur 12 mois, OU
 * offre/détention réservée aux investisseurs qualifiés), fusionnées ici en un
 * seuil de valeur unique pour rester lisibles dans un questionnaire court.
 * (Les seuils "<150 personnes par État membre" / "ticket ≥ 100 000 €" qui
 * figuraient précédemment ici appartiennent au règlement Prospectus (UE)
 * 2017/1129, pas à MiCA — corrigé après vérification, voir CONTRIBUTING.md.)
 */
export const issuerObligationsRules: Rule[] = [
  {
    id: "issuer-general-duties",
    area: "issuer_obligations",
    title: "Obligations générales d'émetteur",
    articleRef: "Art. 14 s. (approximatif)",
    when: { field: "role.isIssuer", op: "eq", value: true },
    result: {
      verdict: "applicable",
      label: "Obligations permanentes d'émetteur",
      obligations: [
        "Agir honnêtement, loyalement et professionnellement dans l'intérêt des porteurs",
        "Mettre en place une procédure de traitement des réclamations des porteurs",
        "Identifier, prévenir et gérer les conflits d'intérêts",
        "Publier sans délai toute information susceptible d'affecter la valeur du crypto-actif",
      ],
      explanation:
        "Dès qu'une entité émet un crypto-actif au sens de MiCA, un socle d'obligations de conduite s'applique quelle que soit la catégorie (EMT, ART ou autre crypto-actif).",
    },
  },
  {
    id: "issuer-white-paper-other-crypto-asset",
    area: "issuer_obligations",
    title: "Livre blanc requis (autre crypto-actif)",
    articleRef: "Art. 6, 8 (approximatif)",
    when: {
      all: [
        { field: "role.isIssuer", op: "eq", value: true },
        { field: "derived.isOtherCryptoAsset", op: "eq", value: true },
        { field: "token.isOfferedToPublic", op: "eq", value: true },
        { field: "token.isFreeOfCharge", op: "eq", value: false },
        { field: "token.offerValueEUR12m", op: "gte", value: 1_000_000 },
      ],
    },
    result: {
      verdict: "applicable",
      label: "Publication d'un livre blanc requise avant l'offre",
      obligations: [
        "Rédiger un livre blanc conforme à l'Annexe I",
        "Le notifier à l'autorité compétente au moins 20 jours ouvrables avant publication",
        "Assumer la responsabilité civile de son contenu",
      ],
      explanation:
        "Offre au public payante d'un crypto-actif hors EMT/ART, au-dessus du seuil de dispense de 1 000 000 € sur 12 mois glissants (art. 4§2) : un livre blanc est requis.",
    },
  },
  {
    id: "issuer-small-offer-exemption",
    area: "issuer_obligations",
    title: "Dispense de livre blanc — petite offre",
    articleRef: "Art. 4§2 (approximatif)",
    when: {
      all: [
        { field: "role.isIssuer", op: "eq", value: true },
        { field: "derived.isOtherCryptoAsset", op: "eq", value: true },
        { field: "token.isOfferedToPublic", op: "eq", value: true },
        { field: "token.offerValueEUR12m", op: "lt", value: 1_000_000 },
      ],
    },
    result: {
      verdict: "warning",
      label: "Dispensé de livre blanc formel (petite offre)",
      obligations: [
        "Pas de livre blanc ni de notification obligatoires en dessous de 1 000 000 € sur 12 mois",
        "Les obligations générales d'émetteur restent applicables",
      ],
      explanation:
        "La valeur cumulée de l'offre sur 12 mois glissants reste sous le seuil de dispense de l'art. 4§2. Vérifier le calcul du cumul (plusieurs offres successives se totalisent) avant de s'appuyer sur cette dispense.",
    },
  },
  {
    id: "issuer-free-of-charge-exemption",
    area: "issuer_obligations",
    title: "Dispense de livre blanc — offre gratuite",
    articleRef: "Art. 4§1 (approximatif)",
    when: {
      all: [
        { field: "role.isIssuer", op: "eq", value: true },
        { field: "derived.isOtherCryptoAsset", op: "eq", value: true },
        { field: "token.isFreeOfCharge", op: "eq", value: true },
      ],
    },
    result: {
      verdict: "not_applicable",
      label: "Livre blanc non requis — crypto-actif offert gratuitement",
      obligations: [],
      explanation:
        "Une offre réellement gratuite (aucune contrepartie, y compris en données personnelles utilisées à des fins commerciales) échappe aux obligations de livre blanc du Titre II.",
    },
  },
  {
    id: "issuer-authorization-art",
    area: "issuer_obligations",
    title: "Agrément ART requis",
    articleRef: "Art. 16, 21 (approximatif)",
    when: {
      all: [
        { field: "role.isIssuer", op: "eq", value: true },
        { field: "derived.isART", op: "eq", value: true },
        { field: "token.offerValueEUR12m", op: "gte", value: 5_000_000 },
      ],
    },
    result: {
      verdict: "applicable",
      label: "Agrément de l'autorité compétente requis avant l'offre",
      obligations: [
        "Obtenir l'agrément de l'autorité compétente de l'État membre d'origine",
        "Faire approuver le livre blanc dans le cadre de l'agrément",
        "Désigner un établissement de crédit ou une EME dépositaire de la réserve d'actifs",
      ],
      explanation:
        "Au-dessus du seuil simplifié de 5 000 000 € sur 12 mois, un ART ne bénéficie plus de la dispense d'agrément de l'art. 16§2(a). La seconde voie de dispense (art. 16§2(b) : offre et détention réservées aux investisseurs qualifiés) reste théoriquement ouverte indépendamment de ce seuil — ce questionnaire ne la distingue pas, à vérifier au cas par cas.",
    },
  },
  {
    id: "issuer-authorization-art-exempt",
    area: "issuer_obligations",
    title: "Agrément ART potentiellement dispensé",
    articleRef: "Art. 16 (approximatif)",
    when: {
      all: [
        { field: "role.isIssuer", op: "eq", value: true },
        { field: "derived.isART", op: "eq", value: true },
        { field: "token.offerValueEUR12m", op: "lt", value: 5_000_000 },
      ],
    },
    result: {
      verdict: "warning",
      label: "Dispense d'agrément ART possible — à vérifier au cas par cas",
      obligations: [
        "Un livre blanc reste requis même en cas de dispense d'agrément",
        "Vérifier laquelle des deux voies de dispense de l'art. 16§2 s'applique réellement (seuil de 5 000 000 € OU offre/détention réservée aux investisseurs qualifiés) — ce questionnaire ne teste que la première",
      ],
      explanation:
        "Sous le seuil simplifié de 5 000 000 €, une dispense d'agrément est envisageable mais dépend de critères qualitatifs que ce questionnaire ne détaille pas entièrement.",
    },
  },
  {
    id: "issuer-authorization-emt-entity-ok",
    area: "issuer_obligations",
    title: "Statut d'émetteur EMT respecté",
    articleRef: "Art. 48 (approximatif)",
    when: {
      all: [
        { field: "role.isIssuer", op: "eq", value: true },
        { field: "derived.isEMT", op: "eq", value: true },
        {
          any: [
            { field: "token.issuerIsCreditInstitution", op: "eq", value: true },
            { field: "token.issuerIsEMoneyInstitution", op: "eq", value: true },
          ],
        },
      ],
    },
    result: {
      verdict: "applicable",
      label: "Émetteur habilité (établissement de crédit ou de monnaie électronique)",
      obligations: [
        "Livre blanc EMT approuvé par l'autorité compétente avant l'offre",
        "Droit de remboursement à tout moment, à la valeur nominale, pour les porteurs (art. 49)",
      ],
      explanation:
        "Seuls les établissements de crédit et les établissements de monnaie électronique peuvent émettre un EMT (art. 48). C'est le cas ici.",
    },
  },
  {
    id: "issuer-authorization-emt-entity-missing",
    area: "issuer_obligations",
    title: "Statut d'émetteur EMT manquant",
    articleRef: "Art. 48 (approximatif)",
    when: {
      all: [
        { field: "role.isIssuer", op: "eq", value: true },
        { field: "derived.isEMT", op: "eq", value: true },
        { field: "token.issuerIsCreditInstitution", op: "eq", value: false },
        { field: "token.issuerIsEMoneyInstitution", op: "eq", value: false },
      ],
    },
    result: {
      verdict: "warning",
      label: "Blocage : seuls les établissements de crédit ou de monnaie électronique peuvent émettre un EMT",
      obligations: [
        "Obtenir un agrément d'établissement de monnaie électronique (directive 2009/110/CE), ou",
        "Passer par un établissement déjà agréé pour émettre le jeton pour le compte de l'émetteur",
      ],
      explanation:
        "L'art. 48 MiCA réserve l'émission d'EMT aux établissements de crédit et aux établissements de monnaie électronique. En l'état des réponses, ce n'est le cas d'aucun des deux — l'émission telle que décrite n'est pas conforme.",
    },
  },
  {
    id: "issuer-reserve-of-assets",
    area: "issuer_obligations",
    title: "Réserve d'actifs",
    articleRef: "Art. 36, 58 (approximatif)",
    when: {
      all: [
        { field: "role.isIssuer", op: "eq", value: true },
        { any: [{ field: "derived.isART", op: "eq", value: true }, { field: "derived.isEMT", op: "eq", value: true }] },
      ],
    },
    result: {
      verdict: "applicable",
      label: "Constitution et gestion d'une réserve d'actifs",
      obligations: [
        "Ségréguer la réserve des actifs propres de l'émetteur",
        "Faire garder la réserve par un dépositaire (établissement de crédit ou CASP agréé pour la conservation)",
        "Maintenir une politique de liquidité et publier un rapport périodique sur la composition de la réserve",
      ],
      explanation:
        "Les EMT et les ART doivent être adossés à une réserve d'actifs de valeur au moins égale à la valeur en circulation, gérée selon des règles strictes de ségrégation et de garde.",
    },
  },
  {
    id: "issuer-significant-token",
    area: "issuer_obligations",
    title: "Jeton potentiellement « significatif »",
    articleRef: "Art. 43, 56 (approximatif, seuils simplifiés)",
    when: {
      all: [
        { field: "role.isIssuer", op: "eq", value: true },
        { any: [{ field: "derived.isART", op: "eq", value: true }, { field: "derived.isEMT", op: "eq", value: true }] },
        {
          any: [
            { field: "token.numberOfHolders", op: "gte", value: 2_000_000 },
            { field: "token.averageOutstandingValueEUR", op: "gte", value: 1_000_000_000 },
            { field: "token.numberOfTransactionsPerDay", op: "gte", value: 2_500_000 },
          ],
        },
      ],
    },
    result: {
      verdict: "warning",
      label: "Seuils indicatifs de jeton « significatif » atteints",
      obligations: [
        "Supervision directe potentielle de l'ABE plutôt que de l'autorité nationale",
        "Exigences de fonds propres renforcées",
        "Plan de continuité d'activité et limites d'usage comme moyen d'échange à grande échelle",
      ],
      explanation:
        "Les seuils réels de désignation « significatif » (art. 43 pour les ART, 56 pour les EMT) reposent sur des critères précisés par l'ABE/l'ESMA. Les seuils utilisés ici (porteurs, encours, transactions/jour) sont des ordres de grandeur pédagogiques, pas les critères réglementaires exacts.",
    },
  },
];
