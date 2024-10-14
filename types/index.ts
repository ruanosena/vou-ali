export interface Local {
  enderecoFormatado: string;
  lat: number;
  lng: number;
  norte?: number;
  sul?: number;
  leste?: number;
  oeste?: number;
}

export enum SocialNome {
  WhatsApp = "WHATSAPP",
  Instagram = "INSTAGRAM",
  Facebook = "FACEBOOK",
  Telegram = "TELEGRAM",
  "E-mail" = "EMAIL",
}
