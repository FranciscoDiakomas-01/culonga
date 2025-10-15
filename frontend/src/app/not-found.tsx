"use client";

import { useRouter } from "next/navigation";

export default function NotFound() {
  const router = useRouter();
  return (
    <>
      <main className=" min-h-screen grid  place-items-center bg-gray-900 text-white px-6 py-24 sm:py-32 lg:px-8">
        <div className="text-center">
          <p className="text-base font-semibold text-orange-600">404</p>
          <h1 className="mt-4 text-5xl font-semibold tracking-tight text-balance text-white sm:text-7xl">
            Ops,
          </h1>
          <p className="mt-6 text-lg font-medium text-pretty text-gray-500 sm:text-xl/8">
            Essa página não existe
          </p>
          <p></p>
          <div className="mt-10 flex items-center justify-center gap-x-6 lg:w-[80%] w-full place-self-center md:flex-row flex-col gap-6">
            <a
              href="#"
              className="rounded-md bg-orange-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-orange-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600 w-full text-nowrap"
              onClick={() => {
                router.push("/");
              }}
            >
              Voltar para home
            </a>
            <a
              href="https://wa.me/244936588301?text=Ol%C3%A1%2C%20quero%20saber%20mais%20sobre%20a%20culonga.%20Poderia%20me%20ajudar%3F"
              className="rounded-md border border-white/10 px-3.5 py-2.5 text-sm font-semibold text-white shadow-xs  focus-visible:outline-2 focus-visible:outline-offset-2  w-full"
            >
              Suporte
            </a>
          </div>
        </div>
      </main>
    </>
  );
}
