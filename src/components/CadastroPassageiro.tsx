import { useEffect, useState } from "react";
import { api } from "../services/api";
import type { Student } from "../types/student";
import type { Faculdade } from "../types/faculdade";
import { toast } from "sonner";
import {
  ArrowLeft,
  User,
  Phone,
  MapPin,
  Building,
  Hash,
  Clock,
  Save,
} from "lucide-react";

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

  const [listaFaculdades, setListaFaculdades] = useState<Faculdade[]>([]);
  const [faculdadeId, setFaculdadeId] = useState<string>("");
  const [turno, setTurno] = useState(
    alunoEditando ? alunoEditando.turno : "MANHA",
  );
  const [ordemRota, setOrdemRota] = useState(alunoEditando?.ordemRota || "");
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    api
      .get("/faculdades")
      .then((resposta) => {
        const faculdadesDoBanco = resposta.data;
        setListaFaculdades(faculdadesDoBanco);

        if (alunoEditando && alunoEditando.faculdade) {
          const faculdadeEncontrada = faculdadesDoBanco.find(
            (f: Faculdade) => f.nome === alunoEditando.faculdade,
          );
          if (faculdadeEncontrada)
            setFaculdadeId(faculdadeEncontrada.id.toString());
        }
      })
      .catch(() => toast.error("Erro ao carregar a lista de faculdades."));
  }, [alunoEditando]);

  function salvarPassageiro() {
    if (!nome.trim()) {
      toast.warning("O nome do passageiro é obrigatório.");
      return;
    }

    setSalvando(true);
    const dadosPassageiro = {
      nome,
      telefone,
      endereco,
      bairro,
      faculdade: faculdadeId ? { id: Number(faculdadeId) } : null,
      turno,
      ordemRota: Number(ordemRota),
    };

    const requisicao = alunoEditando
      ? api.put(`/students/${alunoEditando.id}`, dadosPassageiro)
      : api.post("/students", dadosPassageiro);

    requisicao
      .then(() => {
        toast.success(
          `Passageiro ${alunoEditando ? "editado" : "salvo"} com sucesso!`,
        );
        aoVoltar();
      })
      .catch(() => {
        toast.error("Erro ao salvar os dados.");
        setSalvando(false);
      });
  }

  return (
    <div className="font-sans animate-in fade-in slide-in-from-bottom-4 duration-300">
      <button
        className="flex items-center gap-2 text-gray-500 font-bold mb-6 hover:text-gray-800 transition"
        onClick={aoVoltar}
      >
        <ArrowLeft size={20} /> Voltar
      </button>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-5">
        <h2 className="text-xl font-black text-gray-800 border-b border-gray-100 pb-4">
          {alunoEditando ? "Editar Passageiro" : "Novo Passageiro"}
        </h2>

        <div className="space-y-4">
          <div>
            <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-1.5">
              <User size={16} className="text-blue-500" /> Nome Completo
            </label>
            <input
              type="text"
              className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-1.5">
              <Phone size={16} className="text-green-500" /> Telefone
            </label>
            <input
              type="number"
              className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition"
              value={telefone}
              onChange={(e) => setTelefone(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-1.5">
                <MapPin size={16} className="text-red-500" /> Endereço
              </label>
              <input
                type="text"
                className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition"
                value={endereco}
                onChange={(e) => setEndereco(e.target.value)}
              />
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-1.5">
                Bairro
              </label>
              <input
                type="text"
                className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition"
                value={bairro}
                onChange={(e) => setBairro(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-1.5">
              <Building size={16} className="text-purple-500" /> Faculdade
            </label>
            <select
              className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition"
              value={faculdadeId}
              onChange={(e) => setFaculdadeId(e.target.value)}
            >
              <option value="" disabled>
                Selecione uma faculdade...
              </option>
              {listaFaculdades.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.nome}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-1.5">
                <Hash size={16} className="text-gray-400" /> Posição
              </label>
              <input
                type="number"
                placeholder="Ex: 1"
                className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition"
                value={ordemRota}
                onChange={(e) => setOrdemRota(e.target.value)}
              />
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-1.5">
                <Clock size={16} className="text-orange-500" /> Turno
              </label>
              <select
                className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition"
                value={turno}
                onChange={(e) => setTurno(e.target.value)}
              >
                <option value="MANHA">Manhã</option>
                <option value="TARDE">Tarde</option>
                <option value="NOITE">Noite</option>
              </select>
            </div>
          </div>
        </div>

        <button
          disabled={salvando}
          className="w-full flex justify-center items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg py-4 rounded-xl mt-2 shadow-md transition active:scale-[0.98] disabled:opacity-70"
          onClick={salvarPassageiro}
        >
          {salvando ? (
            "Salvando..."
          ) : (
            <>
              <Save size={20} /> Salvar Passageiro
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export default CadastroPassageiro;
