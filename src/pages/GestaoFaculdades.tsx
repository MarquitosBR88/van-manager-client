import { api } from "../services/api";
import type { Faculdade } from "../types/faculdade.ts";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Building, Plus, Pencil, Trash2 } from "lucide-react";

function GestaoFaculdades() {
  const [faculdades, setFaculdades] = useState<Faculdade[]>([]);
  const [novaFaculdadeNome, setNovaFaculdadeNome] = useState("");
  const [faculdadeEmEdicao, setFaculdadeEmEdicao] = useState<Faculdade | null>(
    null,
  );

  function buscarFaculdades() {
    api
      .get("/faculdades")
      .then((resposta) => setFaculdades(resposta.data))
      .catch(() => toast.error("Erro ao carregar lista de faculdades."));
  }

  useEffect(() => {
    buscarFaculdades();
  }, []);

  function deletarFaculdade(id: number) {
    if (
      window.confirm(
        "ATENÇÃO: Excluir esta faculdade pode afetar alunos vinculados a ela. Confirmar?",
      )
    ) {
      api
        .delete(`/faculdades/${id}`)
        .then(() => {
          setFaculdades(faculdades.filter((faculdade) => faculdade.id !== id));
          toast.success("Faculdade excluída.");
        })
        .catch(() =>
          toast.error(
            "Erro ao excluir. Verifique se há alunos matriculados nela.",
          ),
        );
    }
  }

  function salvarFaculdade() {
    if (!novaFaculdadeNome.trim()) {
      toast.warning("O nome não pode estar vazio.");
      return;
    }

    if (faculdadeEmEdicao === null) {
      api
        .post("/faculdades", { nome: novaFaculdadeNome })
        .then(() => {
          setNovaFaculdadeNome("");
          toast.success("Faculdade cadastrada!");
          buscarFaculdades();
        })
        .catch(() => toast.error("Erro ao cadastrar."));
    } else {
      api
        .put("/faculdades/" + faculdadeEmEdicao.id, { nome: novaFaculdadeNome })
        .then(() => {
          setNovaFaculdadeNome("");
          setFaculdadeEmEdicao(null);
          toast.success("Faculdade atualizada!");
          buscarFaculdades();
        })
        .catch(() => toast.error("Erro ao atualizar."));
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:max-w-md md:mx-auto font-sans">
      <div className="flex flex-col gap-4 mt-2 mb-8">
        <div className="flex items-center gap-3 mb-2 text-gray-800">
          <Building size={28} className="text-purple-600" />
          <h1 className="text-2xl font-black">Faculdades</h1>
        </div>

        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-3">
          <label className="text-sm font-bold text-gray-700">
            {faculdadeEmEdicao ? "Editar Nome:" : "Adicionar Nova:"}
          </label>
          <div className="flex gap-2">
            <input
              className="flex-1 p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
              value={novaFaculdadeNome}
              onChange={(e) => setNovaFaculdadeNome(e.target.value)}
              placeholder="Ex: UNITRI, UFU..."
            />
            <button
              onClick={salvarFaculdade}
              className="bg-purple-600 hover:bg-purple-700 text-white p-3 rounded-xl shadow-sm transition flex items-center justify-center aspect-square"
            >
              {faculdadeEmEdicao ? <Pencil size={20} /> : <Plus size={24} />}
            </button>
          </div>
          {faculdadeEmEdicao && (
            <button
              onClick={() => {
                setFaculdadeEmEdicao(null);
                setNovaFaculdadeNome("");
              }}
              className="text-xs text-gray-400 font-bold self-start hover:underline"
            >
              Cancelar edição
            </button>
          )}
        </div>

        <div className="flex flex-col gap-3 mt-4">
          {faculdades.map((faculdade) => (
            <div
              key={faculdade.id}
              className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center group"
            >
              <p className="font-bold text-gray-800 text-lg">
                {faculdade.nome}
              </p>
              <div className="flex gap-2">
                <button
                  className="text-gray-400 hover:text-purple-600 p-2 transition"
                  onClick={() => {
                    setFaculdadeEmEdicao(faculdade);
                    setNovaFaculdadeNome(faculdade.nome);
                  }}
                >
                  <Pencil size={18} />
                </button>
                <button
                  className="text-gray-400 hover:text-red-500 p-2 transition"
                  onClick={() => deletarFaculdade(faculdade.id)}
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default GestaoFaculdades;
