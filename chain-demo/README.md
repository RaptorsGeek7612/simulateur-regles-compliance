# Chaîne de démo (T-REX)

Fait tourner le token T-REX qui sert de `RPC_URL`/`TOKEN_ADDRESS` par défaut sur le backend en production. Ce n'est **pas** un projet pnpm de ce repo — c'est la source du service Railway `chain` (même projet que le service `api`), séparé du reste du repo parce qu'il vendorise le code tiers [TokenySolutions/T-REX](https://github.com/TokenySolutions/T-REX) (126 fichiers Solidity, licence GPL/propriétaire — on ne le commite pas ici, seulement nos deux fichiers).

## Ce que fait `start.sh`

1. Lance `hardhat node` (chaîne Hardhat en mémoire) sur `$PORT`.
2. Attend que le RPC réponde.
3. Déploie la suite T-REX complète (identity registry, modular compliance + `CountryAllowModule`, token `SIMT`) via `scripts/deploy-for-diagnose-test.ts`.
4. Reste au premier plan pour servir le RPC (`wait "$NODE_PID"`).

Comme la chaîne est en mémoire et que le script de déploiement exécute toujours la même séquence de transactions depuis les mêmes comptes Hardhat par défaut (#0 à #19, clés publiques et déterministes), **les adresses des contrats et les comptes de démo sont identiques à chaque redémarrage du conteneur** :

| Compte | Adresse | Rôle dans la démo |
|---|---|---|
| Alice | `0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc` | Pays 42 (autorisé), 1000 SIMT, identité vérifiée |
| Bob | `0x976EA74026E726554dB657fA54763abd0C3a0aa9` | Pays 666 (**refusé** par `CountryAllowModule`), identité vérifiée |
| Dave | `0x23618e81E3f5cdF7f54C3d65f7FBc0aBf5B21E8f` | Pays 42 (autorisé), 0 SIMT, identité vérifiée |
| Charlie | `0x14dC79964da2C08b23698B3D3cc7Ca32193d9955` | Jamais enregistré (cas "aucune ONCHAINID") |

Token déployé : `0xc6e7DF5E7b4f2A278906862b61205850344D4e7d`.

## Recréer/redéployer ce service

```bash
git clone --depth 1 https://github.com/TokenySolutions/T-REX.git chain-demo-build
cd chain-demo-build
npm install
cp ../chain-demo/scripts/deploy-for-diagnose-test.ts scripts/
cp ../chain-demo/start.sh .
chmod +x start.sh
```

Puis dans `hardhat.config.ts`, ajouter un réseau `localhost` qui respecte `$PORT` :

```ts
const port = Number(process.env.PORT) || 8545;
// ... dans HardhatUserConfig :
networks: { localhost: { url: `http://127.0.0.1:${port}` } },
```

Et dans `package.json` :
- `"start": "sh start.sh"`
- `"prepare"` neutralisé (`husky install` échoue hors dépôt git) : `"prepare": "echo skip-husky"`
- `"engines": { "node": "20.x" }` (évite l'avertissement Hardhat sur les versions Node non supportées)

Puis déployer avec le CLI Railway, en visant explicitement le service `chain` du projet `compliance-sim-backend` (ne jamais laisser `railway up`/`railway init` deviner le projet/service cible — voir la compétence `deploy-safety-check`) :

```bash
railway up --service chain --environment production --project <project-id>
railway domain --service chain   # génère l'URL publique si pas déjà fait
```

## Limites

- Chaîne en mémoire : un redémarrage du conteneur reset l'état (soldes, gels, etc.) mais **pas** les adresses (déterministes). Ne sert que de démo, ne stocke rien d'important.
- Aucune garantie de disponibilité (plan Railway gratuit).
- **Les comptes Hardhat par défaut ont des clés privées publiquement connues** (affichées par `hardhat node` lui-même au démarrage). N'importe qui peut donc signer une transaction en tant que `deployer`/`tokenAgent` et modifier l'état du token de démo (mint, pause, gel...) directement via le RPC, sans passer par le backend. Accepté comme risque : aucune valeur réelle n'est en jeu, c'est le prix d'un token toujours accessible sans configuration. Ne jamais réutiliser ce schéma pour un déploiement qui gère de la vraie valeur.
