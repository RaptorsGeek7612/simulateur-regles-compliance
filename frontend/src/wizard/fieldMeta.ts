export interface FieldMeta {
  label: string;
  help?: string;
}

export const tokenFieldMeta: Record<string, FieldMeta> = {
  isFinancialInstrument: {
    label: "Instrument financier (MiFID II)",
    help: "Si oui, le jeton est hors champ MiCA (art. 2§4) : c'est le droit des marchés financiers classique qui s'applique.",
  },
  isNFTUnique: {
    label: "Unique et non fongible (NFT au sens strict)",
    help: "Une collection quasi-identique en grande série peut être requalifiée en crypto-actif fongible.",
  },
  referencesSingleFiatCurrency: {
    label: "Référence une seule monnaie fiat ayant cours légal",
    help: "Candidat jeton de monnaie électronique (EMT).",
  },
  referencesMultipleAssetsOrBasket: {
    label: "Référence plusieurs actifs, une matière première ou un panier",
    help: "Candidat jeton se référant à un actif (ART).",
  },
  grantsClaimOnIssuer: {
    label: "Confère une créance sur l'émetteur",
    help: "Mécanisme de stabilisation typique des EMT/ART.",
  },
  isUtilityToken: {
    label: "Jeton utilitaire (donne accès à un bien ou service)",
  },
  utilityUsableOnlyOnIssuerPlatform: {
    label: "Utilisable uniquement sur la plateforme/l'écosystème de l'émetteur",
    help: "Condition de l'exemption partielle de livre blanc (art. 4§3).",
  },
  isOfferedToPublic: {
    label: "Offert au public",
  },
  isAdmittedToTradingPlatform: {
    label: "Admis à la négociation sur une plateforme",
  },
  offerValueEUR12m: {
    label: "Valeur cumulée de l'offre sur 12 mois glissants (EUR)",
  },
  issuerIsCreditInstitution: {
    label: "L'émetteur est un établissement de crédit",
  },
  issuerIsEMoneyInstitution: {
    label: "L'émetteur est un établissement de monnaie électronique",
  },
  averageOutstandingValueEUR: {
    label: "Valeur moyenne en circulation (EUR)",
    help: "Sert aux seuils de « jeton significatif ».",
  },
  numberOfHolders: {
    label: "Nombre de porteurs",
  },
  numberOfTransactionsPerDay: {
    label: "Nombre de transactions par jour",
  },
  isFreeOfCharge: {
    label: "Offert gratuitement",
    help: "Sans contrepartie liée au prix d'un autre crypto-actif.",
  },
};

export const caspFieldMeta: Record<string, FieldMeta> = {
  providesCustody: { label: "Conservation pour compte de tiers" },
  providesExchangeForFunds: { label: "Échange contre des fonds" },
  providesExchangeForOtherCrypto: { label: "Échange contre d'autres crypto-actifs" },
  providesExecutionOfOrders: { label: "Exécution d'ordres" },
  providesPlacing: { label: "Placement" },
  providesReceptionAndTransmission: { label: "Réception et transmission d'ordres" },
  providesAdvice: { label: "Conseil" },
  providesPortfolioManagement: { label: "Gestion de portefeuille" },
  providesTransferService: { label: "Service de transfert" },
  operatesTradingPlatform: { label: "Exploitation d'une plateforme de négociation" },
  isAlreadyAuthorisedEntity: {
    label: "Déjà agréé (établissement de crédit / monnaie électronique / entreprise d'investissement)",
    help: "Régime allégé de notification plutôt que d'agrément complet (art. 60-61).",
  },
};
