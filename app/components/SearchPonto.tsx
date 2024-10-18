"use client";
import { useGeo } from "@/contexts/GeoContext";
import { cn } from "@/lib/utils";
import { HTMLAttributes, useCallback, useEffect, useRef, useState } from "react";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Ponto } from "@/types";
import { Pin, Search } from "lucide-react";
import { INITIAL_SUGGESTIONS_CHAR } from "@/lib/constants";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";

interface Props extends HTMLAttributes<HTMLDivElement> {
  location?: google.maps.LatLngLiteral;
}

export function SearchPonto({ location: locationProps, className, ...props }: Props) {
  const { location, locationBias, geometryAvailable, isDefaultLocation, mapsGetBoundingBox } = useGeo();
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [initialPontoResults, setInitialPontoResults] = useState<Ponto[]>([]);
  const [pontoResults, setPontoResults] = useState<Ponto[]>([]);
  const [searchDebounce, setSearchDebounce] = useState<NodeJS.Timeout>();
  const scheduled = useRef<string | null>(null);
  const lastSearch = useRef("");

  const search = useCallback(
    async (value?: string) => {
      const searchParams = new URLSearchParams({ q: value ?? scheduled.current ?? "" });
      if (value === INITIAL_SUGGESTIONS_CHAR) {
        if (isDefaultLocation && locationProps) {
          Object.entries(mapsGetBoundingBox(locationProps.lat, locationProps.lng)).forEach(([key, value]) =>
            searchParams.append(key, encodeURIComponent(value)),
          );
        } else {
          Object.entries(locationBias).forEach(([key, value]) => searchParams.append(key, encodeURIComponent(value)));
        }
      }

      const request = await fetch(
        `/api/search/${isDefaultLocation && locationProps ? locationProps.lat : location.lat},${
          isDefaultLocation && locationProps ? locationProps.lng : location.lng
        }?${searchParams.toString()}`,
      );
      const response: { data?: Ponto[]; error?: string } = await request.json();

      lastSearch.current = value ?? scheduled.current ?? "";
      if (response.data) {
        if (value === INITIAL_SUGGESTIONS_CHAR) setInitialPontoResults(response.data);
        else setPontoResults(response.data);
      }
    },
    [locationProps, location, locationBias, searchDebounce, isDefaultLocation, mapsGetBoundingBox],
  );

  const handleInputChange = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      let value = event.currentTarget.value;
      setInputValue(value);
      if (!value || value === INITIAL_SUGGESTIONS_CHAR) return;
      value = encodeURIComponent(value);
      if (value === lastSearch.current) return;

      if (!scheduled.current) {
        setTimeout(() => {
          search();
          scheduled.current = null;
        }, 250);
      }
      scheduled.current = value;
    },
    [location, searchDebounce, search, initialPontoResults],
  );

  useEffect(() => {
    // get initial suggestions
    if (geometryAvailable) search("_");
  }, [geometryAvailable, isDefaultLocation]);

  useEffect(() => {
    if (!inputValue) setPontoResults(initialPontoResults);
  }, [initialPontoResults, inputValue]);

  return (
    <div className={cn("flex min-h-screen flex-col items-center bg-secondary-foreground", className)} {...props}>
      <div className="flex h-[calc(100vh_-_560px)] max-h-72 min-h-24 w-full shrink-0 flex-col items-center">
        <h1
          className={cn(
            "mt-auto whitespace-nowrap font-mono text-5xl font-semibold tracking-wide text-secondary sm:text-6xl md:text-7xl",
            "inline-block bg-gradient-to-r from-indigo-500 from-10% via-sky-500 via-55% to-emerald-500 to-90% bg-clip-text text-transparent",
          )}
        >
          Passar Alí
        </h1>
      </div>
      <div className="relative w-full min-w-72 max-w-xl p-5">
        <Popover open={isOpen && !!pontoResults.length}>
          <PopoverTrigger asChild>
            <label className="flex items-center rounded-md bg-muted-foreground pr-3 data-[state=open]:rounded-b-none">
              <Search className="mx-2 size-6 text-input md:mx-3" />

              <Input
                ref={inputRef}
                type="text"
                placeholder="Digite um local ou pesquise..."
                className="flex h-14 border-none px-0 py-3 text-xl/8 text-popover outline-none placeholder:text-muted-foreground focus-visible:ring-0 md:text-2xl/10"
                value={inputValue}
                onChange={handleInputChange}
                onFocus={() => setIsOpen(true)}
              />
            </label>
          </PopoverTrigger>

          <PopoverContent
            className="w-[var(--radix-popover-trigger-width)] rounded-t-none border-none bg-muted-foreground p-0 text-popover"
            onOpenAutoFocus={(event) => event.preventDefault()}
            sideOffset={0}
            onEscapeKeyDown={() => setIsOpen(false)}
            onInteractOutside={(event) => {
              if (event.currentTarget !== inputRef.current) setIsOpen(false);
            }}
            onCloseAutoFocus={(event) => event.preventDefault()}
          >
            <Separator className="mx-auto mb-1 w-[calc(100%_-_1rem)] bg-border/50 md:w-[calc(100%_-_1.5rem)]" />
            {pontoResults.map((ponto) => (
              <div key={ponto.id} className="group hover:bg-input">
                <div className="ml-3.5 mr-5 flex items-center py-1.5 text-lg/7">
                  <Pin className="mr-3.5 size-5 text-input group-hover:text-primary/80" />
                  <span className="cursor-default group-hover:text-primary">{ponto.nome}</span>
                </div>
              </div>
            ))}
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}