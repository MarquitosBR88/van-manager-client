import { useState, useEffect } from "react";
import axios from "axios";
import type { ChamadaItem } from "../types/chamada";
import type { Student } from "../types/student";
import { buscarMemoriaFaculdade } from "../types/chamadaStorage";
import { salvarChamada } from "../types/chamadaStorage";
import { useNavigate } from "react-router-dom";

function Home() {
  const [textoWhatsapp, setTextoWhatsapp] = useState("");
  const [alunosBanco, setAlunosBanco] = useState<Student[]>([]);
  const [routeList, setRouteList] = useState<any[]>([]);
  const [unknownList, setUnknownList] = useState<string[]>([]);
  const [returnOnlyList, setReturnOnlyList] = useState<string[]>([]);

  const navigate = useNavigate();

  function chamadaMapper(
    routeList: any[],
    returnOnlyList: any[],
  ): ChamadaItem[] {
    const listaFinal: ChamadaItem[] = [];

    routeList.forEach((route) => {
      listaFinal.push({
        id: route.id,
        nome: route.nome,
        faculdade: route.faculdade,
        origem: "rota",
        embarcado: false,
      });
    });

    returnOnlyList.forEach((nome, index) => {
      const gerarId = "retorno-" + Date.now() + "-" + index;
      const alunoSalvo = buscarMemoriaFaculdade(nome);

      listaFinal.push({
        id: gerarId,
        nome: nome,
        faculdade: alunoSalvo || undefined,
        origem: "retorno",
        embarcado: false,
      });
    });

    return listaFinal;
  }

  const normalize = (text: string) =>
    text
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();

  function preencherLista() {
    axios
      .get(`http://localhost:8080/students`)
      .then((resposta) => {
        setAlunosBanco(resposta.data);
      })
      .catch((erro) => {
        console.error("Algo de errado aconteceu: ", erro);
      });
  }

  function copiarLista(routeList: any[]) {
    if (!routeList || routeList.length === 0) {
      alert("Nada para copiar.");
      return "";
    } else {
      const linhas = routeList.map(
        (student, index) => index + 1 + "-" + student.nome,
      );
      return linhas.join("\n");
    }
  }

  function iniciarViagem() {
    const listaUnificada = chamadaMapper(routeList, returnOnlyList);
    const dataHoje = new Date().toISOString().split("T")[0];
    salvarChamada(dataHoje, listaUnificada);
    navigate("/chamada");
  }

  function processarLista() {
    if (!textoWhatsapp.trim()) return;

    const currentRoute: any[] = [];
    const currentUnknown: string[] = [];
    const currentReturn: string[] = [];
    const processedIds = new Set<number>();

    const lines = textoWhatsapp.split(/[\n,]/);

    lines.forEach((line) => {
      let cleanLine = line.replace(/^\d+[\W_]*/, "").trim();
      if (!cleanLine) return;

      const normalizedLine = normalize(cleanLine);
      const isReturnOnly =
        normalizedLine.includes("so volta") ||
        normalizedLine.includes("so retorno");

      const parenthesesMatch = cleanLine.match(/\(([^)]+)\)/);
      let isAttention = false;

      if (parenthesesMatch) {
        const contentInside = normalize(parenthesesMatch[1]);
        if (
          !contentInside.includes("uniube") &&
          !contentInside.includes("so volta") &&
          !contentInside.includes("so retorno")
        ) {
          isAttention = true;
        }
      }

      // Se requer atenção (tem parênteses estranhos), vai pra lista de baixo para análise manual
      if (isAttention) {
        currentUnknown.push(cleanLine);
        return;
      }

      // 1. Acha TODOS os candidatos que combinam
      let candidatos = alunosBanco.filter((aluno) => {
        if (!aluno.nome) return false;
        const nDb = normalize(aluno.nome);
        return (
          nDb === normalizedLine ||
          nDb.includes(normalizedLine) ||
          normalizedLine.includes(nDb)
        );
      });

      let matchedStudent = undefined;

      if (candidatos.length > 0) {
        // 2. O Desempate: quem é o aluno certo?
        candidatos.sort((a, b) => {
          const nA = normalize(a.nome);
          const nB = normalize(b.nome);

          // Regra 1: Match 100% perfeito ganha de todo mundo
          if (nA === normalizedLine) return -1;
          if (nB === normalizedLine) return 1;

          // Regra 2: O cara colou "Maria Eduarda Silva (so volta)"
          // Se achou as duas Marias dentro do texto, a MAIOR (que engloba o Silva) tem prioridade
          const aEstaNaLinha = normalizedLine.includes(nA);
          const bEstaNaLinha = normalizedLine.includes(nB);

          if (aEstaNaLinha && bEstaNaLinha) return nB.length - nA.length;
          if (aEstaNaLinha) return -1;
          if (bEstaNaLinha) return 1;

          // Regra 3: O cara colou só "Maria Eduarda"
          // O banco achou as duas. A MENOR tem prioridade, pra Silva não entrar no lugar dela.
          return nA.length - nB.length;
        });

        // O verdadeiro campeão senta na cadeira
        matchedStudent = candidatos[0];
      }

      if (matchedStudent) {
        if (processedIds.has(matchedStudent.id)) return;

        if (isReturnOnly) {
          currentReturn.push(
            `${matchedStudent.nome} (${matchedStudent.faculdade})`,
          );
        } else {
          currentRoute.push({
            id: matchedStudent.id,
            nome: matchedStudent.nome,
            faculdade: matchedStudent.faculdade,
            originalIndex: matchedStudent.ordemRota,
            embarcou: false, // <-- Adicionado para o Check-in não falhar
          });
          processedIds.add(matchedStudent.id);
        }
      } else {
        if (isReturnOnly) {
          currentReturn.push(cleanLine);
        } else {
          currentUnknown.push(cleanLine);
        }
      }
    });

    currentRoute.sort((a, b) => {
      const ordemA = a.originalIndex || 999;
      const ordemB = b.originalIndex || 999;
      return ordemA - ordemB;
    });

    setRouteList(currentRoute);
    setUnknownList(currentUnknown);
    setReturnOnlyList(currentReturn);
  }

  const removeFromRoute = (index: number) => {
    setRouteList((prev) => prev.filter((_, i) => i !== index));
  };

  const moveItem = (index: number, direction: "up" | "down") => {
    const newList = [...routeList];
    if (direction === "up" && index > 0) {
      [newList[index - 1], newList[index]] = [
        newList[index],
        newList[index - 1],
      ];
    } else if (direction === "down" && index < newList.length - 1) {
      [newList[index + 1], newList[index]] = [
        newList[index],
        newList[index + 1],
      ];
    }
    setRouteList(newList);
  };

  const toggleEmbarque = (index: number) => {
    const newList = [...routeList];
    newList[index].embarcou = !newList[index].embarcou;
    setRouteList(newList);
  };

  const removeUnknown = (index: number) => {
    setUnknownList((prev) => prev.filter((_, i) => i !== index));
  };

  const promoteToRoute = (index: number) => {
    const rawName = unknownList[index];
    const tempItem = {
      id: `temp-${Date.now()}`,
      nome: rawName,
      faculdade: "Adicionado Manualmente",
      originalIndex: 999,
      embarcou: false,
    };
    setUnknownList((prev) => prev.filter((_, i) => i !== index));
    setRouteList((prev) => [...prev, tempItem]);
  };

  useEffect(() => {
    preencherLista();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:max-w-md md:mx-auto flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-gray-800 text-center mt-4">
        Roteiro do Dia
      </h1>

      <div className="bg-white p-4 rounded-xl shadow-md">
        <label className="block text-sm font-bold text-gray-700 mb-2">
          Cole a lista do WhatsApp aqui:
        </label>
        <textarea
          className="w-full h-40 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
          placeholder="Ex:&#10;1. Joãozinho&#10;2. Maria&#10;3. Pedrinho"
          value={textoWhatsapp}
          onChange={(e) => setTextoWhatsapp(e.target.value)}
        ></textarea>

        <button
          onClick={processarLista}
          className="w-full mt-3 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg shadow transition cursor-pointer"
        >
          Gerar Rota
        </button>
      </div>

      {(routeList.length > 0 ||
        unknownList.length > 0 ||
        returnOnlyList.length > 0) && (
        <div className="flex flex-col gap-4 mb-8">
          {/* 1. LISTA PRINCIPAL */}
          {routeList.length > 0 && (
            <div>
              <h2 className="font-bold text-gray-700 mb-3 border-b-2 border-blue-500 pb-1">
                🚌 Rota Principal ({routeList.length})
              </h2>
              <div className="flex flex-col gap-2">
                {routeList.map((item, index) => (
                  <div
                    key={item.id || index}
                    className={`p-3 rounded-lg shadow border-l-4 flex justify-between items-center transition-colors duration-300 ${item.embarcou ? "bg-green-100 border-green-500 opacity-75" : "bg-white border-blue-500"}`}
                  >
                    <div
                      className="flex items-center gap-3 flex-1 cursor-pointer"
                      onClick={() => toggleEmbarque(index)}
                    >
                      <button
                        className={`w-8 h-8 flex items-center justify-center rounded-full font-bold text-lg shadow-sm transition-colors ${item.embarcou ? "bg-green-500 text-white" : "bg-blue-100 text-blue-700"}`}
                      >
                        {item.embarcou ? "✓" : index + 1}
                      </button>
                      <div>
                        <p
                          className={`font-bold text-gray-800 transition-all ${item.embarcou ? "line-through text-gray-500" : ""}`}
                        >
                          {item.nome}
                        </p>
                        <p className="text-xs text-gray-500">
                          {item.faculdade}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1 ml-2">
                      <div className="flex gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            moveItem(index, "up");
                          }}
                          disabled={index === 0}
                          className="bg-gray-100 hover:bg-gray-200 text-gray-600 rounded px-2 py-1 text-xs disabled:opacity-30"
                        >
                          ▲
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            moveItem(index, "down");
                          }}
                          disabled={index === routeList.length - 1}
                          className="bg-gray-100 hover:bg-gray-200 text-gray-600 rounded px-2 py-1 text-xs disabled:opacity-30"
                        >
                          ▼
                        </button>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFromRoute(index);
                        }}
                        className="bg-red-100 hover:bg-red-200 text-red-600 rounded px-2 py-1 text-xs w-full mt-1 font-bold"
                      >
                        Excluir
                      </button>
                    </div>
                  </div>
                ))}
                <button
                  className="w-full mt-3 bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg shadow transition cursor-pointer"
                  onClick={() => {
                    navigator.clipboard.writeText(copiarLista(routeList));
                  }}
                >
                  Copiar Lista
                </button>
                <button
                  className="w-full mt-3 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg shadow transition cursor-pointer"
                  onClick={iniciarViagem}
                >
                  Ir para Lista de Chamada
                </button>
              </div>
            </div>
          )}

          {/* 2. ATENÇÃO / MANUAIS */}
          {unknownList.length > 0 && (
            <div>
              <h2 className="font-bold text-gray-700 mb-3 border-b-2 border-orange-500 pb-1">
                ⚠️ Atenção / Manuais ({unknownList.length})
              </h2>
              <ul className="bg-white rounded-lg shadow p-3 flex flex-col gap-2">
                {unknownList.map((nome, idx) => (
                  <li
                    key={idx}
                    className="text-gray-700 font-medium text-sm flex items-center justify-between border-b pb-2 last:border-0 last:pb-0"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                      {nome}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => promoteToRoute(idx)}
                        className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold hover:bg-green-200"
                      >
                        + Rota
                      </button>
                      <button
                        onClick={() => removeUnknown(idx)}
                        className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-bold hover:bg-red-200"
                      >
                        X
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* 3. SÓ RETORNO */}
          {returnOnlyList.length > 0 && (
            <div>
              <h2 className="font-bold text-gray-700 mb-3 border-b-2 border-green-500 pb-1">
                🔄 Só Retorno ({returnOnlyList.length})
              </h2>
              <ul className="bg-white rounded-lg shadow p-3 flex flex-col gap-2">
                {returnOnlyList.map((nome, idx) => (
                  <li
                    key={idx}
                    className="text-gray-700 font-medium text-sm flex items-center gap-2"
                  >
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                    {nome}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Home;
