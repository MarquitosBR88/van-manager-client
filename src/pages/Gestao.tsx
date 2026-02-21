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
    <div>
      <h1>Painel do Motorista</h1>
      {exibirCadastro ? (
        <CadastroPassageiro
          aoVoltar={() => {
            setExibirCadastro(false);
            buscarAlunos();
          }}
        />
      ) : (
        <div>
          <button
            onClick={() => {
              setAlunoEmEdicao(null);
              setExibirCadastro(true);
            }}
          >
            Novo Passageiro
          </button>
          <input
            type="text"
            placeholder="Pesquise pelo aluno..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          ></input>
          {students.map((student) => (
            <div key={student.id}>
              <p>{student.nome}</p>
              <p>{student.telefone}</p>
              <button
                onClick={() => {
                  setAlunoEmEdicao(student);
                  setExibirCadastro(true);
                }}
              >
                Editar
              </button>
              <button onClick={() => deletarAluno(student.id)}>Excluir</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Gestao;
