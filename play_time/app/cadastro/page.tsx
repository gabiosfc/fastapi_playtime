"use client";

import * as React from "react";

export default function SignupPage() {
  const [name, setName] = React.useState("");
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
      const response = await fetch("/api/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      });

      if (!response.ok) {
        throw new Error("Erro no cadastro");
      }

      setMessage("Cadastro realizado com sucesso! Você já pode fazer login.");
    } catch (error) {
      setError("Erro no cadastro. Tente novamente.");
    }
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
      </div>
    </div>
  );
}
