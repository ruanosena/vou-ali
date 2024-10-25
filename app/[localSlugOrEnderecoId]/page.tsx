import prisma from "@/lib/prisma";
import { Endereco, isEndereco, isLocal, Local } from "@/types";
import { notFound } from "next/navigation";
import { transformEndereco, transformLocal } from "@/lib/utils";

async function queryLocal(slug: string) {
  const result = await prisma.local.findUnique({
    include: { redesSociais: true, apelidos: true, endereco: true },
    where: { publicado: true, slug },
  });
  if (result) {
    return {
      ...transformLocal(result),
      endereco: transformEndereco(result.endereco),
    } as Local;
  }
}

async function queryEndereco(id: string) {
  const result = await prisma.endereco.findFirst({
    include: { locais: { where: { publicado: true } } },
    where: { id, locais: { some: { publicado: true } } },
  });
  if (result) {
    return {
      ...transformEndereco(result),
      locais: result.locais.map((local) => transformLocal(local)),
    } as unknown as Endereco;
  }
}

async function getPlace(localSlugOrEnderecoId: string) {
  let isEnderecoId = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(localSlugOrEnderecoId);
  return isEnderecoId ? await queryEndereco(localSlugOrEnderecoId) : await queryLocal(localSlugOrEnderecoId);
}

export default async function LocalPage({
  params: { localSlugOrEnderecoId },
}: {
  params: { localSlugOrEnderecoId: string };
}) {
  const data = await getPlace(localSlugOrEnderecoId);

  if (!data) return notFound();

  return (
    <div>
      page {data?.id}
      <code>{JSON.stringify(data, null, 2)}</code>
    </div>
  );
}