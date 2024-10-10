import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";

async function getCentro(idOrSlug: string) {
  const centro = prisma.area.findFirst({
    where: {
      OR: [{ id: parseInt(idOrSlug) || undefined }, { slug: idOrSlug }],
    },
  });
  return centro;
}

export default async function Centro({ params: { idOrSlug } }: { params: { idOrSlug: string } }) {
  const centro = await getCentro(idOrSlug);
  if (!centro) return notFound();
  console.log(centro);

  return (
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
  );
}
