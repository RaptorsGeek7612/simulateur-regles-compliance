# Frontend — interface web

[![CI](https://github.com/RaptorsGeek7612/simulateur-regles-compliance/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/RaptorsGeek7612/simulateur-regles-compliance/actions/workflows/ci.yml)

Projet pnpm indépendant (pas de `package.json` racine, voir [`../CONTRIBUTING.md`](../CONTRIBUTING.md)). App React (Vite + `react-router-dom`), sans framework CSS — un seul feuillet de styles (`src/index.css`, thème sombre uniquement, variables CSS).

Ne fait aucun calcul métier elle-même : c'est un client de l'API du backend (voir [`../backend/README.md`](../backend/README.md) pour le contrat des routes).

## Démarrage

```bash
pnpm install
pnpm dev        # http://localhost:5173
```

Le backend doit tourner en parallèle (`cd ../backend && pnpm dev`, sur `http://localhost:4000` par défaut).

Variable d'environnement (`.env`, voir `.env.example`) :

| Variable | Rôle |
|---|---|
| `VITE_API_URL` | Base URL de l'API backend (défaut en code si absente : `http://localhost:4000`). |

## Scripts

```bash
pnpm dev         # serveur de dev Vite
pnpm build       # tsc -b puis vite build → dist/
pnpm preview     # sert le build de dist/
pnpm typecheck   # tsc --noEmit
pnpm test        # vitest run (Testing Library + jsdom)
```

## Pages

| Route | Rôle |
|---|---|
| `/` | Accueil, liens vers les trois outils. |
| `/onchain` | Diagnostic on-chain : formulaire (RPC, adresse du token, `from`/`to`/`amount`) → `POST /api/onchain/diagnose`, résultat affiché étape par étape (pause, solde, gel, identité, modules, verdict). |
| `/onchain/scenarios` | Rejeu de scénarios : JSON de cas (upload ou édition directe) → `POST /api/onchain/scenario`, tableau pass/fail. |
| `/mica` | Questionnaire MiCA en 5 étapes (rôle, token, CASP, abus de marché, résultat) → `POST /api/mica/evaluate`, résultats groupés par zone (classification, obligations d'émetteur, agrément CASP, abus de marché). |

Le lien croisé entre les deux volets (voir `backend/src/shared/moduleObligationMap.ts`) est rendu à deux endroits :
- sous chaque résultat du wizard MiCA, les modules on-chain qui le traduisent techniquement (`ModuleLinksForRule`) ;
- sous chaque module en échec du diagnostic on-chain, l'obligation MiCA correspondante (`RuleLinksForModule`).

## Structure

```
src/
  api/          client HTTP typé (client.ts : fetch + gestion d'erreur ; mica.ts, onchain.ts : un appel par route backend)
  types/        types miroirs des réponses backend (mica.ts, onchain.ts)
  components/   Layout (nav), Logo, NetworkBackground (toile de fond animée), Badge, FindingsList, ObligationLinks — partagés entre pages
  wizard/       les 4 étapes du questionnaire MiCA + fieldMeta.ts (libellés/aide en français par champ)
  pages/        Home, OnchainDiagnose, OnchainScenario, MicaWizard
  test/         setup.ts (Testing Library + jest-dom, chargé par vitest.config.ts)
  App.tsx, main.tsx, index.css
```

Chaque module de `api/`, `components/` et `pages/` a son `*.test.ts(x)` à côté (mocks des modules `api/*` via `vi.mock`, pas d'appel réseau réel).

## Limites connues

- Aucune validation métier côté client au-delà des types : la validation réelle (Zod) est côté backend, les erreurs `400` sont affichées telles quelles.
- Les tests couvrent le client API, les composants partagés et les pages `MicaWizard`/`OnchainDiagnose` (rendu, erreurs, navigation) — pas de tests end-to-end automatisés (vérifié manuellement en Playwright headless pendant le développement, y compris contre le déploiement réel).
- Outil pédagogique — ne remplace pas un avis juridique (voir le README racine pour le disclaimer complet).
