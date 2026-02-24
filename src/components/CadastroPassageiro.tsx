import { useState } from "react";
import axios from "axios";
import type { Student } from "../types/student";

interface CadastroProps {
  aoVoltar: () => void;
  alunoEditando: Student | null;
}

function CadastroPassageiro({ aoVoltar, alunoEditando }: CadastroProps) {
  const [nome, setNome] = useState(alunoEditando ? alunoEditando.nome : "");
  const [telefone, setTelefone] = useState(
    alunoEditando ? alunoEditando.telefone : "",
  );
  const [endereco, setEndereco] = useState(
    alunoEditando ? alunoEditando.endereco : "",
  );
  const [bairro, setBairro] = useState(
    alunoEditando ? alunoEditando.bairro : "",
  );
  const [faculdade, setFaculdade] = useState(
    alunoEditando ? alunoEditando.faculdade : "",
  );
  const [turno, setTurno] = useState(
    alunoEditando ? alunoEditando.turno : "MANHA",
  );
  const [ordemRota, setOrdemRota] = useState(alunoEditando?.ordemRota || "");

  function salvarPassageiro() {
    const dadosPassageiro = {
      nome,
      telefone,
      endereco,
      bairro,
      faculdade,
      turno,
      ordemRota: Number(ordemRota),
    };
    if (alunoEditando) {
      axios
        .put(
          `http://localhost:8080/students/${alunoEditando.id}`,
          dadosPassageiro,
        )
        .then(() => aoVoltar());
    } else {
      axios
        .post("http://localhost:8080/students", dadosPassageiro)
        .then(() => aoVoltar());
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:max-w-md md:mx-auto">
      <button
        className="text-blue-600 font-semibold mb-4 hover:underline cursor-pointer"
        onClick={aoVoltar}
      >
        ← Voltar para Lista
      </button>
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        {alunoEditando ? "Editar Passageiro" : "Novo Passageiro"}
      </h2>
      <div className="bg-white p-6 rounded-xl shadow-md flex flex-col gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nome Completo
          </label>
          <input
            type="text"
            className="w-full p-2 rounded-lg border border-gray-300 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
          ></input>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Telefone
          </label>
          <input
            type="number"
            className="w-full p-2 rounded-lg border border-gray-300 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition"
            value={telefone}
            onChange={(e) => setTelefone(e.target.value)}
          ></input>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Endereço
          </label>
          <input
            type="text"
            className="w-full p-2 rounded-lg border border-gray-300 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition"
            value={endereco}
            onChange={(e) => setEndereco(e.target.value)}
          ></input>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Bairro
          </label>
          <input
            type="text"
            className="w-full p-2 rounded-lg border border-gray-300 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition"
            value={bairro}
            onChange={(e) => setBairro(e.target.value)}
          ></input>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Faculdade
          </label>
          <input
            type="text"
            className="w-full p-2 rounded-lg border border-gray-300 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition"
            value={faculdade}
            onChange={(e) => setFaculdade(e.target.value)}
          ></input>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Ordem no Roteiro (Posição)
          </label>
          <input
            type="number"
            placeholder="Ex: 1 (Primeiro a ser buscado)"
            className="w-full p-2 rounded-lg border border-gray-300 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition"
            value={ordemRota}
            onChange={(e) => setOrdemRota(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Turno
          </label>
          <select
            className="w-full p-2 rounded-lg border border-gray-300 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition"
            value={turno}
            onChange={(e) => setTurno(e.target.value)}
          >
            <option value="MANHA">Manhã</option>
            <option value="TARDE">Tarde</option>
            <option value="NOITE">Noite</option>
          </select>
        </div>

        <button
          className="w-full bg-green-600 text-white font-bold text-lg py-4 rounded-lg mt-4 shadow-md hover:bg-green-700 transition cursor-pointer"
          onClick={salvarPassageiro}
        >
          Salvar Passageiro
        </button>
      </div>
    </div>
  );
}

export default CadastroPassageiro;
