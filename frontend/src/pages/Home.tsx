import { Link } from "react-router-dom";

export function Home() {
  return (
    <div className="home">
      <h1 className="home__hero">
        Vérifie un <span className="home__hero-accent">security token ERC-3643</span> (T-REX) sous deux angles
        complémentaires, reliés entre eux.
      </h1>
      <div className="home__cards">
        <Link to="/onchain" className="home__card home__card--primary">
          <span className="home__card-eyebrow">01</span>
          <h2>Diagnostic on-chain</h2>
          <p>
            Pourquoi un transfert donné passe ou échoue : pause, solde, gel, identité ONCHAINID, puis chaque module
            de compliance branché. Lecture seule, aucune transaction envoyée.
          </p>
        </Link>
        <Link to="/mica" className="home__card home__card--primary">
          <span className="home__card-eyebrow">02</span>
          <h2>Questionnaire MiCA</h2>
          <p>
            À partir d'un questionnaire (rôle émetteur/CASP, caractéristiques du token, services fournis...), évalue
            quelles règles du règlement européen MiCA s'appliquent.
          </p>
        </Link>
      </div>
      <Link to="/onchain/scenarios" className="home__card home__card--secondary">
        <h2>Rejeu de scénarios</h2>
        <p>
          Mode complémentaire du diagnostic on-chain : rejoue un fichier de cas attendus, en non-régression.
        </p>
      </Link>
      <p className="home__disclaimer">
        Chaque volet renvoie vers l'autre : une obligation MiCA affiche les modules on-chain qui l'implémentent
        techniquement, et un module bloquant un transfert affiche l'obligation MiCA qu'il traduit. Outil pédagogique,
        ne remplace pas un avis juridique.
      </p>
    </div>
  );
}
