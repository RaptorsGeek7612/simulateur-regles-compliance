# Frontend — interface web

Projet pnpm indépendant (pas de `package.json` racine, voir [`../CONTRIBUTING.md`](../CONTRIBUTING.md)). App React (Vite + `react-router-dom`), sans framework CSS — un seul feuillet de styles (`src/index.css`) avec variables CSS et support clair/sombre via `prefers-color-scheme`.

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
  components/   Layout (nav), Badge, FindingsList, ObligationLinks — partagés entre pages
  wizard/       les 4 étapes du questionnaire MiCA + fieldMeta.ts (libellés/aide en français par champ)
  pages/        Home, OnchainDiagnose, OnchainScenario, MicaWizard
  App.tsx, main.tsx, index.css
```

## Limites connues

- Aucune validation métier côté client au-delà des types : la validation réelle (Zod) est côté backend, les erreurs `400` sont affichées telles quelles.
- Pas de tests automatisés sur ce projet pour l'instant — vérifié manuellement (Playwright headless) lors du développement initial : navigation, wizard MiCA de bout en bout, gestion d'erreur sur échec RPC.
- Outil pédagogique — ne remplace pas un avis juridique (voir le README racine pour le disclaimer complet).
