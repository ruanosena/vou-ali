import prisma from "@/lib/prisma";
import { Fragment } from "react";

async function getLocais() {
  const locais = prisma.local.findMany({
    where: { Ponto: { every: { publicado: true } } },
    include: { Ponto: { select: { nome: true, id: true } } },
  });
  return locais;
}

export default async function Home() {
  const locais = await getLocais();

  return (
    <Fragment>
      <section className="flex min-h-screen items-center bg-foreground">
        <div className="relative mx-auto max-w-7xl flex-col px-4 sm:static sm:px-6 lg:px-8">
          <div className="sm:max-w-lg">
            <h1 className="text-xl font-bold tracking-tight text-gray-900 sm:text-3xl">
              Adicione seus dados a nosso site
            </h1>
            <p className="mt-4 text-lg text-gray-500">
              Aproxime-se de seu público de maneira online, sem perder mais clientes por causa de uma pequena
              informação.
            </p>
          </div>
          <div>
            <div className="mt-10">
              <a
                href="/ponto/add"
                className="inline-block rounded-md border border-transparent bg-indigo-600 px-8 py-3 text-center font-medium text-white hover:bg-indigo-700"
              >
                Informe seu negócio
              </a>
            </div>
          </div>
        </div>
      </section>
    </Fragment>
  );
}
