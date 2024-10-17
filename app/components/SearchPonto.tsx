"use client";
import { useGeo } from "@/contexts/GeoContext";
import { cn } from "@/lib/utils";
import { HTMLAttributes, useCallback, useEffect, useRef, useState } from "react";

import { CalendarIcon, EnvelopeClosedIcon, FaceIcon, GearIcon, PersonIcon, RocketIcon } from "@radix-ui/react-icons";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import { Ponto } from "@/types";
import { Pin } from "lucide-react";
import { INITIAL_SUGGESTIONS_CHAR } from "@/lib/constants";
import { Input } from "@/components/ui/input";

interface Props extends HTMLAttributes<HTMLDivElement> {
  location?: google.maps.LatLngLiteral;
}

export function SearchPonto({ location: locationProps, className, ...props }: Props) {
  const { location, locationBias } = useGeo();
  const [initialPontoResults, setInitialPontoResults] = useState<Ponto[]>([]);
  const [pontoResults, setPontoResults] = useState<Ponto[]>([]);
  const [searchDebounce, setSearchDebounce] = useState<NodeJS.Timeout>();
  const scheduled = useRef<string | null>(null);

  const search = useCallback(
    async (value?: string) => {
      const searchParams = new URLSearchParams({ q: (value || scheduled.current) ?? "" });
      if (value === INITIAL_SUGGESTIONS_CHAR) {
        Object.entries(locationBias).forEach(([key, value]) => searchParams.append(key, encodeURIComponent(value)));
      }

      const request = await fetch(`/api/search/${location.lat},${location.lng}?${searchParams.toString()}`);
      const response: { data?: Ponto[]; error?: string } = await request.json();

      if (response.data) {
        setPontoResults(response.data);
        if (value === INITIAL_SUGGESTIONS_CHAR) {
          console.log("init");
          setInitialPontoResults(response.data);
        }
      }
    },
    [location, locationBias, searchDebounce],
  );

  const handleInputChange = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      let value = event.currentTarget.value;
      if (!value) return setPontoResults(initialPontoResults);
      if (value === INITIAL_SUGGESTIONS_CHAR) return setPontoResults([]);
      value = encodeURIComponent(value);

      clearTimeout(searchDebounce);

      if (!scheduled.current) {
        // throttling while typing
        setTimeout(async () => {
          await search();
          scheduled.current = null;
        }, 250);
      } else {
        // debounce at the end of typing
        setSearchDebounce(
          setTimeout(() => {
            search(value);
          }, 500),
        );
      }
      scheduled.current = value;
    },
    [location, searchDebounce, search, initialPontoResults],
  );

  useEffect(() => {
    // get initial suggestions
    search("_");
  }, []);

  return (
    <div className={cn("flex min-h-screen flex-col items-center justify-center bg-foreground", className)} {...props}>
      <div className="min-w-72 max-w-xl">
        <Input
          type="text"
          placeholder="Digite um local ou pesquise..."
          className="flex w-full rounded-md bg-muted-foreground py-3 text-xl/10 text-popover outline-none placeholder:text-muted-foreground"
          onChange={handleInputChange}
        />
      </div>
      {/* <Command className="max-w-md rounded-lg bg-muted-foreground text-popover shadow-md md:max-w-xl">
        <CommandInput onValueChange={search} placeholder="Digite um local ou pesquise..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          {!!pontoResults.length && (
            <CommandGroup className="text-background [&_[cmdk-group-heading]]:text-muted" heading="Sugestões">
              {pontoResults.map((ponto) => (
                <CommandItem key={ponto.id}>
                  <Pin className="mr-2 h-4 w-4" />
                  <span>{ponto.nome}</span>
                </CommandItem>
              ))}
              <CommandItem>
                <FaceIcon className="mr-2 h-4 w-4" />
                <span>Search Emoji</span>
              </CommandItem>
              <CommandItem disabled>
                <RocketIcon className="mr-2 h-4 w-4" />
                <span>Launch</span>
              </CommandItem>
            </CommandGroup>
          )}
          <CommandSeparator className="bg-border/50" />
          <CommandGroup className="text-background [&_[cmdk-group-heading]]:text-muted" heading="Locais">
            <CommandItem>
              <PersonIcon className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </CommandItem>
            <CommandItem>
              <EnvelopeClosedIcon className="mr-2 h-4 w-4" />
              <span>Mail</span>
            </CommandItem>
            <CommandItem>
              <GearIcon className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </Command> */}

      {/* <span>
        {locationNavigator.lat}, {locationNavigator.lng}
      </span>
      <span>
        {locationProps?.lat}, {locationProps?.lng}
      </span> */}
    </div>
  );
}
