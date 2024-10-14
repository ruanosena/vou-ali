"use server";

import { Prisma } from "@prisma/client";
import prisma from "./prisma";
import slugify from "slugify";
import { Local, Ponto, Usuario } from "@/types";

export async function createPonto(formData: FormData) {
  const rawData = Object.fromEntries(formData.entries()) as unknown as Ponto;
  rawData.slug = slugify(rawData.nome, { lower: true });
  rawData.pseudonimos = JSON.parse(rawData.pseudonimos as unknown as string);
  rawData.local = JSON.parse(rawData.local as unknown as string);
  rawData.social = JSON.parse(rawData.social as unknown as string);
  rawData.usuario = JSON.parse(rawData.usuario as unknown as string);

  const data: Ponto = rawData;

  const local = await createOrGetLocal(rawData.local);
  const usuario = await createOrGetUsuario(rawData.usuario);

  const ponto = await prisma.ponto.create({
    data: {
      nome: data.nome,
      slug: data.slug,
      lat: new Prisma.Decimal(data.lat),
      lng: new Prisma.Decimal(data.lng),
      social: { createMany: { data: data.social } },
      localId: local.id,
      usuarioId: usuario.id,
    },
  });
  console.log(ponto);
}

async function createOrGetLocal(rawData: Local) {
  return await prisma.local.upsert({
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
