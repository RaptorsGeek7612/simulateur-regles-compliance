import { Link } from "react-router-dom";

export function Home() {
  return (
    <div className="home">
      <p className="home__intro">
        Vérifie un security token ERC-3643 (T-REX) sous deux angles complémentaires, reliés entre eux.
      </p>
      <div className="home__cards">
        <Link to="/onchain" className="home__card">
          <h2>Diagnostic on-chain</h2>
          <p>
            Pourquoi un transfert donné passe ou échoue — pause, solde, gel, identité ONCHAINID, puis chaque module
            de compliance branché. Lecture seule, aucune transaction envoyée.
          </p>
        </Link>
        <Link to="/onchain/scenarios" className="home__card">
          <h2>Rejeu de scénarios</h2>
          <p>Rejoue un fichier de cas attendus contre le diagnostic on-chain, en non-régression.</p>
        </Link>
        <Link to="/mica" className="home__card">
          <h2>Questionnaire MiCA</h2>
          <p>
            À partir d'un questionnaire (rôle émetteur/CASP, caractéristiques du token, services fournis...), évalue
            quelles règles du règlement européen MiCA s'appliquent.
          </p>
        </Link>
      </div>
      <p className="home__disclaimer">
        Chaque volet renvoie vers l'autre : une obligation MiCA affiche les modules on-chain qui l'implémentent
        techniquement, et un module bloquant un transfert affiche l'obligation MiCA qu'il traduit. Outil pédagogique,
        ne remplace pas un avis juridique.
      </p>
    </div>
  );
}
