export interface Local {
  id: string;
  enderecoFormatado: string;
  lat: number;
  lng: number;
  norte?: number | null;
  sul?: number | null;
  leste?: number | null;
  oeste?: number | null;
}

export interface Ponto {
  id: string;
  lat: number;
  lng: number;
  nome: string;
  slug: string;
  apelidos: Apelido[];
  local: Local;
  site?: string | null;
  telefone?: string | null;
  telefoneFormatado?: string | null;
  social: Social[];
  publicado: boolean;
  usuario?: Usuario;
}

export interface Usuario {
  nome?: string | null;
  email: string;
}

export interface Apelido {
  apelido: string;
}

export interface Social {
  nome: SocialNome;
  link: string;
}

export enum SocialNome {
  WhatsApp = "WHATSAPP",
  Instagram = "INSTAGRAM",
  Facebook = "FACEBOOK",
  Telegram = "TELEGRAM",
  "E-mail" = "EMAIL",
}

export type GeoCookieValue = {
  ip: string;
  country: string;
  lat: number;
  lng: number;
};
