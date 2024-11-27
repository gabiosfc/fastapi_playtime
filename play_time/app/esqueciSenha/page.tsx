"use client";

import * as React from "react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = React.useState("");
  const [message, setMessage] = React.useState("");

  const handleResetPassword = async () => {
    setMessage("");

    try {
      const response = await fetch("/api/forgotPassword", {
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
    } catch (error) {
      setMessage("Erro ao enviar o email. Tente novamente.");
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
