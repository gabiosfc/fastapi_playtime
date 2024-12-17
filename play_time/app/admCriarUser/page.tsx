"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import MenuSuspenso from "../menu/page";

export default function AdminUsuarios() {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  // Estados para criação de admin
  const [newAdmin, setNewAdmin] = React.useState({
    nome: "",
    cpf: "",
    email: "",
    senha: "",
    confirmSenha: "",
  });
  const [adminMessage, setAdminMessage] = React.useState("");
  const [adminError, setAdminError] = React.useState("");

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const getToken = () => localStorage.getItem("access_token");

  const handleCreateAdmin = async () => {
    setAdminError(""); // Limpa erros anteriores
    setAdminMessage(""); // Limpa mensagens anteriores

    // Validações locais
    if (!newAdmin.nome || !newAdmin.cpf || !newAdmin.email || !newAdmin.senha) {
      setAdminError("Todos os campos são obrigatórios.");
      return;
    }

    if (!/^\d{11}$/.test(newAdmin.cpf)) {
      setAdminError("CPF inválido. Insira apenas números (11 dígitos).");
      return;
    }

    if (!/\S+@\S+\.\S+/.test(newAdmin.email)) {
      setAdminError("E-mail inválido. Verifique o formato.");
      return;
    }

    if (newAdmin.senha !== newAdmin.confirmSenha) {
      setAdminError("As senhas não coincidem. Tente novamente.");
      return;
    }

    try {
      const token = getToken();
      const response = await fetch("http://127.0.0.1:8000/users/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          nome: newAdmin.nome,
          cpf: newAdmin.cpf,
          email: newAdmin.email,
          senha: newAdmin.senha,
          perfil: "admin", // Perfil fixo
        }),
      });

      if (response.ok) {
        setAdminMessage("Usuário administrador criado com sucesso!");
        setNewAdmin({ nome: "", cpf: "", email: "", senha: "", confirmSenha: "" });
      } else {
        const errorData = await response.json();
        if (errorData.detail) {
          setAdminError(errorData.detail);
        } else if (errorData.errors) {
          if (errorData.errors.cpf) setAdminError("CPF já cadastrado.");
          if (errorData.errors.email) setAdminError("E-mail já cadastrado.");
        } else {
          setAdminError("Erro ao criar administrador. Tente novamente mais tarde.");
        }
      }
    } catch (error) {
      setAdminError("Erro de conexão. Verifique sua rede e tente novamente.");
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="w-full bg-[#FFD922] text-black p-4 fixed top-0 z-10">
        <div className="flex justify-between items-center">
          <MenuSuspenso isMenuOpen={isMenuOpen} toggleMenu={toggleMenu} />
          <div className="flex-1 text-center">
            <h1 className="text-2xl font-semibold">PlayTime - Admin</h1>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center flex-1 pt-24 px-6">
        
        {/* Criar usuário admin */}
        <div className="w-full max-w-md mb-8">
          <h3 className="font-semibold mb-2">Criar Administrador</h3>
          <input
            type="text"
            placeholder="Nome"
            value={newAdmin.nome}
            onChange={(e) => setNewAdmin({ ...newAdmin, nome: e.target.value })}
            className="w-full p-2 border rounded mb-2"
          />
          <input
            type="text"
            placeholder="CPF"
            value={newAdmin.cpf}
            onChange={(e) => setNewAdmin({ ...newAdmin, cpf: e.target.value })}
            className="w-full p-2 border rounded mb-2"
          />
          <input
            type="email"
            placeholder="Email"
            value={newAdmin.email}
            onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
            className="w-full p-2 border rounded mb-2"
          />
          <input
            type="password"
            placeholder="Senha"
            value={newAdmin.senha}
            onChange={(e) => setNewAdmin({ ...newAdmin, senha: e.target.value })}
            className="w-full p-2 border rounded mb-2"
          />
          <input
            type="password"
            placeholder="Confirme a Senha"
            value={newAdmin.confirmSenha}
            onChange={(e) => setNewAdmin({ ...newAdmin, confirmSenha: e.target.value })}
            className="w-full p-2 border rounded mb-2"
          />
          {adminError && <p className="text-red-500">{adminError}</p>}
          {adminMessage && <p className="text-green-500">{adminMessage}</p>}
          <button
            onClick={handleCreateAdmin}
            className="px-4 py-2 bg-blue-500 text-white rounded"
          >
            Criar Administrador
          </button>
        </div>
      </div>
    </div>
  );
}
