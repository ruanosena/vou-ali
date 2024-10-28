import { cn } from "@/lib/utils";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Local } from "@/types";
import { REDE_SOCIAL_NOME } from "@/lib/constants";

import { SocialIcon } from "react-social-icons";
import Link from "next/link";

interface Props extends React.HTMLAttributes<HTMLDivElement> {
  data: Local;
}

function LocalPanel({ data, className, ...props }: Props) {
  const [open, setOpen] = React.useState(true);

  return open ? (
    <Card className={cn("m-6 max-w-72 text-sm sm:max-w-80", className)} {...props}>
      <CardHeader className="py-3">
        <CardTitle className="text-base">{data.nome}</CardTitle>
        {data.endereco.enderecoFormatado && <CardDescription>{data.endereco.enderecoFormatado}</CardDescription>}
      </CardHeader>
      <CardContent
        className={cn("max-h-[calc(100vh_-_12rem)] cursor-auto overflow-y-scroll px-6 py-0 text-sm", className)}
      >
        {(!!data.apelidos.length || data.telefone || !!data.redesSociais.length || data.site) && (
          <dl className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 sm:gap-y-12 lg:gap-x-8">
            {!!data.apelidos.length && (
              <div className="border-t border-gray-200 pt-4 sm:col-span-2">
                <dt className="font-medium text-gray-900">Nomes populares</dt>
                {data.apelidos.map(({ id, apelido }) => (
                  <dd key={`apelido-${id}`} className="mt-2 text-base">
                    {apelido}
                  </dd>
                ))}
              </div>
            )}

            {!!data.redesSociais.length && (
              <div className={cn("border-t border-gray-200 pt-4", { "sm:col-span-2": !data.telefone })}>
                <dt className="font-medium text-gray-900">Redes sociais</dt>
                <dd className="mt-2 flex flex-wrap gap-2">
                  {data.redesSociais.map(({ id, link, nome }) => (
                    <SocialIcon
                      key={id}
                      style={{ width: "2.85rem", height: "2.85rem" }}
                      url={link}
                      title={REDE_SOCIAL_NOME[nome]}
                    />
                  ))}
                </dd>
              </div>
            )}

            {data.telefone && (
              <div className="border-t border-gray-200 pt-4">
                <dt className="font-medium text-gray-900">Telefone</dt>
                <dd className="mt-2 text-base">{data.telefoneFormatado}</dd>
              </div>
            )}

            {data.site && (
              <div className="border-t border-gray-200 pt-4 sm:col-span-2">
                <dt className="font-medium text-gray-900">Site</dt>
                <dd className="mt-2 truncate text-base underline underline-offset-2">
                  <a className="py-2.5" href={data.site}>
                    {new URL(data.site).hostname}
                  </a>
                </dd>
              </div>
            )}
          </dl>
        )}
      </CardContent>
      <CardFooter className="flex justify-evenly pb-3 pt-6">
        <Link className="p-2" href="#" target="_blank">
          Editar ↗
        </Link>

        <Link className="p-2" href="#" target="_blank">
          Relatar um problema ↗
        </Link>
      </CardFooter>
    </Card>
  ) : (
    <Button variant="outline" onClick={() => setOpen((prevState) => !prevState)}>
      Informações
    </Button>
  );
}

export default React.memo(LocalPanel);
