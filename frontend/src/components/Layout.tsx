import { NavLink, Outlet } from "react-router-dom";

const navLinkClass = ({ isActive }: { isActive: boolean }) => (isActive ? "nav__link nav__link--active" : "nav__link");

export function Layout() {
  return (
    <div className="app">
      <header className="app__header">
        <NavLink to="/" className="app__brand">
          Simulateur de règles de compliance
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
        <Outlet />
      </main>
      <footer className="app__footer">
        Outil pédagogique — ne remplace pas un avis juridique. Voir les limites connues dans le README.
      </footer>
    </div>
  );
}
