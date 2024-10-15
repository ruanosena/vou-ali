export interface Local {
  enderecoFormatado: string;
  lat: number;
  lng: number;
  norte?: number;
  sul?: number;
  leste?: number;
  oeste?: number;
}

export interface Ponto {
  lat: number;
  lng: number;
  nome: string;
  slug: string;
  pseudonimos: string[];
  local: Local;
  site?: string | null;
  telefone?: string | null;
  telefoneFormatado?: string | null;
  social: Social[];
  publicado: boolean;
  usuario: Usuario;
}

export interface Usuario {
  nome?: string | null;
  email: string;
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
