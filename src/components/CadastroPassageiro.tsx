import { useState } from "react";
import axios from "axios";

interface CadastroProps {
  aoVoltar: () => void;
}

function CadastroPassageiro({ aoVoltar }: CadastroProps) {
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [endereco, setEndereco] = useState("");
  const [bairro, setBairro] = useState("");
  const [faculdade, setFaculdade] = useState("");
  const [turno, setTurno] = useState("NOITE");

  function salvarPassageiro() {
    const novoPassageiro = {
      nome,
      telefone,
      endereco,
      bairro,
      faculdade,
      turno,
    };
    axios
      .post("http://localhost:8080/students", novoPassageiro)
      .then(() => aoVoltar());
  }

  return (
    <div>
      <button onClick={aoVoltar}>Voltar para Lista</button>
      <h2>Cadastro de Novo Passageiro</h2>
      <div>
        <input
          type="text"
          placeholder="Nome"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
        ></input>
        <input
          type="number"
          placeholder="Telefone"
          value={telefone}
          onChange={(e) => setTelefone(e.target.value)}
        ></input>
        <input
          type="text"
          placeholder="Endereço"
          value={endereco}
          onChange={(e) => setEndereco(e.target.value)}
        ></input>
        <input
          type="text"
          placeholder="Bairro"
          value={bairro}
          onChange={(e) => setBairro(e.target.value)}
        ></input>
        <input
          type="text"
          placeholder="Faculdade"
          value={faculdade}
          onChange={(e) => setFaculdade(e.target.value)}
        ></input>
        <select value={turno} onChange={(e) => setTurno(e.target.value)}>
          <option value="MANHA">Manhã</option>
          <option value="TARDE">Tarde</option>
          <option value="NOITE">Noite</option>
        </select>
        <button onClick={salvarPassageiro}>Salvar Passageiro</button>
      </div>
    </div>
  );
}

export default CadastroPassageiro;
