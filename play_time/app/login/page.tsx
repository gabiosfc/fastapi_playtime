"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation"; // Hook para redirecionar

export default function LoginPage() {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState("");

  const router = useRouter(); // Inicializa o hook useRouter

  const handleLogin = async () => {
    setError("");

    try {
      const response = await fetch("http://127.0.0.1:8000/auth/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          grant_type: "password",
          username: email,
          password: password,
          scope: "",
          client_id: "string",
          client_secret: "string",
        }),
      });

      if (!response.ok) {
        throw new Error("Falha na autenticação");
      }

      const data = await response.json();
      const token = data.access_token; // Token da resposta

      // Armazenando o token no localStorage
      localStorage.setItem("access_token", token);

      // Redirecionando para a tela Home
      router.push("/home"); // Substitua "/home" pela rota correta
    } catch (error) {
      setError("Falha na autenticação. Verifique suas credenciais e tente novamente.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center space-y-6 bg-[#FFD922]">
      <h1 className="text-5xl font-semibold mb-6">PlayTime</h1>
      <div className="flex flex-col space-y-4 w-80">
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
        {error && <p className="text-red-500">{error}</p>}
        <button
          onClick={handleLogin}
          className="p-2 bg-[#067c8a] text-white rounded"
        >
          Login
        </button>
        <div className="flex flex-col items-center mt-4 space-y-2">
          <Link href="/esqueciSenha" legacyBehavior>
            <a className="text-sm text-blue-500 hover:underline">Esqueci minha senha</a>
          </Link>
          <Link href="/cadastro" legacyBehavior>
            <a className="text-sm text-blue-500 hover:underline">Cadastre-se</a>
          </Link>
        </div>
      </div>
    </div>
  );
}
