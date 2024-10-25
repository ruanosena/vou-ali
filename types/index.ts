import { $Enums, Prisma } from "@prisma/client";

export type PesquisaTipo = "Endereco" | "Local";
export interface Pesquisa {
  id: string;
  slug?: string;
  nome: string;
  lat: number;
  lng: number;
  tipo: PesquisaTipo;
  distancia?: number;
}

export interface Endereco {
  id: string;
  enderecoFormatado: string;
  lat: number;
  lng: number;
  norte?: number | null;
  sul?: number | null;
  leste?: number | null;
  oeste?: number | null;
  locais?: Local[];
}

export function isEndereco(data: Endereco | Local): data is Endereco {
  return typeof (data as Endereco).enderecoFormatado === "string";
}

export interface Local {
  id: string;
  lat: number;
  lng: number;
  nome: string;
  slug: string;
  apelidos: LocalApelido[];
  endereco: Endereco;
  site?: string | null;
  telefone?: string | null;
  telefoneFormatado?: string | null;
  redesSociais: RedeSocial[];
  publicado: boolean;
  usuario?: Usuario;
}

export function isLocal(data: Endereco | Local): data is Local {
  return !!(data as Local).slug;
}

export interface Usuario {
  nome?: string | null;
  email: string;
}

export interface LocalApelido {
  id: number;
  apelido: string;
}

export interface RedeSocial {
  id: string;
  nome: $Enums.RedeSocialNome;
  link: string;
}

export type GeoCookieValue = {
  ip: string;
  country: string;
  lat: number;
  lng: number;
};
