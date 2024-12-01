import React from "react";
import { useRouter } from "next/navigation";

interface MenuSuspensoProps {
  isMenuOpen: boolean;
  toggleMenu: () => void;
}

const MenuSuspenso: React.FC<MenuSuspensoProps> = ({ isMenuOpen, toggleMenu }) => {
  const router = useRouter();

  const handleLogout = () => {
    // Remove o token de autenticação ou qualquer dado de sessão
    localStorage.removeItem("token");

    // Redireciona para a tela de login
    router.push("/login");
  };

  return (
    <>
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
    </>
  );
};

export default MenuSuspenso;
