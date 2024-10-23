export type PesquisaTipo = "Endereco" | "Local";
export interface Pesquisa {
  id: string;
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
}

export interface Local {
  id: string;
  lat: number;
  lng: number;
  nome: string;
  slug: string;
  apelidos: LocalApelido[];
  endereco?: Endereco;
  site?: string | null;
  telefone?: string | null;
  telefoneFormatado?: string | null;
  redesSociais: RedeSocial[];
  publicado: boolean;
  usuario?: Usuario;
}

export interface Usuario {
  nome?: string | null;
  email: string;
}

export interface LocalApelido {
  apelido: string;
}

export interface RedeSocial {
  nome: RedeSocialNome;
  link: string;
}

export enum RedeSocialNome {
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
