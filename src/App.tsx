import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./screens/Dashboard";
import Certificates from "./screens/Certificates";
import Ledger from "./screens/Ledger";
import Aggregation from "./screens/Aggregation";
import Substantiation from "./screens/Substantiation";
import Provenance from "./screens/Provenance";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="/certificates" element={<Certificates />} />
        <Route path="/ledger" element={<Ledger />} />
        <Route path="/aggregation" element={<Aggregation />} />
        <Route path="/substantiation" element={<Substantiation />} />
        <Route path="/provenance" element={<Provenance />} />
      </Route>
    </Routes>
  );
}
