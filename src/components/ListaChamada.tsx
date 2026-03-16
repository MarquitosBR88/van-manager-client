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
      .catch((erro) => console.error("Erro ao buscar faculdades:", erro));
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
    if (semFaculdade) {
      arrayFaculdades.push("Sem Faculdade");
    }

    setCurrentCarousels(arrayFaculdades);
  }, [items]);

  const toggleEmbarque = (idDoAluno: number | string) => {
    const novaLista = items.map((aluno) => {
      if (aluno.id === idDoAluno) {
        return { ...aluno, embarcado: !aluno.embarcado };
      }
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
      if (aluno.id === idAluno) {
        return { ...aluno, faculdade: novaFaculdade };
      }
      return aluno;
    });
    setItems(novaLista);
    salvarChamada(dataHoje, novaLista);
    salvarMemoriaFaculdade(nomeAluno, novaFaculdade);
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
    let confirm = window.confirm("Deseja excluir esse aluno?");
    if (confirm) {
      const novaLista = items.filter((item) => item.id !== idDoAluno);
      setItems(novaLista);
      salvarChamada(dataHoje, novaLista);
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* CABEÇALHO */}
      <div className="bg-blue-600 text-white p-4 flex items-center justify-between shadow-md">
        <button
          onClick={() => navigate("/")}
          className="font-bold text-xl px-2"
        >
          ←
        </button>
        <h1 className="text-xl font-bold text-center flex-1">
          Chamada ({dataHoje})
        </h1>
        <div className="w-8"></div>
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
        <div className="flex-1 flex flex-col relative w-full max-w-md mx-auto mt-4">
          <div className="flex justify-between items-center px-4 mb-2">
            <button
              onClick={() => rolarCarrossel("esquerda")}
              className="w-10 h-10 bg-white rounded-full shadow flex items-center justify-center text-gray-600 hover:bg-gray-200"
            >
              ◀
            </button>
            <span className="text-sm font-bold text-gray-500">
              Deslize as Faculdades
            </span>
            <button
              onClick={() => rolarCarrossel("direita")}
              className="w-10 h-10 bg-white rounded-full shadow flex items-center justify-center text-gray-600 hover:bg-gray-200"
            >
              ▶
            </button>
          </div>

          <div
            ref={carouselRef}
            className="flex overflow-x-auto snap-x snap-mandatory scroll-smooth pb-8 [&::-webkit-scrollbar]:hidden"
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
                  <div className="bg-white rounded-xl shadow-lg border-t-4 border-blue-500 overflow-hidden">
                    <div className="bg-gray-50 p-4 border-b text-center">
                      <h2 className="text-xl font-black text-gray-800 uppercase tracking-wide">
                        {faculdadeNome}
                      </h2>
                      <span className="text-xs font-bold text-blue-600 bg-blue-100 px-2 py-1 rounded-full mt-2 inline-block">
                        {alunosDestaFaculdade.length} Passageiros
                      </span>
                    </div>

                    <div className="p-2 flex flex-col gap-2 max-h-[60vh] overflow-y-auto">
                      {alunosDestaFaculdade.map((aluno, alunoIndex) => (
                        <div
                          key={aluno.id}
                          className={`flex flex-col gap-3 p-3 rounded-lg border transition-all ${aluno.embarcado ? "bg-green-50 border-green-200 opacity-70" : "bg-white border-gray-200"}`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <span className="text-gray-400 font-bold text-sm w-5">
                                {alunoIndex + 1}.
                              </span>
                              <div>
                                <p
                                  className={`font-bold text-sm ${aluno.embarcado ? "line-through text-gray-500" : "text-gray-800"}`}
                                >
                                  {aluno.nome}
                                </p>
                                <span
                                  className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${aluno.origem === "rota" ? "bg-blue-100 text-blue-700" : aluno.origem === "retorno" ? "bg-orange-100 text-orange-700" : "bg-purple-100 text-purple-700"}`}
                                >
                                  {aluno.origem}
                                </span>
                                <button
                                  onClick={() => setEditandoAlunoId(aluno.id)}
                                >
                                  Editar
                                </button>
                                <button onClick={() => excluirAluno(aluno.id)}>
                                  Deletar
                                </button>
                              </div>
                            </div>
                            <button
                              onClick={() => toggleEmbarque(aluno.id)}
                              className={`w-12 h-12 rounded-full shrink-0 flex items-center justify-center shadow-sm transition-transform active:scale-90 ${aluno.embarcado ? "bg-green-500 text-white shadow-inner" : "bg-gray-100 border-2 border-gray-300 text-gray-400"}`}
                            >
                              {aluno.embarcado ? "✓" : ""}
                            </button>
                          </div>

                          {(faculdadeNome === "Sem Faculdade" ||
                            faculdadeNome === "Adicionado Manualmente" ||
                            editandoAlunoId === aluno.id) && (
                            <div className="ml-8 mr-14 flex flex-col gap-2">
                              <select
                                className="w-full text-sm border border-gray-300 text-gray-700 rounded-md p-2 outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                                defaultValue=""
                                onChange={(e) => {
                                  const valorSelecionado = e.target.value;
                                  if (valorSelecionado) {
                                    atribuirFaculdade(
                                      aluno.id,
                                      aluno.nome,
                                      valorSelecionado,
                                    );
                                    setEditandoAlunoId(null);
                                  }
                                }}
                              >
                                <option value="" disabled>
                                  Selecione a faculdade...
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
                                  className="text-xs text-red-500 font-bold self-start cursor-pointer hover:underline"
                                >
                                  Cancelar edição
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
          {/* LISTA GERAL (SOMENTE LEITURA) */}
          <div className="mt-1 px-4 pb-8">
            {/* Cabeçalho com Contador */}
            <div className="flex items-center justify-between border-b-2 border-gray-300 pb-2 mb-4">
              <h2 className="text-xl font-bold text-gray-800">Visão Geral</h2>
              <span className="text-sm font-black bg-blue-100 text-blue-800 px-3 py-1 rounded-full shadow-sm">
                {items.filter((i) => i.embarcado).length} / {items.length}{" "}
                Embarcados
              </span>
            </div>

            {/* Lista Corrida */}
            <div className="flex flex-col gap-2">
              {items.map((aluno, index) => (
                <div
                  key={`geral-${aluno.id}`}
                  className={`flex items-center justify-between p-3 rounded-lg border-l-4 shadow-sm transition-all ${
                    aluno.embarcado
                      ? "bg-green-50 border-green-500 opacity-60"
                      : "bg-white border-yellow-400"
                  }`}
                >
                  {/* Info do Aluno */}
                  <div>
                    <p
                      className={`font-bold text-sm ${aluno.embarcado ? "line-through text-gray-500" : "text-gray-800"}`}
                    >
                      {index + 1}. {aluno.nome}
                    </p>
                    <p className="text-xs text-gray-500 font-semibold mt-0.5">
                      {aluno.faculdade || "Sem Faculdade"} •{" "}
                      <span className="uppercase">{aluno.origem}</span>
                    </p>
                  </div>

                  {/* Badges de Status (Sem botão clicável) */}
                  <div>
                    {aluno.embarcado ? (
                      <span className="bg-green-500 text-white text-[10px] uppercase font-bold px-2 py-1 rounded">
                        Presente
                      </span>
                    ) : (
                      <span className="bg-yellow-500 text-white text-[10px] uppercase font-bold px-2 py-1 rounded animate-pulse">
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
