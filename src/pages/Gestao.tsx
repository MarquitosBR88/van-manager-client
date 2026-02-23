import axios from "axios";
import type { Student } from "../types/student.ts";
import { useEffect, useState } from "react";
import CadastroPassageiro from "../components/CadastroPassageiro.tsx";

function Gestao() {
  const [students, setStudents] = useState<Student[]>([]);
  const [busca, setBusca] = useState("");
  const [exibirCadastro, setExibirCadastro] = useState(false);
  const [alunoEmEdicao, setAlunoEmEdicao] = useState<Student | null>(null);

  function buscarAlunos() {
    if (busca === "") {
      axios
        .get("http://localhost:8080/students")
        .then((resposta) => {
          setStudents(resposta.data);
        })
        .catch((erro) => {
          console.error("Algo de errado aconteceu: ", erro);
        });
    } else {
      axios
        .get(`http://localhost:8080/students/search?nome=${busca}`)
        .then((resposta) => {
          setStudents(resposta.data);
        })
        .catch((erro) => {
          console.error("Algo de errado aconteceu: ", erro);
        });
    }
  }

  useEffect(() => {
    buscarAlunos();
  }, [busca]);

  function deletarAluno(id: number) {
    axios
      .delete(`http://localhost:8080/students/${id}`)
      .then(() => {
        setStudents(students.filter((student) => student.id !== id));
      })
      .catch((erro) => {
        console.error("Erro ao deletar", erro);
      });
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:max-w-md md:mx-auto">
      {exibirCadastro ? (
        <CadastroPassageiro
          aoVoltar={() => {
            setExibirCadastro(false);
            buscarAlunos();
          }}
          alunoEditando={alunoEmEdicao}
        />
      ) : (
        <div className="flex flex-col gap-3 mb-6">
          <button
            className="bg-blue-600 text-white font-bold p-3 rounded-lg shadow hover:bg-blue-700 transition cursor-pointer"
            onClick={() => {
              setAlunoEmEdicao(null);
              setExibirCadastro(true);
            }}
          >
            Novo Passageiro
          </button>
          <input
            className="p-3 rounded-lg border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            type="text"
            placeholder="Pesquise pelo aluno..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          ></input>
          {students.map((student) => (
            <div
              key={student.id}
              className="bg-white p-4 rounded-xl shadow-md flex justify-between items-center border-l-4 border-blue-500"
            >
              <div>
                <p className="font-bold text-gray-800 text-lg">
                  {student.nome}
                </p>
                <p className="text-gray-500 text-sm">
                  {student.faculdade} - Bairro {student.bairro}
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  className="bg-yellow-500 text-white px-3 py-1 rounded-md font-semibold text-sm cursor-pointer"
                  onClick={() => {
                    setAlunoEmEdicao(student);
                    setExibirCadastro(true);
                  }}
                >
                  Editar
                </button>
                <button
                  className="bg-red-500 text-white px-3 py-1 rounded-md font-semibold text-sm cursor-pointer"
                  onClick={() => deletarAluno(student.id)}
                >
                  Excluir
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Gestao;
