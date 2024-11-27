"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Calendar } from "@/components/ui/calendar";

// Definição de tipos para quadras e horários
type Court = {
  id: number;
  nome: string;
  descricao: string;
  disponivel: boolean;
};

type AvailableTime = {
  time: string;
};

export default function CalendarDemo() {
  const router = useRouter();
  const [date, setDate] = React.useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = React.useState<string | null>(null);
  const [selectedCourt, setSelectedCourt] = React.useState<string | null>(null);
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [availableTimes, setAvailableTimes] = React.useState<string[]>([]);
  const [courts, setCourts] = React.useState<Court[]>([]);

  const handleDateSelect = (selectedDate: Date | undefined) => {
    setDate(selectedDate);
  };

  React.useEffect(() => {
    const fetchAvailableTimes = async () => {
      try {
        const response = await fetch("../availableTimes.json");
        const data = await response.json();
        setAvailableTimes(data.availableTimes);
      } catch (error) {
        console.error("Erro ao carregar horários disponíveis:", error);
      }
    };

    const fetchCourts = async () => {
      try {
        const response = await fetch("http://127.0.0.1:8000/quadras/", {
          headers: { Accept: "application/json" },
        });
        if (!response.ok) {
          throw new Error(`Erro ${response.status}: Não foi possível carregar as quadras.`);
        }
        const data: Court[] = await response.json();
        setCourts(data.filter((court) => court.disponivel)); // Filtra apenas quadras disponíveis
      } catch (error) {
        console.error("Erro ao carregar quadras disponíveis:", error);
      }
    };

    fetchAvailableTimes();
    fetchCourts();
  }, []);

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
  };

  const handleCourtSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCourt(e.target.value);
  };

  const formattedDate = date
    ? `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`
    : "";

  const handleConfirm = async () => {
    if (!date || !selectedTime || !selectedCourt) return;

    // Encontrar o ID da quadra selecionada
    const selectedCourtData = courts.find((court) => court.nome === selectedCourt);

    if (!selectedCourtData) {
      alert("Quadra selecionada inválida.");
      return;
    }

    // Dados para a API
    const agendamentoData = {
      id_quadra: selectedCourtData.id,
      id_usuario: 2, // Substituir com o ID do usuário autenticado
      data: date.toISOString().split("T")[0], // Formato "YYYY-MM-DD"
      inicio: `${selectedTime}:00`, // Adiciona segundos ao horário
      fim: `${selectedTime}:59`, // Exemplo de ajuste para o término do horário
    };

    try {
      const response = await fetch("http://127.0.0.1:8000/agendamento/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJnYWJyaWVsYUBhZG1pbi5jb20iLCJleHAiOjE3MzI2NjgzNzB9.KTr5kHOPEDd_hEUtEMO21f5nuDB6El0D1aqTPNjk3vQ", // Atualize com o token correto
        },
        body: JSON.stringify(agendamentoData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Erro ao salvar agendamento:", errorData);
        alert("Falha ao salvar o agendamento. Tente novamente.");
        return;
      }

      const responseData = await response.json();
      alert(`Agendamento confirmado com sucesso! ID: ${responseData.id}`);
    } catch (error) {
      console.error("Erro ao conectar com a API:", error);
      alert("Ocorreu um erro ao salvar o agendamento. Verifique sua conexão e tente novamente.");
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken"); 
    router.push("/login"); 
  };

  return (
    <div className="min-h-screen flex flex-col items-center">
      {/* Header com Menu Suspenso no canto superior esquerdo */}
      <div className="w-full bg-[#FFD922] text-black p-4 fixed top-0 left-0 right-0 z-10">
        <div className="flex justify-between items-center">
          <button
            onClick={toggleMenu}
            className="text-black focus:outline-none"
            style={{ position: "absolute", left: 16, top: 16 }}
          >
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
      </div>

      {/* Menu Suspenso */}
      {isMenuOpen && (
        <div
          className="absolute top-16 left-0 bg-[#FFD922] text-black p-4 z-20 w-max"
          style={{ zIndex: 20 }}
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

      {/* Conteúdo principal */}
      <div className="pt-24 flex items-start justify-center space-x-8">
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleDateSelect}
          className="rounded-md border"
          style={{ borderColor: date ? "black" : "black" }}
        />

        <div className="flex flex-col items-start space-y-4">
          <h2 className="text-lg font-semibold mb-4">Selecione um horário:</h2>
          <div className="grid grid-cols-2 gap-2 mb-4">
            {availableTimes.map((time) => (
              <button
                key={time}
                onClick={() => handleTimeSelect(time)}
                className={`px-4 py-2 rounded ${selectedTime === time ? "text-white" : "text-gray-700"
                  }`}
                style={{
                  backgroundColor: selectedTime === time ? "#067c8a" : "#e0e0e0",
                  color: selectedTime === time ? "white" : "black",
                }}
              >
                {time}
              </button>
            ))}
          </div>

          <label htmlFor="court" className="text-lg font-semibold mb-2">
            Selecione uma quadra:
          </label>
          <select
            id="court"
            className="p-2 border rounded"
            value={selectedCourt || ""}
            onChange={handleCourtSelect}
          >
            <option value="" disabled>Selecione uma quadra</option>
            {courts.map((court) => (
              <option key={court.id} value={court.nome}>
                {court.nome} - {court.descricao}
              </option>
            ))}
          </select>
        </div>
      </div>

      {date && selectedTime && selectedCourt && (
        <div className="text-center mt-4">
          <h3 className="text-lg font-medium">Resumo de agendamento:</h3>
          <p className="text-gray-700">Data: {formattedDate}</p>
          <p className="text-gray-700">Horário: {selectedTime}</p>
          <p className="text-gray-700">Quadra: {selectedCourt}</p>

          <button
            onClick={handleConfirm}
            className="mt-4 px-6 py-2"
            style={{
              backgroundColor: "#067c8a",
              color: "white",
              borderRadius: "0.375rem",
              border: "none",
              cursor: "pointer",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#045f67";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#067c8a";
            }}
          >
            Confirmar
          </button>
        </div>
      )}
    </div>
  );
}
