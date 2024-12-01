"use client";

import * as React from "react";
import { useRouter } from "next/navigation"; // Para redirecionar o usuário

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = React.useState("");
  const [cpf, setCpf] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [error, setError] = React.useState("");
  const [message, setMessage] = React.useState("");

  const handleSignup = async () => {
    setError("");
    setMessage("");

    if (password !== confirmPassword) {
      setError("As senhas não coincidem. Tente novamente.");
      return;
    }

    try {
      const response = await fetch("http://127.0.0.1:8000/users/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nome: name,
          cpf,
          email,
          senha: password,
          perfil: "cliente", // Valor fixo do perfil
        }),
      });

      if (!response.ok) {
        throw new Error("Erro no cadastro");
      }

      setMessage("Cadastro realizado com sucesso! Você já pode fazer login.");
    } catch (error) {
      setError("Erro no cadastro. Tente novamente.");
    }
  };

  const goToLogin = () => {
    router.push("/login"); // Redireciona para a rota de login
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center space-y-6 bg-[#FFD922]">
      <h1 className="text-5xl font-semibold mb-6">Cadastre-se</h1>
      <div className="flex flex-col space-y-4 w-80">
        <input
          type="text"
          placeholder="Nome"
          className="p-2 border rounded"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="text"
          placeholder="CPF"
          className="p-2 border rounded"
          value={cpf}
          onChange={(e) => setCpf(e.target.value)}
        />
        <input
          type="email"
          placeholder="Email"
          className="p-2 border rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Senha"
          className="p-2 border rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <input
          type="password"
          placeholder="Confirme a Senha"
          className="p-2 border rounded"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
        {error && <p className="text-red-500">{error}</p>}
        {message && <p className="text-green-500">{message}</p>}
        <button
          onClick={handleSignup}
          className="p-2 bg-[#067c8a] text-white rounded"
        >
          Cadastre-se
        </button>
        {message && (
          <button
            onClick={goToLogin}
            className="p-2 bg-[#067c8a] text-white rounded mt-4"
          >
            Ir para login
          </button>
        )}
      </div>
    </div>
  );
}
