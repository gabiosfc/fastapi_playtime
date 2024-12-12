"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import MenuSuspenso from "../menu/page";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

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

  // Configurações do carrossel
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
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
      <div className="flex flex-col items-center justify-center flex-1 pt-24 space-y-8">
        {/* Carrossel de imagens */}
        <Slider {...settings} className="w-full max-w-screen-md">
          <div className="relative">
            <img src="/images/image1.jpg" alt="Imagem 1" className="w-full h-64 object-cover" />
            <p className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-center py-2">Descrição da Imagem 1</p>
          </div>
          <div className="relative">
            <img src="/images/image2.jpeg" alt="Imagem 2" className="w-full h-64 object-cover" />
            <p className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-center py-2">Descrição da Imagem 2</p>
          </div>
          <div className="relative">
            <img src="/images/image3.jpg" alt="Imagem 3" className="w-full h-64 object-cover" />
            <p className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-center py-2">Descrição da Imagem 3</p>
          </div>
        </Slider>

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

      {/* Rodapé */}
      <footer className="w-full bg-gray-800 text-white text-center py-4 mt-8">
        <p>Siga-nos no Instagram: <a href="https://instagram.com/playtime" className="text-blue-400">@playtime</a></p>
      </footer>
    </div>
  );
}
