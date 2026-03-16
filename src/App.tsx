import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import Gestao from "./pages/Gestao";
import Home from "./pages/Home";
import ListaChamada from "./components/ListaChamada";
import GestaoFaculdades from "./pages/GestaoFaculdades";

function App() {
  return (
    <BrowserRouter>
      <Toaster richColors position="top-right" />
      <Routes>
        <Route path="/gestaoAlunos" element={<Gestao />}></Route>
        <Route path="/chamada" element={<ListaChamada />}></Route>
        <Route path="/gestaoFaculdades" element={<GestaoFaculdades />}></Route>
        <Route path="" element={<Home />}></Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
