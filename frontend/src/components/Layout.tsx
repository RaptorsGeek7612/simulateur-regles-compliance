import { NavLink, Outlet, useLocation } from "react-router-dom";
import { Logo } from "./Logo";
import { NetworkBackground } from "./NetworkBackground";

const navLinkClass = ({ isActive }: { isActive: boolean }) => (isActive ? "nav__link nav__link--active" : "nav__link");

export function Layout() {
  const location = useLocation();

  return (
    <div className="app">
      <NetworkBackground />
      <div className="app__aurora app__aurora--1" aria-hidden="true" />
      <div className="app__aurora app__aurora--2" aria-hidden="true" />

      <header className="app__header">
        <NavLink to="/" className="app__brand">
          <Logo size={42} />
          <span className="app__brand-text">
            <span className="app__brand-title">Simulateur</span>
            <span className="app__brand-subtitle">règles de compliance</span>
          </span>
        </NavLink>
        <nav className="nav">
          <NavLink to="/onchain" className={navLinkClass}>
            Diagnostic on-chain
          </NavLink>
          <NavLink to="/onchain/scenarios" className={navLinkClass}>
            Scénarios
          </NavLink>
          <NavLink to="/mica" className={navLinkClass}>
            Questionnaire MiCA
          </NavLink>
        </nav>
      </header>

      <main className="app__main">
        <div key={location.pathname} className="route-transition">
          <Outlet />
        </div>
      </main>

      <footer className="app__footer">
        <span className="app__footer-dot" aria-hidden="true" />
        Outil pédagogique — ne remplace pas un avis juridique. Voir les limites connues dans le README.
      </footer>
    </div>
  );
}
