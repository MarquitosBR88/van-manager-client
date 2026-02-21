import { BrowserRouter, Routes, Route } from "react-router-dom";
import Gestao from "./pages/Gestao";
import Home from "./pages/Home";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/gestao" element={<Gestao />}></Route>
        <Route path="" element={<Home />}></Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
