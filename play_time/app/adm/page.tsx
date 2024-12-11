"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import MenuSuspenso from "../menu/page";

type Quadra = {
  id: number;
  nome: string;
  descricao: string;
  disponivel: boolean;
};

export default function AdminQuadras() {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [quadras, setQuadras] = React.useState<Quadra[]>([]);
  const [novaQuadra, setNovaQuadra] = React.useState({
    nome: "",
    descricao: "",
    disponivel: true,
  });
  const [editandoQuadra, setEditandoQuadra] = React.useState<Quadra | null>(null);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const getToken = () => localStorage.getItem("access_token");

  const fetchQuadras = async () => {
    try {
      const token = getToken();
      const response = await fetch("http://127.0.0.1:8000/quadras/", {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error(`Erro ${response.status}`);
      const data: Quadra[] = await response.json();
      setQuadras(data);
    } catch (error) {
      console.error("Erro ao carregar quadras:", error);
    }
  };

  const handleCreate = async () => {
    try {
      const token = getToken();
      const response = await fetch("http://127.0.0.1:8000/quadras/", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(novaQuadra),
      });
      if (response.ok) {
        alert("Quadra criada com sucesso!");
        setNovaQuadra({ nome: "", descricao: "", disponivel: true });
        fetchQuadras();
      } else {
        const errorData = await response.json();
        console.error("Erro ao criar quadra:", errorData);
        alert("Erro ao criar quadra.");
      }
    } catch (error) {
      console.error("Erro ao criar quadra:", error);
    }
  };

  const handleEdit = async () => {
    if (!editandoQuadra) return;
    try {
      const token = getToken();
      const response = await fetch(`http://127.0.0.1:8000/quadras/${editandoQuadra.id}/`, {
        method: "PATCH",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editandoQuadra),
      });
      if (response.ok) {
        alert("Quadra atualizada com sucesso!");
        setEditandoQuadra(null);
        fetchQuadras();
      } else {
        const errorData = await response.json();
        console.error("Erro ao atualizar quadra:", errorData);
        alert("Erro ao atualizar quadra.");
      }
    } catch (error) {
      console.error("Erro ao atualizar quadra:", error);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const token = getToken();
      const response = await fetch(`http://127.0.0.1:8000/quadras/${id}/`, {
        method: "DELETE",
        headers: {
          Accept: "*/*",
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        alert("Quadra deletada com sucesso!");
        setQuadras(quadras.filter((quadra) => quadra.id !== id));
      } else {
        const errorData = await response.json();
        console.error("Erro ao deletar quadra:", errorData);
        alert("Erro ao deletar quadra.");
      }
    } catch (error) {
      console.error("Erro ao deletar quadra:", error);
    }
  };

  React.useEffect(() => {
    fetchQuadras();
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <div className="w-full bg-[#FFD922] text-black p-4 fixed top-0 left-0 right-0 z-10">
        <div className="flex justify-between items-center">
          <MenuSuspenso isMenuOpen={isMenuOpen} toggleMenu={toggleMenu} />
          <div className="flex-1 text-center">
            <h1 className="text-2xl font-semibold">PlayTime - Admin</h1>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center flex-1 pt-24 px-6">
        <h2 className="text-2xl font-semibold mb-6">Gerenciar Quadras</h2>

        <div className="w-full max-w-md mb-8">
          <h3 className="font-semibold mb-2">Nova Quadra</h3>
          <input
            type="text"
            placeholder="Nome"
            value={novaQuadra.nome}
            onChange={(e) => setNovaQuadra({ ...novaQuadra, nome: e.target.value })}
            className="w-full p-2 border rounded mb-2"
          />
          <textarea
            placeholder="Descrição"
            value={novaQuadra.descricao}
            onChange={(e) => setNovaQuadra({ ...novaQuadra, descricao: e.target.value })}
            className="w-full p-2 border rounded mb-2"
          />
          <label className="flex items-center mb-4">
            <input
              type="checkbox"
              checked={novaQuadra.disponivel}
              onChange={(e) => setNovaQuadra({ ...novaQuadra, disponivel: e.target.checked })}
              className="mr-2"
            />
            Disponível
          </label>
          <button
            onClick={handleCreate}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Criar Quadra
          </button>
        </div>

        {editandoQuadra && (
          <div className="w-full max-w-md mb-8">
            <h3 className="font-semibold mb-2">Editar Quadra</h3>
            <input
              type="text"
              placeholder="Nome"
              value={editandoQuadra.nome}
              onChange={(e) => setEditandoQuadra({ ...editandoQuadra, nome: e.target.value })}
              className="w-full p-2 border rounded mb-2"
            />
            <textarea
              placeholder="Descrição"
              value={editandoQuadra.descricao}
              onChange={(e) => setEditandoQuadra({ ...editandoQuadra, descricao: e.target.value })}
              className="w-full p-2 border rounded mb-2"
            />
            <label className="flex items-center mb-4">
              <input
                type="checkbox"
                checked={editandoQuadra.disponivel}
                onChange={(e) => setEditandoQuadra({ ...editandoQuadra, disponivel: e.target.checked })}
                className="mr-2"
              />
              Disponível
            </label>
            <button
              onClick={handleEdit}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Salvar Alterações
            </button>
            <button
              onClick={() => setEditandoQuadra(null)}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 ml-2"
            >
              Cancelar
            </button>
          </div>
        )}

        <ul className="space-y-4 w-full">
          {quadras.map((quadra) => (
                        <li key={quadra.id} className="border p-4 rounded-lg bg-white shadow-md">
                        <p>
                          <strong>Nome:</strong> {quadra.nome}
                        </p>
                        <p>
                          <strong>Descrição:</strong> {quadra.descricao}
                        </p>
                        <p>
                          <strong>Disponível:</strong> {quadra.disponivel ? "Sim" : "Não"}
                        </p>
                        <div className="flex space-x-2 mt-4">
                          <button
                            onClick={() => setEditandoQuadra(quadra)}
                            className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleDelete(quadra.id)}
                            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                          >
                            Deletar
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          }
          