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
  const [tabSelecionada, setTabSelecionada] = React.useState<'proximos' | 'historico'>('proximos');
  const [agendamentosProximos, setAgendamentosProximos] = React.useState<Agendamento[]>([]);
  const [agendamentosHistorico, setAgendamentosHistorico] = React.useState<Agendamento[]>([]);
  const [mensagem, setMensagem] = React.useState<string | null>(null);  // Estado para mensagem de erro ou sucesso

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    setMensagem(null);  // Limpa a mensagem ao interagir com o menu
  };

  const getToken = () => localStorage.getItem("access_token");

  const fetchQuadras = async () => {
    try {
      const token = getToken();
      const response = await fetch("http://127.0.0.1:8000/quadras/", {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error(`Erro ${response.status}`);
      const data: Quadra[] = await response.json();
      setQuadras(data);
    } catch (error) {
      setMensagem("Erro ao carregar quadras.");
    }
  };

  const fetchAgendamentos = async () => {
    try {
      const token = getToken();
      const response = await fetch("http://127.0.0.1:8000/agendamento/", {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error(`Erro ${response.status}`);
      const data: Agendamento[] = await response.json();
      const agendamentosComQuadra = data.map((agendamento) => {
        const quadra = quadras.find((q) => q.id === agendamento.id_quadra);
        return {
          ...agendamento,
          quadra: quadra ? { nome: quadra.nome } : { nome: "Não especificado" },
        };
      });

      const agendamentosOrdenados = agendamentosComQuadra.sort((a, b) => {
        const dateA = new Date(a.data + "T" + a.inicio);
        const dateB = new Date(b.data + "T" + b.inicio);
        return dateA.getTime() - dateB.getTime();
      });

      const now = new Date();
      const proximos = agendamentosOrdenados.filter((agendamento) => {
        const agendamentoDate = new Date(`${agendamento.data}T${agendamento.inicio}`);
        return agendamentoDate > now;
      });

      const historico = agendamentosOrdenados.filter((agendamento) => {
        const agendamentoDate = new Date(`${agendamento.data}T${agendamento.inicio}`);
        return agendamentoDate <= now;
      });

      setAgendamentosProximos(proximos);
      setAgendamentosHistorico(historico);
    } catch (error) {
      setMensagem("Erro ao carregar agendamentos.");
    }
  };

  const handleCancel = async (id: number) => {
    try {
      const token = getToken();
      const response = await fetch(`http://127.0.0.1:8000/agendamento/${id}/`, {
        method: "DELETE",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        setMensagem("Agendamento cancelado com sucesso!");
        setAgendamentosProximos(agendamentosProximos.filter((agendamento) => agendamento.id !== id));
      } else {
        const errorData = await response.json();
        setMensagem("Erro ao cancelar o agendamento.");
      }
    } catch (error) {
      setMensagem("Erro ao cancelar agendamento.");
    }
  };

  const isCancelable = (data: string, inicio: string) => {
    const now = new Date();
    const agendamentoDate = new Date(`${data}T${inicio}`);
    const differenceInHours = (agendamentoDate.getTime() - now.getTime()) / (1000 * 60 * 60);
    return differenceInHours >= 12;
  };

  const formatDate = (data: string) => {
    const [year, month, day] = data.split("-");
    return `${day}/${month}/${year}`;
  };

  React.useEffect(() => {
    fetchQuadras();
  }, []);

  React.useEffect(() => {
    if (quadras.length > 0) {
      fetchAgendamentos();
    }
  }, [quadras]);

  const closeMessage = () => {
    setMensagem(null);  // Fecha a mensagem
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="w-full bg-[#FFD922] text-black p-4 fixed top-0 left-0 right-0 z-10">
        <div className="flex justify-between items-center">
          <MenuSuspenso isMenuOpen={isMenuOpen} toggleMenu={toggleMenu} />
          <div className="flex-1 text-center">
            <h1 className="text-2xl font-semibold">PlayTime</h1>
          </div>
        </div>
      </div>

      <div className="pt-24 pb-6 px-6"> {/* Espaço adicional para distanciar do header */}
        {/* Mensagem de sucesso ou erro */}
        {mensagem && (
          <div className="mb-4 p-4 text-center rounded-lg text-white bg-red-500 relative w-full max-w-xl mx-auto">
            <button
              onClick={closeMessage}
              className="absolute top-2 right-3 text-white"
            >
              X
            </button>
            {mensagem}
          </div>
        )}

        <div className="sticky top-16 bg-white p-4 shadow-md z-20"> {/* Fixando o conteúdo abaixo do header */}
          <div className="flex flex-col items-center justify-center text-center"> {/* Centralizando o conteúdo */}
            <h2 className="text-2xl font-semibold mb-6">Meus Agendamentos</h2>

            <div className="flex justify-center space-x-6 mb-6">
              <button
                onClick={() => {
                  setTabSelecionada('proximos');
                  setMensagem(null); // Limpa a mensagem ao mudar de tab
                }}
                className={`px-6 py-2 rounded-lg ${tabSelecionada === 'proximos' ? 'bg-yellow-400' : 'bg-gray-300'}`}
              >
                Próximos
              </button>
              <button
                onClick={() => {
                  setTabSelecionada('historico');
                  setMensagem(null); // Limpa a mensagem ao mudar de tab
                }}
                className={`px-6 py-2 rounded-lg ${tabSelecionada === 'historico' ? 'bg-yellow-400' : 'bg-gray-300'}`}
              >
                Histórico
              </button>
            </div>
          </div>
        </div>

        <div className="w-full">
          <div className={`tab-content ${tabSelecionada === 'proximos' ? '' : 'hidden'} transition-opacity duration-300 ease-in-out`}>
            {agendamentosProximos.length === 0 ? (
              <p className="text-gray-500">Você não tem agendamentos próximos.</p>
            ) : (
              <ul className="space-y-4">
                {agendamentosProximos.map((agendamento) => (
                  <li key={agendamento.id} className="border p-4 rounded-lg bg-white shadow-md">
                    <p>
                      <strong>Quadra:</strong> {agendamento.quadra?.nome || "Não especificado"}
                    </p>
                    <p>
                      <strong>Data:</strong> {formatDate(agendamento.data)}
                    </p>
                    <p>
                      <strong>Horário:</strong> {agendamento.inicio} às {agendamento.fim}
                    </p>
                    {isCancelable(agendamento.data, agendamento.inicio) && (
                      <button
                        onClick={() => handleCancel(agendamento.id)}
                        className="bg-red-500 text-white rounded-lg px-4 py-2 mt-4"
                      >
                        Cancelar
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className={`tab-content ${tabSelecionada === 'historico' ? '' : 'hidden'} transition-opacity duration-300 ease-in-out`}>
            {agendamentosHistorico.length === 0 ? (
              <p className="text-gray-500">Você não tem agendamentos no histórico.</p>
            ) : (
              <ul className="space-y-4">
                {agendamentosHistorico.map((agendamento) => (
                  <li key={agendamento.id} className="border p-4 rounded-lg bg-white shadow-md">
                    <p>
                      <strong>Quadra:</strong> {agendamento.quadra?.nome || "Não especificado"}
                    </p>
                    <p>
                      <strong>Data:</strong> {formatDate(agendamento.data)}
                    </p>
                    <p>
                      <strong>Horário:</strong> {agendamento.inicio} às {agendamento.fim}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
