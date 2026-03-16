import { useState, useEffect } from "react";
import { api } from "../services/api";
import type { ChamadaItem } from "../types/chamada";
import type { Student } from "../types/student";
import { buscarMemoriaFaculdade, salvarChamada } from "../types/chamadaStorage";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  Bus,
  ClipboardPaste,
  ArrowUp,
  ArrowDown,
  Trash2,
  Copy,
  AlertTriangle,
  RefreshCcw,
  Users,
  Building,
  Play,
} from "lucide-react";

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
    api
      .get(`http://localhost:8080/students`)
      .then((resposta) => {
        setAlunosBanco(resposta.data);
      })
      .catch(() => {
        toast.error(
          "Erro ao conectar com o servidor. Verifique se o back-end está rodando.",
        );
      });
  }

  function copiarLista(routeList: any[]) {
    if (!routeList || routeList.length === 0) {
      toast.warning("Não há nada na rota para copiar.");
      return "";
    } else {
      const linhas = routeList.map(
        (student, index) => `${index + 1} - ${student.nome}`,
      );
      toast.success("Lista copiada para a área de transferência!");
      return linhas.join("\n");
    }
  }

  function iniciarViagem() {
    if (routeList.length === 0 && returnOnlyList.length === 0) {
      toast.error("Gere uma rota antes de iniciar a viagem.");
      return;
    }
    const listaUnificada = chamadaMapper(routeList, returnOnlyList);
    const dataHoje = new Date().toISOString().split("T")[0];
    salvarChamada(dataHoje, listaUnificada);
    toast.success("Viagem iniciada com sucesso!");
    navigate("/chamada");
  }

  function processarLista() {
    if (!textoWhatsapp.trim()) {
      toast.warning("Cole a lista do WhatsApp primeiro.");
      return;
    }

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

      if (isAttention) {
        currentUnknown.push(cleanLine);
        return;
      }

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
        candidatos.sort((a, b) => {
          const nA = normalize(a.nome);
          const nB = normalize(b.nome);

          if (nA === normalizedLine) return -1;
          if (nB === normalizedLine) return 1;

          const aEstaNaLinha = normalizedLine.includes(nA);
          const bEstaNaLinha = normalizedLine.includes(nB);

          if (aEstaNaLinha && bEstaNaLinha) return nB.length - nA.length;
          if (aEstaNaLinha) return -1;
          if (bEstaNaLinha) return 1;

          return nA.length - nB.length;
        });

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
            embarcou: false,
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
    toast.success("Lista processada com sucesso!");
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
    <div className="min-h-screen bg-gray-50 p-4 md:max-w-md md:mx-auto flex flex-col gap-6 font-sans">
      {/* HEADER & ATALHOS */}
      <div className="flex flex-col gap-4 mt-4">
        <div className="flex items-center justify-center gap-2 text-blue-700">
          <Bus size={32} strokeWidth={2.5} />
          <h1 className="text-3xl font-black tracking-tight">MinhaRota</h1>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => navigate("/gestaoAlunos")}
            className="flex items-center justify-center gap-2 bg-white border border-gray-200 p-3 rounded-xl shadow-sm hover:bg-gray-50 transition text-gray-700 font-semibold text-sm"
          >
            <Users size={18} className="text-blue-500" /> Alunos
          </button>
          <button
            onClick={() => navigate("/gestaoFaculdades")}
            className="flex items-center justify-center gap-2 bg-white border border-gray-200 p-3 rounded-xl shadow-sm hover:bg-gray-50 transition text-gray-700 font-semibold text-sm"
          >
            <Building size={18} className="text-purple-500" /> Faculdades
          </button>
        </div>
      </div>

      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
        <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-3">
          <ClipboardPaste size={18} className="text-gray-400" />
          Cole a lista do WhatsApp:
        </label>
        <textarea
          className="w-full h-40 p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none resize-none transition"
          placeholder="Ex:&#10;1. Joãozinho&#10;2. Maria&#10;3. Pedrinho"
          value={textoWhatsapp}
          onChange={(e) => setTextoWhatsapp(e.target.value)}
        ></textarea>

        <button
          onClick={processarLista}
          className="w-full flex justify-center items-center gap-2 mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl shadow-md transition active:scale-[0.98]"
        >
          <RefreshCcw size={20} />
          Gerar Rota do Dia
        </button>
      </div>

      {(routeList.length > 0 ||
        unknownList.length > 0 ||
        returnOnlyList.length > 0) && (
        <div className="flex flex-col gap-6 mb-8">
          {/* 1. LISTA PRINCIPAL */}
          {routeList.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="bg-blue-50 p-4 border-b border-blue-100 flex items-center justify-between">
                <h2 className="font-bold text-blue-800 flex items-center gap-2">
                  <Bus size={20} /> Rota Principal
                </h2>
                <span className="bg-blue-200 text-blue-800 text-xs font-black px-2 py-1 rounded-full">
                  {routeList.length}
                </span>
              </div>

              <div className="flex flex-col p-2 gap-2">
                {routeList.map((item, index) => (
                  <div
                    key={item.id || index}
                    className={`p-3 rounded-xl border flex justify-between items-center transition-all duration-300 ${item.embarcou ? "bg-green-50 border-green-200 opacity-60" : "bg-white border-gray-200 shadow-sm"}`}
                  >
                    <div
                      className="flex items-center gap-3 flex-1 cursor-pointer"
                      onClick={() => toggleEmbarque(index)}
                    >
                      <button
                        className={`w-10 h-10 flex items-center justify-center rounded-full font-bold text-sm transition-colors ${item.embarcou ? "bg-green-500 text-white shadow-inner" : "bg-blue-50 text-blue-600 border border-blue-100"}`}
                      >
                        {item.embarcou ? "✓" : index + 1}
                      </button>
                      <div>
                        <p
                          className={`font-bold text-gray-800 transition-all ${item.embarcou ? "line-through text-gray-400" : ""}`}
                        >
                          {item.nome}
                        </p>
                        <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mt-0.5">
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
                          className="bg-gray-100 hover:bg-gray-200 text-gray-500 rounded-lg p-1.5 disabled:opacity-30 transition"
                        >
                          <ArrowUp size={16} strokeWidth={3} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            moveItem(index, "down");
                          }}
                          disabled={index === routeList.length - 1}
                          className="bg-gray-100 hover:bg-gray-200 text-gray-500 rounded-lg p-1.5 disabled:opacity-30 transition"
                        >
                          <ArrowDown size={16} strokeWidth={3} />
                        </button>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFromRoute(index);
                        }}
                        className="bg-red-50 hover:bg-red-100 text-red-500 rounded-lg p-1.5 flex items-center justify-center transition mt-1"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}

                <div className="grid grid-cols-1 gap-2 mt-2 px-1">
                  <button
                    className="flex justify-center items-center gap-2 bg-gray-800 hover:bg-gray-900 text-white font-bold py-3.5 rounded-xl shadow-md transition active:scale-[0.98]"
                    onClick={() =>
                      navigator.clipboard.writeText(copiarLista(routeList))
                    }
                  >
                    <Copy size={18} /> Copiar Lista
                  </button>
                  <button
                    className="flex justify-center items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold py-3.5 rounded-xl shadow-md transition active:scale-[0.98]"
                    onClick={iniciarViagem}
                  >
                    <Play size={18} className="fill-white" /> Iniciar Chamada
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 2. ATENÇÃO / MANUAIS */}
          {unknownList.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="bg-orange-50 p-4 border-b border-orange-100 flex items-center justify-between">
                <h2 className="font-bold text-orange-800 flex items-center gap-2">
                  <AlertTriangle size={20} /> Revisão Manual
                </h2>
                <span className="bg-orange-200 text-orange-800 text-xs font-black px-2 py-1 rounded-full">
                  {unknownList.length}
                </span>
              </div>
              <ul className="flex flex-col p-2 gap-1">
                {unknownList.map((nome, idx) => (
                  <li
                    key={idx}
                    className="flex items-center justify-between p-3 border-b border-gray-100 last:border-0 hover:bg-gray-50 rounded-lg transition"
                  >
                    <div className="flex items-center gap-3 text-gray-700 font-semibold text-sm">
                      <div className="w-2 h-2 rounded-full bg-orange-400"></div>
                      {nome}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => promoteToRoute(idx)}
                        className="bg-green-50 text-green-600 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-green-100 transition"
                      >
                        + Adicionar
                      </button>
                      <button
                        onClick={() => removeUnknown(idx)}
                        className="bg-red-50 text-red-500 p-1.5 rounded-lg hover:bg-red-100 transition"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* 3. SÓ RETORNO */}
          {returnOnlyList.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="bg-emerald-50 p-4 border-b border-emerald-100 flex items-center justify-between">
                <h2 className="font-bold text-emerald-800 flex items-center gap-2">
                  <RefreshCcw size={20} /> Somente Retorno
                </h2>
                <span className="bg-emerald-200 text-emerald-800 text-xs font-black px-2 py-1 rounded-full">
                  {returnOnlyList.length}
                </span>
              </div>
              <ul className="flex flex-col p-2 gap-1">
                {returnOnlyList.map((nome, idx) => (
                  <li
                    key={idx}
                    className="flex items-center gap-3 p-3 text-gray-700 font-semibold text-sm border-b border-gray-100 last:border-0"
                  >
                    <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
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
