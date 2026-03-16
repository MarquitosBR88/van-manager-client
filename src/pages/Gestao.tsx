import { api } from "../services/api";
import type { Student } from "../types/student.ts";
import { useEffect, useState } from "react";
import CadastroPassageiro from "../components/CadastroPassageiro.tsx";
import { toast } from "sonner";
import {
  Search,
  UserPlus,
  Pencil,
  Trash2,
  GraduationCap,
  MapPin,
} from "lucide-react";

function Gestao() {
  const [students, setStudents] = useState<Student[]>([]);
  const [busca, setBusca] = useState("");
  const [exibirCadastro, setExibirCadastro] = useState(false);
  const [alunoEmEdicao, setAlunoEmEdicao] = useState<Student | null>(null);

  function buscarAlunos() {
    const endpoint =
      busca === "" ? "/students" : `/students/search/nome?nome=${busca}`;
    api
      .get(endpoint)
      .then((resposta) => setStudents(resposta.data))
      .catch(() => toast.error("Não foi possível carregar a lista de alunos."));
  }

  useEffect(() => {
    buscarAlunos();
  }, [busca]);

  function deletarAluno(id: number) {
    if (
      window.confirm(
        "Tem certeza que deseja excluir este aluno permanentemente?",
      )
    ) {
      api
        .delete(`/students/${id}`)
        .then(() => {
          setStudents(students.filter((student) => student.id !== id));
          toast.success("Aluno excluído com sucesso.");
        })
        .catch(() => toast.error("Erro ao excluir aluno."));
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:max-w-md md:mx-auto font-sans">
      {exibirCadastro ? (
        <CadastroPassageiro
          aoVoltar={() => {
            setExibirCadastro(false);
            buscarAlunos();
          }}
          alunoEditando={alunoEmEdicao}
        />
      ) : (
        <div className="flex flex-col gap-4 mt-2 mb-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-2xl font-black text-gray-800">Alunos</h1>
          </div>

          <button
            className="flex items-center justify-center gap-2 bg-blue-600 text-white font-bold p-3.5 rounded-xl shadow-md hover:bg-blue-700 transition active:scale-[0.98]"
            onClick={() => {
              setAlunoEmEdicao(null);
              setExibirCadastro(true);
            }}
          >
            <UserPlus size={20} />
            Novo Passageiro
          </button>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              className="w-full pl-10 p-3.5 bg-white rounded-xl border border-gray-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              type="text"
              placeholder="Pesquise pelo nome..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-3 mt-2">
            {students.length === 0 ? (
              <p className="text-center text-gray-400 py-10">
                Nenhum aluno encontrado.
              </p>
            ) : (
              students.map((student) => (
                <div
                  key={student.id}
                  className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center group hover:shadow-md transition"
                >
                  <div className="flex flex-col">
                    <p className="font-bold text-gray-800 text-lg">
                      {student.nome}
                    </p>
                    <div className="flex flex-col gap-1 mt-1.5">
                      <p className="text-gray-500 text-xs font-semibold flex items-center gap-1.5">
                        <GraduationCap size={14} className="text-purple-400" />
                        {student.faculdade || "Sem faculdade"}
                      </p>
                      <p className="text-gray-500 text-xs font-semibold flex items-center gap-1.5">
                        <MapPin size={14} className="text-red-400" />
                        Bairro {student.bairro}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      className="bg-gray-50 text-yellow-600 p-2.5 rounded-lg border border-gray-200 hover:bg-yellow-50 hover:border-yellow-200 transition"
                      onClick={() => {
                        setAlunoEmEdicao(student);
                        setExibirCadastro(true);
                      }}
                    >
                      <Pencil size={18} />
                    </button>
                    <button
                      className="bg-gray-50 text-red-500 p-2.5 rounded-lg border border-gray-200 hover:bg-red-50 hover:border-red-200 transition"
                      onClick={() => deletarAluno(student.id)}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Gestao;
