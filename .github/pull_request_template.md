## Quoi et pourquoi

<!-- Le changement, et surtout la raison (bug corrigé, besoin couvert). -->

## Zone touchée

- [ ] backend (diagnostic on-chain)
- [ ] backend (règles MiCA)
- [ ] frontend
- [ ] CI / déploiement
- [ ] documentation

## Vérifications

- [ ] CI vert (`.github/workflows/ci.yml`) — typecheck + tests backend, build + typecheck frontend
- [ ] Si comportement UI modifié : testé dans le navigateur (pas seulement les tests automatisés)
- [ ] Si une règle MiCA ou un module on-chain a été ajouté/renommé : `backend/src/shared/moduleObligationMap.ts` mis à jour si pertinent
- [ ] Documentation mise à jour si le comportement observable change (README concerné)

## Notes de déploiement

<!-- Rien n'est déployé automatiquement pour l'instant. Signaler ici toute variable d'environnement
nécessaire avant/après le merge, sinon supprimer cette section. -->
