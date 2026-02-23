import { useState, useEffect } from "react";
import axios from "axios";
import type { Student } from "../types/student";

function Home() {
  const [textoWhatsapp, setTextoWhatsapp] = useState("");
  const [alunosBanco, setAlunosBanco] = useState<Student[]>([]);
  const [routeList, setRouteList] = useState<any[]>([]);
  const [unknownList, setUnknownList] = useState<string[]>([]);
  const [returnOnlyList, setReturnOnlyList] = useState<string[]>([]);

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

  function processarLista() {
    // Trava de segurança: se estiver vazio, nem começa
    if (!textoWhatsapp.trim()) return;

    console.log("1. O motorista colou isso:\n", textoWhatsapp);
    console.log("2. Alunos que o Axios puxou do banco:", alunosBanco);

    const currentRoute: any[] = [];
    const currentUnknown: string[] = [];
    const currentReturn: string[] = [];
    const processedIds = new Set<number>();

    // Corta o texto a cada "Enter" ou vírgula
    const lines = textoWhatsapp.split(/[\n,]/);

    lines.forEach((line) => {
      let cleanLine = line.replace(/^\d+[\W_]*/, "").trim();
      if (!cleanLine) return;

      const normalizedLine = normalize(cleanLine);
      const isReturnOnly =
        normalizedLine.includes("so volta") ||
        normalizedLine.includes("so retorno");

      // Tenta achar no banco (Com trava anti-erro caso o nome seja nulo no Java)
      let matchedStudent = alunosBanco.find((aluno) => {
        if (!aluno.nome) return false; // Se o cara não tem nome salvo, ignora
        return (
          normalize(aluno.nome).includes(normalizedLine) ||
          normalizedLine.includes(normalize(aluno.nome))
        );
      });

      if (matchedStudent) {
        if (processedIds.has(matchedStudent.id)) return; // Evita duplicados

        if (isReturnOnly) {
          currentReturn.push(
            `${matchedStudent.nome} (${matchedStudent.faculdade})`,
          );
        } else {
          currentRoute.push({
            id: matchedStudent.id,
            nome: matchedStudent.nome,
            faculdade: matchedStudent.faculdade,
            // Como defaultOrder ainda não existe no Java, mandamos 0 provisoriamente
            originalIndex: 0,
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
    }); // <-- Aqui acaba o forEach

    // Salva nos estados do React
    setRouteList(currentRoute);
    setUnknownList(currentUnknown);
    setReturnOnlyList(currentReturn);

    // Os radares finais que vão nos contar o final da história
    console.log("3. Encontrados na base:", currentRoute);
    console.log("4. Não identificados:", currentUnknown);
  }

  useEffect(() => {
    preencherLista();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:max-w-md md:mx-auto flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-gray-800 text-center mt-4">
        Roteiro do Dia
      </h1>

      {/* A Caixa de Cola do WhatsApp */}
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
          className="w-full mt-3 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg shadow transition"
        >
          Gerar Rota
        </button>
      </div>

      {/* Aqui embaixo vão aparecer os Cards ordenados depois */}
      <div>
        <h2 className="font-bold text-gray-600 mb-3 border-b pb-2">
          Passageiros de Hoje:
        </h2>
        {/* Vamos colocar o .map() aqui no próximo passo */}
      </div>
    </div>
  );
}

export default Home;
