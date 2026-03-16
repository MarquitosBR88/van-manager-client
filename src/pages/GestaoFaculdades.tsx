import { api } from "../services/api";
import type { Faculdade } from "../types/faculdade.ts";
import { useEffect, useState } from "react";

function GestaoFaculdades() {
  const [faculdades, setFaculdades] = useState<Faculdade[]>([]);
  const [novaFaculdadeNome, setNovaFaculdadeNome] = useState("");
  const [faculdadeEmEdicao, setFaculdadeEmEdicao] = useState<Faculdade | null>(
    null,
  );

  function buscarFaculdades() {
    const busca = api
      .get("/faculdades")
      .then((resposta) => {
        setFaculdades(resposta.data);
      })
      .catch((erro) => {
        console.error("Algo de errado aconteceu: ", erro);
      });
    return busca;
  }

  useEffect(() => {
    buscarFaculdades;
  }, []);

  function deletarFaculdade(id: number) {
    api
      .delete(`/faculdades/${id}`)
      .then(() => {
        setFaculdades(faculdades.filter((faculdade) => faculdade.id !== id));
      })
      .catch((erro) => {
        console.error("Erro ao deletar", erro);
      });
  }

  function salvarFaculdade() {
    if (faculdadeEmEdicao === null) {
      api.post("/faculdades", { nome: novaFaculdadeNome }).then(() => {
        setNovaFaculdadeNome("");
        buscarFaculdades();
      });
    } else {
      api
        .put("/faculdades/" + faculdadeEmEdicao.id, {
          nome: novaFaculdadeNome,
        })
        .then(() => {
          setNovaFaculdadeNome("");
          setFaculdadeEmEdicao(null);
          buscarFaculdades();
        });
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:max-w-md md:mx-auto">
      <input
        value={novaFaculdadeNome}
        onChange={(e) => setNovaFaculdadeNome(e.target.value)}
        placeholder="Digite o nome da faculdade..."
      ></input>
      <button onClick={salvarFaculdade}>Salvar</button>
      {faculdades.map((faculdade) => (
        <div
          key={faculdade.id}
          className="bg-white p-4 rounded-xl shadow-md flex justify-between items-center border-l-4 border-blue-500"
        >
          <div>
            <p className="font-bold text-gray-800 text-lg">{faculdade.nome}</p>
          </div>

          <div className="flex gap-2">
            <button
              className="bg-yellow-500 text-white px-3 py-1 rounded-md font-semibold text-sm cursor-pointer"
              onClick={() => {
                setFaculdadeEmEdicao(faculdade);
                setNovaFaculdadeNome(faculdade.nome);
              }}
            >
              Editar
            </button>
            <button
              className="bg-red-500 text-white px-3 py-1 rounded-md font-semibold text-sm cursor-pointer"
              onClick={() => deletarFaculdade(faculdade.id)}
            >
              Excluir
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default GestaoFaculdades;
