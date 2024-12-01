"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import MenuSuspenso from "../menu/page";

type Agendamento = {
  id: number;
  data: string;
  inicio: string;
  fim: string;
  id_quadra: number;
  quadra?: {
    nome: string;
  };
};

type Quadra = {
  id: number;
  nome: string;
};

export default function MeusAgendamentos() {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [agendamentos, setAgendamentos] = React.useState<Agendamento[]>([]);
  const [quadras, setQuadras] = React.useState<Quadra[]>([]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const fetchQuadras = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/quadras/", {
        headers: {
          Accept: "application/json",
          Authorization: "Bearer <SEU_TOKEN>", // Substituir pelo token real
        },
      });
      if (!response.ok) throw new Error(`Erro ${response.status}`);
      const data: Quadra[] = await response.json();
      setQuadras(data);
    } catch (error) {
      console.error("Erro ao carregar quadras:", error);
    }
  };

  const fetchAgendamentos = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/agendamento/", {
        headers: {
          Accept: "application/json",
          Authorization: "Bearer <SEU_TOKEN>", // Substituir pelo token real
        },
      });
      if (!response.ok) throw new Error(`Erro ${response.status}`);
      const data: Agendamento[] = await response.json();
      // Associa o nome da quadra aos agendamentos após a carga das quadras
      const agendamentosComQuadra = data.map((agendamento) => {
        const quadra = quadras.find((q) => q.id === agendamento.id_quadra);
        return {
          ...agendamento,
          quadra: quadra ? { nome: quadra.nome } : { nome: "Não especificado" }, // Ajuste aqui
        };
      });
      setAgendamentos(
        agendamentosComQuadra.sort((a, b) => {
          const dateA = new Date(a.data + "T" + a.inicio);
          const dateB = new Date(b.data + "T" + b.inicio);
          return dateB.getTime() - dateA.getTime(); // Ordena do mais recente para o mais antigo
        })
      );
    } catch (error) {
      console.error("Erro ao carregar agendamentos:", error);
    }
  };

  const handleCancel = async (id: number) => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/agendamento/${id}/`, {
        method: "DELETE",
        headers: {
          Accept: "application/json",
          Authorization: "Bearer <SEU_TOKEN>", // Substituir pelo token real
        },
      });
      if (response.ok) {
        alert("Agendamento cancelado com sucesso!");
        setAgendamentos(agendamentos.filter((agendamento) => agendamento.id !== id));
      } else {
        const errorData = await response.json();
        console.error("Erro ao cancelar agendamento:", errorData);
        alert("Erro ao cancelar o agendamento.");
      }
    } catch (error) {
      console.error("Erro ao cancelar agendamento:", error);
    }
  };

  const isCancelable = (data: string, inicio: string) => {
    const now = new Date();
    const agendamentoDate = new Date(`${data}T${inicio}`);
    const differenceInHours = (agendamentoDate.getTime() - now.getTime()) / (1000 * 60 * 60);
    return differenceInHours >= 12;
  };

  // Função que formata a data sem modificar o valor
  const formatDate = (data: string) => {
    const [year, month, day] = data.split("-");
    return `${day}/${month}/${year}`;
  };

  React.useEffect(() => {
    fetchQuadras(); // Carrega as quadras
  }, []);

  // Dependendo do estado de quadras, carregue os agendamentos
  React.useEffect(() => {
    if (quadras.length > 0) {
      fetchAgendamentos(); // Só carrega agendamentos após as quadras
    }
  }, [quadras]);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Barra de navegação */}
      <div className="w-full bg-[#FFD922] text-black p-4 fixed top-0 left-0 right-0 z-10">
        <div className="flex justify-between items-center">
          {/* Menu suspenso */}
          <MenuSuspenso isMenuOpen={isMenuOpen} toggleMenu={toggleMenu} />

          {/* Nome do aplicativo (PlayTime) */}
          <div className="flex-1 text-center">
            <h1 className="text-2xl font-semibold">PlayTime</h1>
          </div>
        </div>
      </div>

      {/* Conteúdo principal */}
      <div className="flex flex-col items-center justify-center flex-1 pt-24 px-6">
        <h2 className="text-2xl font-semibold mb-6">Meus Agendamentos</h2>

        {agendamentos.length === 0 ? (
          <p className="text-gray-500">Você não tem nenhum agendamento.</p>
        ) : (
          <ul className="space-y-4 w-full">
            {agendamentos.map((agendamento) => (
              <li key={agendamento.id} className="border p-4 rounded-lg bg-white shadow-md">
                <p>
                  <strong>Quadra:</strong> {agendamento.quadra?.nome || "Não especificado"}
                </p>
                <p>
                  <strong>Data:</strong> {formatDate(agendamento.data)} {/* Formata a data */}
                </p>
                <p>
                  <strong>Horário:</strong> {agendamento.inicio} às {agendamento.fim}
                </p>

                {isCancelable(agendamento.data, agendamento.inicio) ? (
                  <button
                    onClick={() => handleCancel(agendamento.id)}
                    className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    Cancelar
                  </button>
                ) : (
                  <p className="text-red-500 mt-2">
                    Cancelamento disponível apenas com antecedência mínima de 12 horas.
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
