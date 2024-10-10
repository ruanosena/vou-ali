import prisma from "@/lib/prisma";
import { Fragment } from "react";
import { Local } from "./components/Local";
import { MapCenter } from "./components/MapCenter";
import { redirect } from "next/navigation";
import { SelectCentro } from "./components/SelectCentro";
import { Centro, isCirculo, isRetangulo } from "@/types";

async function getCentros() {
  const centros = prisma.area.findMany();
  return centros;
}

async function getLocais() {
  const locais = prisma.local.findMany({
    where: { Ponto: { every: { publicado: true } } },
    include: { Ponto: { select: { nome: true, id: true } } },
  });
  return locais;
}

export default async function Home() {
  let centros: Centro[] = await getCentros();

  if (!centros.length) {
    redirect("/add");
  } else {
    centros = centros.map((c) => {
      if (isCirculo(c)) {
        return { ...c, lat: Number(c.lat), lng: Number(c.lng) };
      } else if (isRetangulo(c)) {
        return { ...c, leste: Number(c.leste), norte: Number(c.norte), sul: Number(c.sul), oeste: Number(c.oeste) };
      }
      return c; // type-safe
    });
  }

  return (
    <Fragment>
      {/* <MapCenter /> */}

      <SelectCentro centros={centros} />

      {/* {locais.map(({ id, endereco, lat, lng, Ponto }) => (
          <Local key={id} endereco={endereco} lat={lat} lng={lng} ponto={Ponto} />
        ))} */}

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
