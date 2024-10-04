import prisma from "@/lib/prisma";
import { Local } from "./components/Local";
import { AddLocal } from "./components/AddLocal";
import { Fragment } from "react";

async function getLocais() {
  const locais = prisma.local.findMany({
    where: { Ponto: { isNot: null } },
    include: { Ponto: { select: { titulo: true } } },
  });
  return locais;
}

export default async function Home() {
  const locais = await getLocais();

  return (
    <Fragment>
      <main>
        <div className="relative flex min-h-screen flex-col items-center justify-center">
          <label
            htmlFor="destino"
            className="absolute left-1/2 top-1/2 block -translate-x-1/2 -translate-y-[calc(50%_+_2rem)] text-xl font-medium leading-6 text-gray-100 sm:text-2xl"
          >
            Pesquisar
          </label>
          <div className="relative mt-2 rounded-md shadow-sm">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <span className="text-lg text-gray-500 sm:text-xl">&#x1F4CD;</span>
            </div>
            <input
              type="text"
              name="destino"
              id="destino"
              className="block w-full rounded-md border-0 py-1.5 pl-10 pr-6 text-xl text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-2xl sm:leading-6"
              placeholder="Nome do lugar"
            />
          </div>
        </div>

        <section className="flex min-h-screen items-center bg-white">
          <div className="relative mx-auto max-w-7xl flex-col px-4 sm:static sm:px-6 lg:px-8">
            <div className="sm:max-w-lg">
              <h1 className="text-xl font-bold tracking-tight text-gray-900 sm:text-3xl">
                Adicione seus dados a nosso site
              </h1>
              <p className="mt-4 text-lg text-gray-500">
                Aproxime-se deu seu público de maneira online, sem perder mais clientes por causa de uma pequena
                informação.
              </p>
            </div>
            <div>
              <div className="mt-10">
                <a
                  href="#"
                  className="inline-block rounded-md border border-transparent bg-indigo-600 px-8 py-3 text-center font-medium text-white hover:bg-indigo-700"
                >
                  Informe seu negócio
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="p-2 text-center">
        Feito com &#x2763; por{" "}
        <a className="underline underline-offset-2" target="_blank" href="https://github.com/ruanosena">
          ruanosena
        </a>
      </footer>
    </Fragment>
  );
}
