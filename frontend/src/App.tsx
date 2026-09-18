import { Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { Home } from "./pages/Home";
import { OnchainDiagnose } from "./pages/OnchainDiagnose";
import { OnchainScenario } from "./pages/OnchainScenario";
import { MicaWizard } from "./pages/MicaWizard";

export function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/onchain" element={<OnchainDiagnose />} />
        <Route path="/onchain/scenarios" element={<OnchainScenario />} />
        <Route path="/mica" element={<MicaWizard />} />
      </Route>
    </Routes>
  );
}
