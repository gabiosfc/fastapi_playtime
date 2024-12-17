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
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [confirmationError, setConfirmationError] = React.useState<string | null>(null);
  const [isCheckoutVisible, setIsCheckoutVisible] = React.useState(false); // Controla a exibição do popup de checkout
  const [agendamentoData, setAgendamentoData] = React.useState<any | null>(null); // Dados do agendamento a serem confirmados
  const [agendamentoSuccess, setAgendamentoSuccess] = React.useState(false); // Controla a exibição da mensagem de sucesso

  const handleDateSelect = (selectedDate: Date | undefined) => {
    setDate(selectedDate);
    setErrorMessage(null); // Limpa qualquer erro relacionado a seleção
    setConfirmationError(null); // Limpa erros de confirmação ao alterar a data
    setAgendamentoSuccess(false); // Limpa o sucesso anterior
  };

  React.useEffect(() => {
    const fetchAvailableTimes = async () => {
      try {
        const response = await fetch("../availableTimes.json");
        const data = await response.json();
        setAvailableTimes(data.availableTimes);
      } catch (error) {
        setErrorMessage("Erro ao carregar horários disponíveis.");
      }
    };

    const fetchCourts = async () => {
      try {
        const token = localStorage.getItem("access_token");
        const response = await fetch("http://127.0.0.1:8000/quadras/", {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          throw new Error(`Erro ${response.status}: Não foi possível carregar as quadras.`);
        }
        const data: Court[] = await response.json();
        setCourts(data.filter((court) => court.disponivel)); // Filtra apenas quadras disponíveis
      } catch (error) {
        setErrorMessage("Erro ao carregar quadras disponíveis.");
      }
    };

    fetchAvailableTimes();
    fetchCourts();
  }, []);

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    setErrorMessage(null); // Limpa erro de horário ao selecionar um novo
    setConfirmationError(null); // Limpa erros de confirmação ao alterar o horário
  };

  const handleCourtSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCourt(e.target.value);
    setErrorMessage(null); // Limpa erro de quadra ao selecionar uma nova
    setConfirmationError(null); // Limpa erros de confirmação ao alterar a quadra
  };

  const formattedDate = date
    ? `${String(date.getDate()).padStart(2, "0")}/${String(date.getMonth() + 1).padStart(2, "0")}/${date.getFullYear()}`
    : "";

  const handleConfirm = async () => {
    if (!date || !selectedTime || !selectedCourt) {
      setConfirmationError("Por favor, preencha todos os campos.");
      return;
    }

    const selectedCourtData = courts.find((court) => court.nome === selectedCourt);
    if (!selectedCourtData) {
      setConfirmationError("Quadra selecionada inválida.");
      return;
    }

    const userId = 0; // ID do usuário é preenchido conforme token ao realizar o POST

    // Extrair horários de início e fim no formato HH:mm:00
    const [start, end] = selectedTime.split(" às ");
    const inicio = `${start}:00`;
    const fim = `${end}:00`;

    const agendamentoData = {
      id_quadra: selectedCourtData.id,
      id_usuario: userId,
      data: formattedDate,
      inicio,
      fim,
    };

    // Exibe o popup de checkout com os dados do agendamento
    setAgendamentoData(agendamentoData);
    setIsCheckoutVisible(true);
  };

  const handleCheckoutConfirm = async () => {
    if (!agendamentoData) return;

    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch("http://127.0.0.1:8000/agendamento/", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(agendamentoData),
      });

      if (!response.ok) {
        const errorData = await response.json();

        // Verifique se a resposta contém uma mensagem específica de erro de agendamento duplicado
        if (errorData && errorData.detail && errorData.detail.includes("already exists")) {
          setConfirmationError("Já existe uma reserva para o horário selecionado. Por favor, escolha outro.");
        } else if (errorData.message && errorData.message.includes("conflict")) {
          setConfirmationError("Já existe um agendamento para o mesmo horário e quadra.");
        } else {
          setConfirmationError("Falha ao salvar o agendamento. Tente novamente.");
        }
        return;
      }

      setAgendamentoSuccess(true); // Marca que o agendamento foi bem-sucedido
      setIsCheckoutVisible(false); // Fecha o popup após o agendamento
    } catch (error) {
      setConfirmationError("Ocorreu um erro ao salvar o agendamento. Verifique sua conexão e tente novamente.");
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    router.push("/login");
  };

  const handleRedirectToAgendamentos = () => {
    router.push("/meusAgendamentos"); // Redireciona para a página "Meus Agendamentos"
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
            <option value="" disabled>
              Selecione uma quadra
            </option>
            {courts.map((court) => (
              <option key={court.id} value={court.nome}>
                {court.nome} - {court.descricao}
              </option>
            ))}
          </select>
        </div>
      </div>

      {confirmationError && (
        <div className="text-red-500 text-center mt-4">{confirmationError}</div>
      )}

      {errorMessage && (
        <div className="text-red-500 text-center mt-4">{errorMessage}</div>
      )}

      {/* Botão de confirmação */}
      {!isCheckoutVisible && !agendamentoSuccess && (
        <button
          onClick={handleConfirm}
          className="mt-4 px-6 py-2 bg-[#067c8a] text-white rounded"
        >
          Confirmar
        </button>
      )}

      {/* Popup de checkout */}
      {isCheckoutVisible && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-md shadow-lg">
            <h3 className="text-xl font-semibold">Resumo de Agendamento</h3>
            <p><strong>Data:</strong> {formattedDate}</p>
            <p><strong>Horário:</strong> {selectedTime}</p>
            <p><strong>Quadra:</strong> {selectedCourt}</p>
            <div className="mt-4 flex justify-between gap-6"> {/* Adicionei o 'gap-6' aqui */}
              <button
                onClick={() => setIsCheckoutVisible(false)}
                className="px-4 py-2 bg-gray-500 text-white rounded"
              >
                Cancelar
              </button>
              <button
                onClick={handleCheckoutConfirm}
                className="px-4 py-2 bg-[#067c8a] text-white rounded"
              >
                Confirmar Agendamento
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mensagem de sucesso com redirecionamento */}
      {agendamentoSuccess && (
        <div className="mt-6 text-green-500 text-center">
          <p>Agendamento confirmado com sucesso!</p>
          <button
            onClick={handleRedirectToAgendamentos}
            className="mt-4 px-6 py-2 bg-[#067c8a] text-white rounded"
          >
            Ir para Meus Agendamentos
          </button>
        </div>
      )}
    </div>
  );
}
