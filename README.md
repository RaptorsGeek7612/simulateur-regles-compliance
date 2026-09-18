# Simulateur de règles de compliance

[![CI](https://github.com/RaptorsGeek7612/simulateur-regles-compliance/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/RaptorsGeek7612/simulateur-regles-compliance/actions/workflows/ci.yml)

**App en ligne : [simulateur-compliance-frontend.vercel.app](https://simulateur-compliance-frontend.vercel.app)** (frontend Vercel + [API backend](https://api-production-5fff.up.railway.app/health) sur Railway). Un vrai token T-REX de démo est configuré par défaut côté serveur (déployé sur un nœud dédié, également hébergé sur Railway) — le diagnostic on-chain fonctionne dès qu'on renseigne `from`/`to`/`amount`, sans RPC ni adresse à fournir. Comptes de démo tout prêts : `0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc` (Alice, 1000 SIMT) → `0x23618e81E3f5cdF7f54C3d65f7FBc0aBf5B21E8f` (Dave) pour un transfert autorisé, ou → `0x976EA74026E726554dB657fA54763abd0C3a0aa9` (Bob, pays non autorisé par le module de compliance) pour voir un refus.

Vérifie un security token ERC-3643 (T-REX) sous deux angles complémentaires, reliés entre eux :

- **Diagnostic on-chain** : pourquoi un transfert donné passe ou échoue — pause, solde, gel, identité ONCHAINID, puis chaque module de compliance branché (`MaxHolderCountModule`, `MinimumTicketModule`, `LockupModule`, `BlackoutPeriodModule`, `ClaimRequiredModule`). Lecture seule, aucune transaction envoyée. Inclut un mode "scénario" pour rejouer un fichier de cas attendus en non-régression.
- **Simulateur réglementaire MiCA** : à partir d'un questionnaire (rôle émetteur/CASP, caractéristiques du token, services fournis...), évalue quelles règles du règlement européen MiCA s'appliquent — classification du crypto-actif, obligations d'émetteur, agrément CASP, abus de marché. Outil pédagogique, ne remplace pas un avis juridique.

Chaque volet renvoie vers l'autre : une obligation MiCA affiche les modules on-chain qui l'implémentent techniquement, et un module bloquant un transfert affiche l'obligation MiCA qu'il traduit.

## Structure du repo

| Dossier | Rôle | Doc |
|---|---|---|
| `backend/` | API Express (diagnostic on-chain + moteur de règles MiCA) et CLI de diagnostic | [`backend/README.md`](backend/README.md) |
| `frontend/` | Interface web (diagnostic on-chain, rejeu de scénarios, wizard MiCA) | [`frontend/README.md`](frontend/README.md) |
| `chain-demo/` | Source du token T-REX de démo servi en production (pas un projet pnpm) | [`chain-demo/README.md`](chain-demo/README.md) |

`backend/` et `frontend/` sont des projets pnpm indépendants (workspace propre à chacun), sans `package.json` racine.

## Démarrage rapide (local)

```bash
# Backend — API sur http://localhost:4000
cd backend
pnpm install
cp .env.example .env    # RPC_URL et TOKEN_ADDRESS (optionnels, surchargeables depuis l'UI)
pnpm dev

# Frontend — interface sur http://localhost:5173
cd frontend
pnpm install
pnpm dev
```

Détails, variables d'environnement et limites connues : voir les README de chaque dossier.

## CI

`.github/workflows/ci.yml` fait tourner, à chaque push/PR sur `main` : typecheck + tests (backend), typecheck + build (frontend).

## Limites à connaître

- Volet on-chain : les ABIs sont écrites à la main et doivent être vérifiées contre la version du token déployé ; un transfert refusé n'émet aucun événement, le simulateur ne peut interroger que l'état courant.
- Volet MiCA : seuils chiffrés et références d'articles simplifiés/approximatifs à des fins pédagogiques, à vérifier contre le texte du règlement UE 2023/1114 avant toute décision réelle.
- Le lien entre un module on-chain et une obligation MiCA est indicatif, pas une correspondance juridique garantie.

## Licence

MIT.
