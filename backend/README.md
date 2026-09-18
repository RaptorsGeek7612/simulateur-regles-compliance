# Backend — API + CLI

[![CI](https://github.com/RaptorsGeek7612/simulateur-regles-compliance/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/RaptorsGeek7612/simulateur-regles-compliance/actions/workflows/ci.yml)

Projet pnpm indépendant (pas de `package.json` racine, voir [`../CONTRIBUTING.md`](../CONTRIBUTING.md)). Deux volets partageant le même serveur Express :

- **Diagnostic on-chain** (`src/onchain/`, `src/api/onchain.ts`, `src/cli.ts`) — pourquoi un transfert ERC-3643 (T-REX) passe ou échoue. Lecture seule, aucune transaction envoyée.
- **Simulateur MiCA** (`src/engine/`, `src/rules/`, `src/api/mica.ts`) — moteur de règles qui évalue un questionnaire contre le règlement UE 2023/1114.
- **Lien entre les deux** (`src/shared/moduleObligationMap.ts`) — table statique qui associe chaque module de compliance on-chain aux règles MiCA qu'il traduit techniquement.

## Démarrage

```bash
pnpm install
cp .env.example .env
pnpm dev        # API sur http://localhost:4000, redémarre au changement de fichier
```

Variables d'environnement (`.env`) :

| Variable | Rôle |
|---|---|
| `RPC_URL` | Endpoint JSON-RPC par défaut pour le volet on-chain. Surchargeable par requête (`rpcUrl` dans le body). |
| `TOKEN_ADDRESS` | Adresse du token ERC-3643 par défaut. Surchargeable par requête (`tokenAddress`). |
| `PORT` | Port HTTP de l'API (défaut `4000`). |
| `ALLOWED_ORIGIN` | Origine autorisée par CORS (défaut `http://localhost:5173`, l'URL du frontend en dev). |

Aucune des deux variables `RPC_URL`/`TOKEN_ADDRESS` n'est requise pour démarrer le serveur : sans elles, le volet MiCA fonctionne normalement et le volet on-chain répond avec une erreur 400 explicite tant qu'aucune valeur n'est fournie (côté serveur ou dans la requête).

## Scripts

```bash
pnpm dev         # serveur de dev avec rechargement (tsx watch)
pnpm build       # compile vers dist/
pnpm start       # lance dist/index.js (après build)
pnpm typecheck   # tsc --noEmit
pnpm test        # vitest run
pnpm sim         # CLI de diagnostic (voir plus bas), équivalent à `tsx src/cli.ts`
```

## API HTTP

Toutes les routes répondent en JSON. Une erreur de validation renvoie `400` avec `{ "error": ... }` (détail Zod aplati) ; une erreur de lecture on-chain renvoie `502` avec `{ "error": "<message>" }`.

### `GET /health`

`{ "ok": true }` — sonde de liveness.

### Volet MiCA (`/api/mica`)

- **`GET /questionnaire-template`** — renvoie un questionnaire vide (`QuestionnaireAnswers`, toutes les valeurs à `false`/`0`), à utiliser comme état initial d'un formulaire.
- **`GET /module-map`** — renvoie `MODULE_OBLIGATION_MAP` : la liste des liens `{ moduleName, ruleIds, note }` entre modules on-chain et règles MiCA.
- **`POST /evaluate`** — body : un `QuestionnaireAnswers` complet (voir `src/engine/questionnaire.ts` pour la forme exacte : `role`, `token`, `casp`, `marketAbuse`). Réponse : `{ "results": RuleResult[] }`, une entrée par règle qui matche (plusieurs règles d'une même zone — `classification`, `issuer_obligations`, `casp_authorization`, `market_abuse` — peuvent s'appliquer en parallèle).

### Volet on-chain (`/api/onchain`)

- **`GET /config`** — `{ hasDefaultRpc: boolean, defaultTokenAddress: string | null }`, pour que le frontend sache si le formulaire peut rester vide.
- **`POST /diagnose`** — body : `{ rpcUrl?, tokenAddress?, from, to, amount }` (`from`/`to` : adresses `0x…` ; `amount` : chaîne de chiffres, unités de base du token, pas l'unité affichée). Réponse : `{ allowed: boolean, findings: Finding[] }`.
- **`POST /scenario`** — body : `{ rpcUrl?, tokenAddress?, cases: ScenarioCase[] }` où chaque cas est `{ name, from, to, amount, expect: "allow" | "deny" }`. Réponse : `{ results: ScenarioCaseResult[], summary: { passed, total } }`. Voir `scenarios.example.json` pour un exemple.

`rpcUrl`/`tokenAddress` sont optionnels dans le body : à défaut, le serveur retombe sur `RPC_URL`/`TOKEN_ADDRESS` de l'environnement ; si ni l'un ni l'autre n'est disponible, `400`.

## CLI

```bash
pnpm sim diagnose --from 0x... --to 0x... --amount 1000000000000000000
pnpm sim scenario --file scenarios.example.json
```

Utilise directement `RPC_URL`/`TOKEN_ADDRESS` depuis `.env` (pas d'équivalent CLI aux surcharges `rpcUrl`/`tokenAddress` de l'API). `sim scenario` sort avec un code non nul si au moins un cas ne correspond pas à l'attendu — utilisable en CI de non-régression sur les règles de conformité d'un déploiement donné.

## Structure

```
src/
  api/            routers Express (mica.ts, onchain.ts) — validation Zod + appel du moteur/diagnostic
  engine/         moteur de règles générique : condition.ts (évaluateur), evaluate.ts (dérivation + exécution), questionnaire.ts, types.ts
  rules/          les règles MiCA elles-mêmes, une famille par fichier (classification, issuerObligations, caspAuthorization, marketAbuse)
  onchain/        diagnose.ts (lecture on-chain étape par étape), scenarioRunner.ts (rejeu non-régression), abis.ts
  shared/         moduleObligationMap.ts — le lien entre les deux volets
  cli.ts, index.ts, __tests__/
```

## Limites connues

- **On-chain** : les ABIs (`src/onchain/abis.ts`) sont écrites à la main pour un token T-REX standard — à vérifier contre le contrat réellement déployé avant tout diagnostic. Un transfert refusé n'émet aucun événement ; `diagnose()` ne peut interroger que l'état courant, pas reconstituer une transaction passée. Validé contre le contrat de référence [TokenySolutions/T-REX](https://github.com/TokenySolutions/T-REX) déployé sur un nœud Hardhat local (pause, gel, solde, module de compliance réel `CountryAllowModule`, identité manquante).
- **`compliance.canTransfer()` ne suffit pas à lui seul** : ce contrat ne vérifie que les modules de compliance — pause, gel et solde disponible sont des `require()` séparés dans `Token.transfer()`. `diagnose()` calcule donc le verdict global (`allowed`) à partir de *tous* les findings, pas du seul retour de `canTransfer()` (sinon un transfert peut être annoncé « autorisé » alors qu'il échouerait réellement pour cause de pause/gel/solde).
- Le contrat de référence ne vérifie l'identité que du **destinataire** au moment du transfert (`Token.transfer()` n'appelle jamais `isVerified()` sur l'émetteur) — `diagnose()` affiche quand même l'état des deux côtés à titre informatif, mais un « émetteur non vérifié » peut ne pas bloquer un transfert réel selon les modules branchés.
- **MiCA** : seuils chiffrés et références d'articles (`articleRef`, `explanation` dans `src/rules/*.rules.ts`) sont simplifiés à des fins pédagogiques et explicitement marqués « approximatif » — à vérifier contre le texte du règlement UE 2023/1114 avant toute décision réelle. Voir le disclaimer en tête de chaque fichier de règles.
- **Lien module ↔ obligation** (`src/shared/moduleObligationMap.ts`) : indicatif, pas une correspondance juridique garantie ; à maintenir manuellement (voir [`../CONTRIBUTING.md`](../CONTRIBUTING.md)).
