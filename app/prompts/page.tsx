"use client";

import { useEffect, useState } from "react";

export default function PromptsPage() {
  const [prompts, setPrompts] = useState<string[]>([]);
  const [newPrompt, setNewPrompt] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const fetchPrompts = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await fetch("/api/prompts", { cache: "no-store" });
      if (!res.ok) throw new Error(await res.text());
      const data = (await res.json()) as string[];
      setPrompts(data);
    } catch (e) {
      setError("No se pudieron cargar los prompts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrompts();
  }, []);

  const handleAdd = async () => {
    const trimmed = newPrompt.trim();
    if (!trimmed) return;
    try {
      setLoading(true);
      setError("");
      const res = await fetch("/api/prompts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: trimmed }),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = (await res.json()) as { prompts: string[] };
      setPrompts(data.prompts);
      setNewPrompt("");
    } catch (e) {
      setError("No se pudo agregar el prompt");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (index: number, value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return;
    try {
      setLoading(true);
      setError("");
      const res = await fetch("/api/prompts", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ index, prompt: trimmed }),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = (await res.json()) as { prompts: string[] };
      setPrompts(data.prompts);
    } catch (e) {
      setError("No se pudo actualizar el prompt");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (index: number) => {
    try {
      setLoading(true);
      setError("");
      const res = await fetch("/api/prompts", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ index }),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = (await res.json()) as { prompts: string[] };
      setPrompts(data.prompts);
    } catch (e) {
      setError("No se pudo eliminar el prompt");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4 mt-24">
      <h1 className="text-xl font-semibold mb-4">Prompts del cliente</h1>
      <p className="text-sm text-gray-600 mb-4">
        Estos prompts se envían como mensajes de usuario antes de la conversación para moldear el comportamiento del chat.
      </p>

      <div className="flex gap-2 mb-6">
        <input
          type="text"
          className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm"
          placeholder="Agregar nuevo prompt"
          value={newPrompt}
          onChange={(e) => setNewPrompt(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleAdd();
          }}
        />
        <button
          onClick={handleAdd}
          disabled={!newPrompt.trim() || loading}
          className="bg-slate-600 hover:bg-slate-700 text-white text-sm rounded px-4 py-2 disabled:opacity-50"
        >
          Agregar
        </button>
      </div>

      {error && <div className="text-red-600 text-sm mb-3">{error}</div>}

      {loading && <div className="text-sm text-gray-500 mb-3">Cargando...</div>}

      <ul className="space-y-3">
        {prompts.map((p, i) => (
          <li key={i} className="border border-gray-200 rounded p-3 bg-slate-500">
            <textarea
              className="w-full text-sm border border-gray-200 rounded p-2 mb-2 "
              rows={2}
              defaultValue={p}
              onBlur={(e) => {
                if (e.target.value !== p) handleUpdate(i, e.target.value);
              }}
            />
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-900">#{i}</span>
              <button
                onClick={() => handleDelete(i)}
                className="text-xs text-white bg-red-500 hover:bg-red-600 px-3 py-1 rounded"
              >
                Eliminar
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}


