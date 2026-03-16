import { useState, useEffect, useRef } from "react";
import {
  carregarChamada,
  salvarChamada,
  salvarMemoriaFaculdade,
} from "../types/chamadaStorage";
import type { ChamadaItem } from "../types/chamada";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";
import type { Faculdade } from "../types/faculdade";
import { toast } from "sonner";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Circle,
  Pencil,
  Trash2,
  XCircle,
} from "lucide-react";

function ListaChamada() {
  const navigate = useNavigate();
  const [items, setItems] = useState<ChamadaItem[]>([]);
  const [currentCarousels, setCurrentCarousels] = useState<string[]>([]);
  const [editandoAlunoId, setEditandoAlunoId] = useState<
    number | string | null
  >(null);
  const [listaFaculdades, setListaFaculdades] = useState<Faculdade[]>([]);

  const carouselRef = useRef<HTMLDivElement>(null);
  const dataHoje = new Date().toISOString().split("T")[0];

  useEffect(() => {
    const listaSalva = carregarChamada(dataHoje);
    setItems(listaSalva);
  }, []);

  useEffect(() => {
    api
      .get("/faculdades")
      .then((resposta) => setListaFaculdades(resposta.data))
      .catch(() =>
        toast.error("Não foi possível carregar as faculdades oficiais."),
      );
  }, []);

  useEffect(() => {
    const faculdades = new Set<string>();
    let semFaculdade = false;

    items.forEach((item) => {
      if (item.faculdade && item.faculdade !== "Adicionado Manualmente") {
        faculdades.add(item.faculdade);
      } else {
        semFaculdade = true;
      }
    });

    const arrayFaculdades = Array.from(faculdades);
    arrayFaculdades.sort();
    if (semFaculdade) arrayFaculdades.push("Sem Faculdade");

    setCurrentCarousels(arrayFaculdades);
  }, [items]);

  const toggleEmbarque = (idDoAluno: number | string) => {
    const novaLista = items.map((aluno) => {
      if (aluno.id === idDoAluno)
        return { ...aluno, embarcado: !aluno.embarcado };
      return aluno;
    });
    setItems(novaLista);
    salvarChamada(dataHoje, novaLista);
  };

  const atribuirFaculdade = (
    idAluno: number | string,
    nomeAluno: string,
    novaFaculdade: string,
  ) => {
    const novaLista = items.map((aluno) => {
      if (aluno.id === idAluno) return { ...aluno, faculdade: novaFaculdade };
      return aluno;
    });
    setItems(novaLista);
    salvarChamada(dataHoje, novaLista);
    salvarMemoriaFaculdade(nomeAluno, novaFaculdade);
    toast.success(`${nomeAluno} movido(a) para ${novaFaculdade}`);
  };

  const rolarCarrossel = (direcao: "esquerda" | "direita") => {
    if (carouselRef.current) {
      const larguraDoSlide = carouselRef.current.clientWidth;
      const scrollAtual = carouselRef.current.scrollLeft;
      const destino =
        direcao === "direita"
          ? scrollAtual + larguraDoSlide
          : scrollAtual - larguraDoSlide;
      carouselRef.current.scrollTo({ left: destino, behavior: "smooth" });
    }
  };

  function excluirAluno(idDoAluno: number | string) {
    if (window.confirm("Deseja remover este aluno da rota de hoje?")) {
      const novaLista = items.filter((item) => item.id !== idDoAluno);
      setItems(novaLista);
      salvarChamada(dataHoje, novaLista);
      toast.success("Aluno removido da lista atual.");
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <div className="bg-blue-600 text-white p-4 pt-8 flex items-center justify-between shadow-md">
        <button
          onClick={() => navigate("/")}
          className="p-2 hover:bg-blue-700 rounded-lg transition"
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-black text-center flex-1 tracking-wide">
          Chamada ({dataHoje.split("-").reverse().join("/")})
        </h1>
        <div className="w-10"></div>
      </div>

      {items.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-gray-500">
          <p className="text-lg">Nenhuma lista encontrada para hoje.</p>
          <button
            onClick={() => navigate("/")}
            className="mt-4 text-blue-600 underline font-bold"
          >
            Voltar e Gerar Rota
          </button>
        </div>
      ) : (
        <div className="flex-1 flex flex-col relative w-full max-w-md mx-auto mt-6">
          <div className="flex justify-between items-center px-4 mb-3">
            <button
              onClick={() => rolarCarrossel("esquerda")}
              className="w-10 h-10 bg-white rounded-full shadow-sm border border-gray-100 flex items-center justify-center text-blue-600 hover:bg-blue-50 transition"
            >
              <ChevronLeft size={24} />
            </button>
            <span className="text-xs font-black tracking-widest uppercase text-gray-400">
              Deslize as Faculdades
            </span>
            <button
              onClick={() => rolarCarrossel("direita")}
              className="w-10 h-10 bg-white rounded-full shadow-sm border border-gray-100 flex items-center justify-center text-blue-600 hover:bg-blue-50 transition"
            >
              <ChevronRight size={24} />
            </button>
          </div>

          <div
            ref={carouselRef}
            className="flex overflow-x-auto snap-x snap-mandatory scroll-smooth pb-4 [&::-webkit-scrollbar]:hidden"
            style={{ scrollbarWidth: "none" }}
          >
            {currentCarousels.map((faculdadeNome, slideIndex) => {
              const alunosDestaFaculdade = items.filter(
                (item) =>
                  item.faculdade === faculdadeNome ||
                  ((!item.faculdade ||
                    item.faculdade === "Adicionado Manualmente") &&
                    faculdadeNome === "Sem Faculdade"),
              );

              return (
                <div
                  key={slideIndex}
                  className="min-w-full snap-center px-4 shrink-0"
                >
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col max-h-[50vh]">
                    <div className="bg-blue-50 p-4 border-b border-blue-100 text-center shrink-0">
                      <h2 className="text-xl font-black text-blue-900 uppercase tracking-wide">
                        {faculdadeNome}
                      </h2>
                      <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 bg-blue-100 px-3 py-1 rounded-full mt-2 inline-block">
                        {alunosDestaFaculdade.length} Passageiros
                      </span>
                    </div>

                    <div className="p-3 flex flex-col gap-2 overflow-y-auto">
                      {alunosDestaFaculdade.map((aluno, alunoIndex) => (
                        <div
                          key={aluno.id}
                          className={`flex flex-col gap-3 p-3.5 rounded-xl border transition-all duration-300 ${aluno.embarcado ? "bg-green-50 border-green-200 opacity-70" : "bg-white border-gray-100 shadow-sm"}`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-start gap-3 flex-1 overflow-hidden">
                              <span className="text-gray-300 font-black text-sm w-5 pt-0.5">
                                {alunoIndex + 1}.
                              </span>
                              <div className="flex-1 min-w-0">
                                <p
                                  className={`font-bold text-sm truncate ${aluno.embarcado ? "line-through text-gray-400" : "text-gray-800"}`}
                                >
                                  {aluno.nome}
                                </p>
                                <div className="flex items-center gap-2 mt-1.5">
                                  <span
                                    className={`text-[9px] uppercase font-black tracking-wider px-1.5 py-0.5 rounded ${aluno.origem === "rota" ? "bg-blue-100 text-blue-700" : aluno.origem === "retorno" ? "bg-emerald-100 text-emerald-700" : "bg-purple-100 text-purple-700"}`}
                                  >
                                    {aluno.origem}
                                  </span>
                                  <button
                                    onClick={() => setEditandoAlunoId(aluno.id)}
                                    className="text-gray-400 hover:text-blue-500 transition"
                                  >
                                    <Pencil size={14} />
                                  </button>
                                  <button
                                    onClick={() => excluirAluno(aluno.id)}
                                    className="text-gray-400 hover:text-red-500 transition"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              </div>
                            </div>
                            <button
                              onClick={() => toggleEmbarque(aluno.id)}
                              className="w-12 h-12 shrink-0 flex items-center justify-center transition-transform active:scale-90 ml-2"
                            >
                              {aluno.embarcado ? (
                                <CheckCircle2
                                  size={38}
                                  className="text-green-500 drop-shadow-sm"
                                  strokeWidth={2.5}
                                />
                              ) : (
                                <Circle
                                  size={38}
                                  className="text-gray-200 hover:text-gray-300 transition"
                                  strokeWidth={2}
                                />
                              )}
                            </button>
                          </div>

                          {(faculdadeNome === "Sem Faculdade" ||
                            faculdadeNome === "Adicionado Manualmente" ||
                            editandoAlunoId === aluno.id) && (
                            <div className="ml-8 mr-14 flex flex-col gap-2 pt-2 border-t border-dashed border-gray-200">
                              <select
                                className="w-full text-xs font-semibold bg-gray-50 border border-gray-200 text-gray-700 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-400"
                                defaultValue=""
                                onChange={(e) => {
                                  if (e.target.value) {
                                    atribuirFaculdade(
                                      aluno.id,
                                      aluno.nome,
                                      e.target.value,
                                    );
                                    setEditandoAlunoId(null);
                                  }
                                }}
                              >
                                <option value="" disabled>
                                  Mover para qual faculdade?
                                </option>
                                {listaFaculdades.map((f) => (
                                  <option key={f.id} value={f.nome}>
                                    {f.nome}
                                  </option>
                                ))}
                              </select>

                              {editandoAlunoId === aluno.id && (
                                <button
                                  onClick={() => setEditandoAlunoId(null)}
                                  className="flex items-center gap-1 text-[11px] text-gray-400 font-bold self-start hover:text-gray-600 transition"
                                >
                                  <XCircle size={12} /> Cancelar edição
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-4 px-4 pb-12">
            <div className="flex items-center justify-between border-b border-gray-200 pb-3 mb-4">
              <h2 className="text-lg font-black text-gray-800">Visão Geral</h2>
              <div className="bg-gray-100 px-3 py-1.5 rounded-full flex items-center gap-2">
                <span className="text-xs font-bold text-gray-500">
                  Embarcados:
                </span>
                <span className="text-sm font-black text-blue-600">
                  {items.filter((i) => i.embarcado).length} / {items.length}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              {items.map((aluno, index) => (
                <div
                  key={`geral-${aluno.id}`}
                  className={`flex items-center justify-between p-3.5 rounded-xl shadow-sm border transition-all ${aluno.embarcado ? "bg-gray-50 border-transparent opacity-60" : "bg-white border-gray-100"}`}
                >
                  <div>
                    <p
                      className={`font-bold text-sm truncate max-w-50 ${aluno.embarcado ? "line-through text-gray-400" : "text-gray-800"}`}
                    >
                      {index + 1}. {aluno.nome}
                    </p>
                    <p className="text-[10px] uppercase font-bold tracking-wider text-gray-400 mt-1">
                      {aluno.faculdade || "Sem Faculdade"}
                    </p>
                  </div>
                  <div>
                    {aluno.embarcado ? (
                      <span className="bg-green-100 text-green-700 text-[10px] uppercase font-black tracking-widest px-2.5 py-1 rounded-md">
                        Presente
                      </span>
                    ) : (
                      <span className="bg-yellow-100 text-yellow-700 text-[10px] uppercase font-black tracking-widest px-2.5 py-1 rounded-md animate-pulse">
                        Aguardando
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ListaChamada;
