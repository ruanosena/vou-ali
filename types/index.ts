import type { Prisma } from "@prisma/client";

export interface Circulo {
  raio: number;
  lat: Prisma.Decimal | number;
  lng: Prisma.Decimal | number;
}
export interface Retangulo {
  leste: Prisma.Decimal | number;
  norte: Prisma.Decimal | number;
  sul: Prisma.Decimal | number;
  oeste: Prisma.Decimal | number;
}
export interface Centro extends Partial<Nullable<Circulo>>, Partial<Nullable<Retangulo>> {
  id: number;
  nome: string;
  slug: string;
  tipo: "CIRCULO" | "RETANGULO";
}

export function isCirculo(area: Omit<Centro, "nome" | "slug" | "tipo" | "id">): area is Circulo {
  return (
    (area as Centro).tipo === "CIRCULO" || (area.raio != undefined && area.lat != undefined && area.lng != undefined)
  );
}

export function isRetangulo(area: Omit<Centro, "nome" | "slug" | "tipo" | "id">): area is Retangulo {
  return (
    (area as Centro).tipo === "RETANGULO" ||
    (area.norte != undefined && area.sul != undefined && area.leste != undefined && area.oeste != undefined)
  );
}

type Nullable<T> = {
  [P in keyof T]: T[P] | null;
};
