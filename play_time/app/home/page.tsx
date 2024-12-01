"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import MenuSuspenso from "../menu/page";

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
          {/* Menu suspenso */}
          <MenuSuspenso isMenuOpen={isMenuOpen} toggleMenu={toggleMenu} />

          {/* Nome do aplicativo (PlayTime) */}
          <div className="flex-1 text-center">
            <h1 className="text-2xl font-semibold">PlayTime</h1>
          </div>
        </div>
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
