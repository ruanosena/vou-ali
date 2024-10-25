import { cn } from "@/lib/utils";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Local } from "@/types";
import { REDE_SOCIAL_NOME } from "@/lib/constants";

import { SocialIcon } from "react-social-icons";

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
        <dl className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 sm:gap-y-16 lg:gap-x-8">
          <div className="border-t border-gray-200 pt-4">
            <dt className="font-medium text-gray-900">Nomes populares</dt>
            {data.apelidos.map(({ id, apelido }) => (
              <dd key={`apelido-${id}`} className="mt-2 text-base">
                {apelido}
              </dd>
            ))}
          </div>

          <div className="border-t border-gray-200 pt-4">
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

          <div className="border-t border-gray-200 pt-4">
            <dt className="font-medium text-gray-900">Telefone</dt>
            <dd className="mt-2 text-base">(11) 95194-9746</dd>
          </div>

          <div className="border-t border-gray-200 pt-4">
            <dt className="font-medium text-gray-900">Site</dt>
            <dd className="mt-1 truncate text-base">
              <a href={"https://ruanosena.github.io"}>{new URL("https://ruanosena.github.io").hostname}</a>
            </dd>
          </div>
        </dl>
      </CardContent>
      <CardFooter className="py-3">
        <div className="mt-2 flex justify-between">
          <a
            href="https://codesandbox.io/s/github/visgl/react-google-maps/tree/main/examples/advanced-marker-interaction"
            target="_new"
          >
            Try on CodeSandbox ↗
          </a>

          <a
            href="https://github.com/visgl/react-google-maps/tree/main/examples/advanced-marker-interaction"
            target="_new"
          >
            View Code ↗
          </a>
        </div>
      </CardFooter>
    </Card>
  ) : (
    <Button variant="outline" onClick={() => setOpen((prevState) => !prevState)}>
      Informações
    </Button>
  );
}

export default React.memo(LocalPanel);
