"use client";

import { Fragment, HTMLAttributes, useEffect, useMemo, useState } from "react";
import {
  Button,
  Combobox,
  ComboboxButton,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
  Field,
  Label,
} from "@headlessui/react";
import { CheckIcon, ChevronDownIcon } from "@heroicons/react/20/solid";
import { cn, ns } from "@/lib/utils";
import { Centro } from "@/types";

interface Props extends HTMLAttributes<HTMLFormElement> {
  centros: Centro[];
}

export function SelectCentro({ centros, className, ...props }: Props) {
  const [selected, setSelected] = useState(centros[0]);
  const [normalizedCentrosNomes, setNormalizedCentrosNomes] = useState<string[]>([]);

  const [query, setQuery] = useState("");

  const filteredCentros = useMemo(() => {
    if (query === "") return centros;
    else {
      const filteredCentros = [];
      const normalizedQuery = ns(query).toLowerCase();
      // compara cada index da lista de normalizados e filtra para nova lista de centros
      for (let i = 0; i < normalizedCentrosNomes.length; i++) {
        if (normalizedCentrosNomes[i].includes(normalizedQuery)) filteredCentros.push(centros[i]);
      }
      return filteredCentros;
    }
  }, [query, centros, normalizedCentrosNomes]);

  useEffect(() => {
    // 'Várzea da Roça' -> 'varzea da roca' mapeia préviamente os nomes
    setNormalizedCentrosNomes(centros.map((centro) => ns(centro.nome).toLowerCase()));
  }, [centros]);

  return (
    <form
      className={cn("flex min-h-screen flex-col items-center justify-center gap-y-4 sm:flex-row", className)}
      onSubmit={(event) => {
        event.preventDefault();
        console.log(selected);
      }}
      {...props}
    >
      <Field className="relative flex justify-center">
        <Label className="absolute -top-[2rem] whitespace-nowrap text-xl/8 font-medium text-gray-100 sm:-top-[2.5rem] sm:text-2xl/10 lg:text-3xl/10">
          Selecione uma área
        </Label>
        <Combobox value={selected} onChange={(value) => setSelected(value!)} onClose={() => setQuery("")}>
          <ComboboxInput
            aria-label="Área"
            className={cn(
              "w-72 rounded-md border-none bg-white py-1.5 pl-3 pr-10 text-left text-lg/6 text-gray-900 shadow-sm sm:rounded-r-none",
              "ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:w-96 sm:text-xl/8",
            )}
            displayValue={(centro) => (centro as any)?.nome}
            onChange={(event) => setQuery(event.target.value)}
          />
          <ComboboxButton className="group absolute inset-y-0 right-0 px-2.5">
            <ChevronDownIcon className="size-8 fill-background opacity-60 group-data-[hover]:opacity-100" />
          </ComboboxButton>
          <ComboboxOptions
            anchor="bottom"
            transition
            className={cn(
              "mt-1 max-h-56 w-[var(--input-width)] origin-top overflow-auto rounded-md border bg-white text-base shadow-lg",
              "ring-1 ring-black ring-opacity-5 transition duration-200 ease-out empty:invisible focus:outline-none data-[closed]:scale-95 data-[closed]:opacity-0 sm:text-lg",
            )}
          >
            {filteredCentros.map((centro) => (
              <ComboboxOption
                key={centro.id}
                value={centro}
                className="relative cursor-default select-none py-2 pl-3 pr-9 text-gray-900 data-[focus]:bg-indigo-600 data-[focus]:text-white"
              >
                {({ selected, focus }) => (
                  <Fragment>
                    <span className={cn("block truncate font-normal", { "font-semibold": selected })}>
                      {centro.nome}
                    </span>

                    {selected && (
                      <span
                        className={cn("absolute inset-y-0 right-0 flex items-center pr-4 text-indigo-600", {
                          "text-white": focus,
                        })}
                      >
                        <CheckIcon aria-hidden="true" className="size-6" />
                      </span>
                    )}
                  </Fragment>
                )}
              </ComboboxOption>
            ))}
          </ComboboxOptions>
        </Combobox>
      </Field>
      <Button
        type="submit"
        className="min-w-48 rounded bg-sky-600 px-4 py-1.5 text-lg/6 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 data-[active]:bg-sky-700 data-[hover]:bg-sky-500 sm:min-w-16 sm:rounded-l-none sm:text-xl/8"
      >
        Ir
      </Button>
    </form>
  );
}
