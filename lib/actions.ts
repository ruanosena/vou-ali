"use server";

import { Prisma } from "@prisma/client";
import prisma from "./prisma";
import { Centro, isCirculo, isRetangulo } from "@/types";
import slugify from "slugify";

export async function addCentro(formData: FormData) {
  const rawData = Object.fromEntries(formData.entries()) as unknown as Centro;
  rawData.slug = slugify(rawData.nome, { lower: true });
  if (isCirculo(rawData)) {
    rawData.tipo = "CIRCULO";
    rawData.raio = Number(rawData.raio);
    rawData.lat = new Prisma.Decimal(rawData.lat);
    rawData.lng = new Prisma.Decimal(rawData.lng);
  } else if (isRetangulo(rawData)) {
    rawData.tipo = "RETANGULO";
    rawData.leste = new Prisma.Decimal(rawData.leste);
    rawData.norte = new Prisma.Decimal(rawData.norte);
    rawData.sul = new Prisma.Decimal(rawData.sul);
    rawData.oeste = new Prisma.Decimal(rawData.oeste);
  }
  try {
    await prisma.area.create({ data: rawData });
    return { error: null };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return { error: error.message };
      }
    }
    throw error;
  }
}
