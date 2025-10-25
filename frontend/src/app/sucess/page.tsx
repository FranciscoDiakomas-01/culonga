export default function Success() {
  return (
    <main className="flex  flex-col items-center justify-center min-h-screen bg-gradient-to-b from-green-50 to-green-100 px-6">
      <div className="bg-white shadow-lg rounded-2xl p-10 text-center max-w-md w-full">
        <div className="flex justify-center mb-4">
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
        </div>

        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          🎉 Parabéns! Sua compra foi concluída com sucesso
        </h1>

        <p className="text-gray-600 mb-6">
          Verifique seu <span className="font-semibold">e-mail</span> para
          acessar o seu material. Caso não encontre, olhe também na pasta de{" "}
          <em>Spam</em> ou <em>Promoções</em>.
        </p>

        <a
          href="/"
          className="inline-block bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-6 rounded-full transition-all duration-300"
        >
          Voltar à página inicial
        </a>
      </div>

      <footer className="mt-8 text-gray-500 text-sm">
        © {new Date().getFullYear()} — Culonga Todos os direitos reservados.
      </footer>
    </main>
  );
}
