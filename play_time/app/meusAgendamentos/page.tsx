"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

type Agendamento = {
  id: number;
  data: string;
  inicio: string;
  fim: string;
  quadra?: {
    nome: string;
  };
};

export default function MeusAgendamentos() {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [agendamentos, setAgendamentos] = React.useState<Agendamento[]>([]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
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
      setAgendamentos(data);
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

  // Verifica se o agendamento pode ser cancelado (com antecedência de 12 horas)
  const isCancelable = (data: string, inicio: string) => {
    const now = new Date();
    const agendamentoDate = new Date(`${data}T${inicio}`);
    const differenceInHours = (agendamentoDate.getTime() - now.getTime()) / (1000 * 60 * 60);
    return differenceInHours >= 12; // Verifica se o agendamento está com antecedência >= 12 horas
  };

  React.useEffect(() => {
    fetchAgendamentos();
  }, []);

  // Função para realizar o logout e redirecionar para a tela de login
  const handleLogout = () => {
    // Remove o token de autenticação ou qualquer dado de sessão
    localStorage.removeItem("token"); // ou sessionStorage.removeItem("token");

    // Redireciona para a tela de login
    router.push("/login");
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Barra de navegação */}
      <div className="w-full bg-[#FFD922] text-black p-4 fixed top-0 left-0 right-0 z-10">
        <div className="flex justify-between items-center">
          {/* Ícone de Menu (Hamburger) */}
          <button onClick={toggleMenu} className="text-black focus:outline-none">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>

          {/* Nome do aplicativo (PlayTime) */}
          <div className="flex-1 text-center">
            <h1 className="text-2xl font-semibold">PlayTime</h1>
          </div>
        </div>

        {/* Menu suspenso */}
        {isMenuOpen && (
          <div
            className="absolute top-16 left-0 bg-[#FFD922] text-black p-4"
            style={{ zIndex: 20, width: "max-content" }}
          >
            <div className="flex flex-col items-start space-y-4">
              <a href="/home" className="text-black hover:text-gray-700">
                Home
              </a>
              <a href="/meusAgendamentos" className="text-black hover:text-gray-700">
                Meus Agendamentos
              </a>
              <a href="/agenda" className="text-black hover:text-gray-700">
                Reservar Quadra
              </a>
              <button
                onClick={handleLogout}
                className="text-black hover:text-gray-700"
              >
                Sair
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Conteúdo principal */}
      <div className="flex flex-col items-center justify-center flex-1 pt-24 px-6">
        {/* Título */}
        <h2 className="text-2xl font-semibold mb-6">Meus Agendamentos</h2>

        {agendamentos.length === 0 ? (
          <p className="text-gray-500">Você não tem nenhum agendamento.</p>
        ) : (
          <ul className="space-y-4 w-full">
            {agendamentos.map((agendamento) => (
              <li key={agendamento.id} className="border p-4 rounded-lg bg-white shadow-md">
                <p><strong>Quadra:</strong> {agendamento.quadra?.nome || "Não especificado"}</p>
                <p><strong>Data:</strong> {new Date(agendamento.data).toLocaleDateString()}</p>
                <p><strong>Horário:</strong> {agendamento.inicio}</p>

                {isCancelable(agendamento.data, agendamento.inicio) ? (
                  <div className="flex space-x-4 mt-2">
                    <button
                      onClick={() => handleCancel(agendamento.id)}
                      disabled={false} // Habilitado, pode cancelar
                      className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                      Cancelar
                    </button>
                  </div>
                ) : (
                  <div className="flex space-x-4 mt-2">
                    <button
                      onClick={() => handleCancel(agendamento.id)}
                      disabled={true} // Desabilitado
                      className="px-4 py-2 bg-red-500 text-white rounded opacity-50 cursor-not-allowed"
                    >
                      Cancelar
                    </button>
                    <p className="text-red-500 mt-2">
                      Cancelamento disponível apenas com antecedência mínima de 12 horas.
                    </p>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
