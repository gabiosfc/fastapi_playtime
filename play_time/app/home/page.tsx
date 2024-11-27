"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleReserveClick = () => {
    router.push("/agenda"); 
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    router.push("/login"); 
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Barra de navegação */}
      <div className="w-full bg-[#FFD922] text-black p-4 fixed top-0 left-0 right-0 z-10">
        <div className="flex justify-between items-center">
          {/* Ícone de Menu (Hamburger) */}
          <button
            onClick={toggleMenu}
            className="text-black focus:outline-none"
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
      <div className="flex flex-col items-center justify-center flex-1 pt-24">
        {/* Botão para reservar quadra */}
        <button
          onClick={handleReserveClick}
          className="px-6 py-2 text-white font-semibold text-lg rounded"
          style={{
            backgroundColor: "#067c8a",
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
          Reservar quadra
        </button>
      </div>
    </div>
  );
}
