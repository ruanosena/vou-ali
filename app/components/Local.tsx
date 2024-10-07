import { Decimal } from "@prisma/client/runtime/library";
import { Fragment } from "react";

interface Props {
  ponto: { id: string; nome: string }[];
  endereco: string;
  lat: Decimal;
  lng: Decimal;
}

export function Local({ endereco, lat, lng, ponto }: Props) {
  return (
    <article className="flex w-full flex-col gap-y-6">
      <header>
        <h2 className="space-y-4 text-lg text-gray-300 sm:text-xl">{endereco}</h2>
        {ponto.map(({ id, nome }) => (
          <h3 key={id} className="text-2xl sm:text-3xl">
            {nome}
          </h3>
        ))}
      </header>
      <iframe
        className="aspect-[4/3] h-auto max-h-screen w-full"
        src={`https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&q=${lat},${lng}`}
        style={{ border: 0 }}
        allowFullScreen={true}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      ></iframe>
    </article>
  );
}
