import { $Enums } from "@prisma/client";

export const MAX_APELIDOS = 5;

export const REDE_SOCIAL_NOME: Record<$Enums.RedeSocialNome, string> = {
  WHATSAPP: "WhatsApp",
  INSTAGRAM: "Instagram",
  FACEBOOK: "Facebook",
  TELEGRAM: "Telegram",
  EMAIL: "E-mail",
};

export const REDE_SOCIAL_PLACEHOLDER: Record<$Enums.RedeSocialNome, string> = {
  EMAIL: "mailto:email@provedor.com.br",
  FACEBOOK: "https://www.facebook.com/perfil",
  INSTAGRAM: "https://www.instagram.com/perfil",
  WHATSAPP: "https://api.whatsapp.com/send?phone=######",
  TELEGRAM: "https://t.me/+#####",
};

export const MAX_SUGGESTIONS = 8;
