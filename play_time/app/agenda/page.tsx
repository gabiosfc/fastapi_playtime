"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Calendar } from "@/components/ui/calendar";
import MenuSuspenso from "../menu/page";

type Court = {
  id: number;
  nome: string;
  descricao: string;
  disponivel: boolean;
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

  const checkExistingBooking = async (userId: number) => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/agendamento/usuario/${userId}`, {
        headers: {
          "Authorization": "Bearer YOUR_TOKEN_HERE",
        },
      });
      if (!response.ok) {
        throw new Error("Erro ao verificar agendamentos existentes.");
      }
      const data = await response.json();
      return data.length > 0; // Retorna verdadeiro se já houver agendamento
    } catch (error) {
      console.error("Erro ao verificar agendamento existente:", error);
      return false;
    }
  };

  const handleConfirm = async () => {
    if (!date || !selectedTime || !selectedCourt) {
      alert("Por favor, preencha todos os campos.");
      return;
    }

    const selectedCourtData = courts.find((court) => court.nome === selectedCourt);
    if (!selectedCourtData) {
      alert("Quadra selecionada inválida.");
      return;
    }

    const userId = 2; // ID do usuário autenticado (substituir pelo correto)
    const alreadyBooked = await checkExistingBooking(userId);

    if (alreadyBooked) {
      alert("Você já possui um agendamento ativo. Cancele-o antes de criar um novo.");
      return;
    }

    const agendamentoData = {
      id_quadra: selectedCourtData.id,
      id_usuario: userId,
      data: date.toISOString().split("T")[0],
      inicio: `${selectedTime}:00`,
      fim: `${selectedTime}:59`,
    };

    try {
      const response = await fetch("http://127.0.0.1:8000/agendamento/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer YOUR_TOKEN_HERE",
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
                className={`px-4 py-2 rounded ${
                  selectedTime === time ? "text-white" : "text-gray-700"
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
            className="mt-4 px-6 py-2 bg-[#067c8a] text-white rounded"
          >
            Confirmar
          </button>
        </div>
      )}
    </div>
  );
}