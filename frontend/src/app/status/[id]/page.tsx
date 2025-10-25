"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function SuccessPage() {
  const searchParams = useSearchParams();
  const [data, setData] = useState<{
    estado: boolean;
    mensagem: string;
    code: number;
  } | null>(null);

  useEffect(() => {
    const rawData = searchParams.get("data");
    if (rawData) {
      try {
        const parsed = JSON.parse(rawData);
        setData(parsed);
        console.log(parsed);
      } catch (error) {
        console.error("Erro ao analisar os dados da URL:", error);
      }
    }
  }, [searchParams]);

  if (!data) {
    return (
      <main className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <h1 className="text-xl font-semibold text-gray-700">Carregando...</h1>
        </div>
      </main>
    );
  }

  const isSuccess = data.estado === true;

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-green-50 to-green-100 px-6">
      <div
        className={`bg-white shadow-lg rounded-2xl p-8 text-center max-w-md w-full border-t-4 ${
          isSuccess ? "border-green-500" : "border-red-500"
        }`}
      >
        <div className="flex justify-center mb-4">
          {isSuccess ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-16 w-16 text-green-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12l2 2l4 -4m5 2a9 9 0 1 1 -18 0a9 9 0 0 1 18 0z"
              />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-16 w-16 text-red-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m0 3.75h.01m9.24-3.75a9.25 9.25 0 1 1-18.5 0a9.25 9.25 0 0 1 18.5 0z"
              />
            </svg>
          )}
        </div>
        <h1
          className={`text-2xl font-bold mb-2 ${
            isSuccess ? "text-green-600" : "text-red-600"
          }`}
        >
          {isSuccess
            ? "Pagamento concluído com sucesso!"
            : "Falha no pagamento"}
        </h1>
        <p className="text-gray-600 mb-6">{data.mensagem}</p>
        <a
          href="/"
          className={`inline-block ${
            isSuccess
              ? "bg-green-500 hover:bg-green-600"
              : "bg-red-500 hover:bg-red-600"
          } text-white font-semibold py-2 px-6 rounded-full transition-all duration-300`}
        >
          Voltar à página inicial
        </a>
      </div>

      <footer className="mt-8 text-gray-500 text-sm">
        © {new Date().getFullYear()} — Culonga
      </footer>
    </main>
  );
}
