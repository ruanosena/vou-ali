import type { Prisma } from "@prisma/client";

export interface Circulo {
  raio: number;
  lat: Prisma.Decimal;
  lng: Prisma.Decimal;
}
export interface Retangulo {
  leste: Prisma.Decimal;
  norte: Prisma.Decimal;
  sul: Prisma.Decimal;
  oeste: Prisma.Decimal;
}
export interface Centro extends Partial<Circulo>, Partial<Retangulo> {
  nome: string;
  slug: string;
  tipo: "CIRCULO" | "RETANGULO";
}

export function isCirculo(area: Omit<Centro, "nome" | "slug" | "tipo">): area is Circulo {
  return (
    (area as Centro).tipo === "CIRCULO" || (area.raio != undefined && area.lat != undefined && area.lng != undefined)
  );
}

export function isRetangulo(area: Omit<Centro, "nome" | "slug" | "tipo">): area is Retangulo {
  return (
    (area as Centro).tipo === "RETANGULO" ||
    (area.norte != undefined && area.sul != undefined && area.leste != undefined && area.oeste != undefined)
  );
}
