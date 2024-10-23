"use server";

import { Prisma } from "@prisma/client";
import prisma from "./prisma";
import slugify from "slugify";
import { Endereco, Local, Usuario } from "@/types";

export async function createLocal(formData: FormData) {
  const rawData = Object.fromEntries(formData.entries()) as unknown as Local;
  rawData.slug = slugify(rawData.nome, { lower: true });
  rawData.apelidos = JSON.parse(rawData.apelidos as unknown as string);
  rawData.endereco = JSON.parse(rawData.endereco as unknown as string);
  rawData.redesSociais = JSON.parse(rawData.redesSociais as unknown as string);
  rawData.usuario = JSON.parse(rawData.usuario as unknown as string);

  const data: Local = rawData;

  const endereco = await createOrGetEndereco(rawData.endereco!);
  const usuario = await createOrGetUsuario(rawData.usuario!);

  await prisma.local.create({
    data: {
      nome: data.nome,
      slug: data.slug,
      lat: new Prisma.Decimal(data.lat),
      lng: new Prisma.Decimal(data.lng),
      apelidos: { createMany: { data: data.apelidos } },
      redesSociais: { createMany: { data: data.redesSociais } },
      enderecoId: endereco.id,
      usuarioId: usuario.id,
    },
  });
}

async function createOrGetEndereco(rawData: Endereco) {
  return await prisma.endereco.upsert({
    where: { posicao: { lat: new Prisma.Decimal(rawData.lat), lng: new Prisma.Decimal(rawData.lng) } },
    update: {},
    create: {
      enderecoFormatado: rawData.enderecoFormatado,
      lat: new Prisma.Decimal(rawData.lat),
      lng: new Prisma.Decimal(rawData.lng),
      norte: rawData.norte ? new Prisma.Decimal(rawData.norte) : undefined,
      sul: rawData.sul ? new Prisma.Decimal(rawData.sul) : undefined,
      leste: rawData.leste ? new Prisma.Decimal(rawData.leste) : undefined,
      oeste: rawData.oeste ? new Prisma.Decimal(rawData.oeste) : undefined,
    },
  });
}

async function createOrGetUsuario(data: Usuario) {
  return await prisma.usuario.upsert({
    where: { email: data.email },
    update: {},
    create: data,
  });
}
