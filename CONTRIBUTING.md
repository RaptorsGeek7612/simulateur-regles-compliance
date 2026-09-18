# Contribuer

## Structure

Le repo contient deux projets pnpm indépendants, chacun avec son propre workspace, ses dépendances et son déploiement :

- `backend/` — API Express : diagnostic on-chain ERC-3643 + moteur de règles MiCA ([`backend/README.md`](backend/README.md))
- `frontend/` — interface web ([`frontend/README.md`](frontend/README.md))

Il n'y a pas de `package.json` racine : installe et lance les commandes depuis le sous-dossier concerné.

## Avant de commencer

```bash
cd backend && pnpm install && cp .env.example .env   # renseigner RPC_URL, TOKEN_ADDRESS si tu testes le volet on-chain
cd ../frontend && pnpm install
```

## Avant d'ouvrir une PR

Le CI (`.github/workflows/ci.yml`) tourne sur chaque push/PR vers `main` et doit passer :

```bash
# backend
cd backend
pnpm run typecheck
pnpm run test

# frontend
cd frontend
pnpm build
pnpm exec tsc --noEmit
```

## Commits

Messages en français, à l'impératif, qui expliquent le *pourquoi* plutôt que de décrire le diff. Un commit = un changement logique.

## Style

- TypeScript strict partout, pas de `any` non justifié.
- Pas de commentaire qui répète ce que le code dit déjà — seulement pour une contrainte cachée, un piège, ou un choix non évident.
- Volet MiCA : ne jamais présenter un seuil chiffré ou une référence d'article comme une certitude juridique absolue — toujours le qualifier d'approximatif dans le code (`articleRef`/`explanation`) et dans l'UI.
- Volet on-chain : rester en lecture seule. N'ajoute pas de commande qui envoie une transaction sans en discuter d'abord.
- Le lien entre les deux volets (`backend/src/shared/moduleObligationMap.ts`) doit rester cohérent avec les identifiants de règles réellement définis dans `backend/src/rules/*.rules.ts` — une règle renommée sans mettre à jour la table casse le lien silencieusement.
