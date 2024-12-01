"use client";

import * as React from "react";
import { useRouter } from "next/navigation"; // Para redirecionar o usuário

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = React.useState("");
  const [error, setError] = React.useState("");
  const [message, setMessage] = React.useState("");

  const handleResetPassword = async () => {
    setError("");
    setMessage("");

    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setError("Por favor, insira um email válido.");
      return;
    }

    try {
      const response = await fetch("http://127.0.0.1:8000/forgotPassword", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error("Falha ao enviar email de recuperação de senha");
      }

      setMessage("Email de recuperação de senha enviado com sucesso. Verifique sua caixa de entrada.");
      setTimeout(() => router.push("/login"), 3000); // Redireciona para login após 3 segundos
    } catch (error) {
      setError("Erro ao enviar o email. Tente novamente.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center space-y-6 bg-[#FFD922]">
      <h1 className="text-5xl font-semibold mb-6">Recuperar Senha</h1>
      <div className="flex flex-col space-y-4 w-80">
        <input
          type="email"
          placeholder="Email"
          className="p-2 border rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        {error && <p className="text-red-500">{error}</p>}
        {message && <p className="text-green-500">{message}</p>}
        <button
          onClick={handleResetPassword}
          className="p-2 bg-[#067c8a] text-white rounded"
        >
          Enviar email de recuperação
        </button>
      </div>
    </div>
  );
}
