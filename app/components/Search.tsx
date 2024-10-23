"use client";
import { useGeo } from "@/contexts/GeoContext";
import { cn } from "@/lib/utils";
import { HTMLAttributes, useCallback, useEffect, useRef, useState } from "react";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Pesquisa } from "@/types";
import { SearchIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { SearchResponse } from "../api/search/[location]/route";
import SearchResultIcon from "./SearchResultIcon";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useSearchSettings } from "@/hooks/useSearchSettings";
interface Props extends HTMLAttributes<HTMLDivElement> {
  location?: google.maps.LatLngLiteral;
}

export function Search({ location: locationProps, className, ...props }: Props) {
  const { location, locationBias, geometryAvailable, isDefaultLocationBias, mapsGetBoundingBox } = useGeo();

  const inputRef = useRef<HTMLInputElement>(null);
  const [inputValue, setInputValue] = useState("");

  const [isOpen, setIsOpen] = useState(false);

  const [initialResults, setInitialResults] = useState<Pesquisa[]>([]);
  const [results, setResults] = useState<Pesquisa[]>([]);

  const [searchDebounce, setSearchDebounce] = useState<NodeJS.Timeout>();
  const scheduled = useRef<string | null>(null);
  const lastSearch = useRef("");

  const { geolocationOn, sortByDistanceOn, handleChangeGeolocationOn, handleChangeSortByDistance } =
    useSearchSettings();

  const search = useCallback(
    async (value: string) => {
      // if value is a empty string, then fetches initial suggestions
      let url = "/api/search";

      const searchParams = new URLSearchParams({ q: value, sd: String(sortByDistanceOn) });

      if (geolocationOn && !isDefaultLocationBias) {
        url += `/${location.lat},${location.lng}`;

        if (!value)
          Object.entries(locationBias).forEach(([key, value]) => searchParams.append(key, encodeURIComponent(value)));
      } else if (locationProps) {
        url += `/${locationProps.lat},${locationProps.lng}`;

        if (!value)
          Object.entries(mapsGetBoundingBox(locationProps.lat, locationProps.lng)).forEach(([key, value]) =>
            searchParams.append(key, encodeURIComponent(value)),
          );
      } else {
        return;
      }

      url += `?${searchParams.toString()}`;

      const { data }: SearchResponse = await fetch(url).then((response) => response.json());

      lastSearch.current = value;
      if (data) {
        if (!value) setInitialResults(data);
        else setResults(data);
      }
    },
    [location, locationProps, locationBias, mapsGetBoundingBox, geolocationOn, sortByDistanceOn, isDefaultLocationBias],
  );

  const handleInputChange = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      let value = event.currentTarget.value;
      setInputValue(value);
      if (!value) return;
      value = encodeURIComponent(value);

      clearTimeout(searchDebounce);
      if (value === lastSearch.current) return;

      if (!scheduled.current) {
        setTimeout(async () => {
          await search(scheduled.current!);
          scheduled.current = null;
        }, 250);
      } else {
        // debounce at the end of typing
        setSearchDebounce(
          setTimeout(async () => {
            await search(value);
          }, 400),
        );
      }
      scheduled.current = value;
    },
    [searchDebounce, search],
  );

  useEffect(() => {
    // get initial suggestions, also when locationBias changes
    if (geometryAvailable) search("");
  }, [geometryAvailable, isDefaultLocationBias]);

  useEffect(() => {
    if (!inputValue) setResults(initialResults);
  }, [initialResults, inputValue]);

  return (
    <div className={cn("flex min-h-screen flex-col items-center bg-secondary-foreground", className)} {...props}>
      <div className="container flex h-12 w-full items-center justify-end px-4">
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="ghost" className="text-primary-foreground sm:text-base">
              Configurações de Pesquisa
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-72 border-border bg-secondary-foreground text-popover">
            <DialogHeader>
              <DialogTitle>Pesquisa</DialogTitle>
              <DialogDescription>Configure a pesquisa aqui.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-3 items-center gap-4">
                <Label htmlFor="geolocation" className="col-span-2 text-right text-base">
                  Geolocalização
                </Label>
                <div className="flex justify-end gap-2">
                  <span className="text-sm uppercase text-muted-foreground">{geolocationOn ? "on" : "off"}</span>
                  <Switch
                    className="data-[state=checked]:bg-muted data-[state=unchecked]:bg-muted"
                    id="geolocation"
                    checked={geolocationOn}
                    onCheckedChange={handleChangeGeolocationOn}
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 items-center gap-4">
                <Label htmlFor="distancia" className="col-span-2 text-right text-base">
                  Ordenar por Distância
                </Label>
                <div className="flex justify-end gap-2">
                  <span className="text-sm uppercase text-muted-foreground">{sortByDistanceOn ? "on" : "off"}</span>
                  <Switch
                    className="data-[state=checked]:bg-muted data-[state=unchecked]:bg-muted"
                    id="distancia"
                    checked={sortByDistanceOn}
                    onCheckedChange={handleChangeSortByDistance}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button className="text-base shadow-none" type="button">
                Fechar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex h-[calc(100vh_-_560px)] max-h-72 min-h-24 w-full shrink-0 flex-col items-center">
        <h1
          className={cn(
            "mt-auto whitespace-nowrap font-mono text-5xl font-semibold tracking-wide text-secondary sm:text-6xl md:text-7xl",
            "inline-block bg-gradient-to-r from-indigo-500 from-10% via-sky-500 via-55% to-emerald-500 to-90% bg-clip-text text-transparent",
          )}
        >
          Vou Alí
        </h1>
      </div>

      <div className="relative w-full min-w-72 max-w-xl p-5">
        <Popover open={isOpen}>
          <PopoverTrigger asChild>
            <label className="flex items-center rounded-md bg-muted-foreground pr-3 data-[state=open]:rounded-b-none">
              <SearchIcon className="mx-2 size-6 text-input md:mx-3" />

              <Input
                ref={inputRef}
                type="text"
                placeholder="Digite um local ou pesquise..."
                className="flex h-14 border-none px-0 py-3 text-lg/8 text-popover outline-none placeholder:text-muted-foreground focus-visible:ring-0 md:text-lg/10"
                value={inputValue}
                onChange={handleInputChange}
                onFocus={() => setIsOpen(true)}
              />
            </label>
          </PopoverTrigger>

          <PopoverContent
            className="w-[var(--radix-popover-trigger-width)] rounded-t-none border-none bg-muted-foreground p-0 pb-3 text-popover"
            onOpenAutoFocus={(event) => event.preventDefault()}
            sideOffset={0}
            onEscapeKeyDown={() => setIsOpen(false)}
            onInteractOutside={(event) => {
              if (event.currentTarget !== inputRef.current) setIsOpen(false);
            }}
            onCloseAutoFocus={(event) => event.preventDefault()}
          >
            <Separator className="mx-auto mb-1 w-[calc(100%_-_1rem)] bg-border/50 md:w-[calc(100%_-_1.5rem)]" />
            {results.length ? (
              results.map((pesquisa) => (
                <div key={pesquisa.id} className="group hover:bg-input">
                  <div className="ml-3.5 mr-5 flex items-center py-1.5 text-lg/7">
                    <SearchResultIcon tipo={pesquisa.tipo} />
                    <span className="cursor-default group-hover:text-primary">{pesquisa.nome}</span>
                  </div>
                </div>
              ))
            ) : inputValue ? (
              <span className="ml-3.5 mr-5 flex items-center justify-center py-1.5 text-lg/7">
                Nenhum resultado encontrado 😕
              </span>
            ) : (
              <span className="ml-3.5 mr-5 flex items-center justify-center py-1.5 text-lg/7">
                Pesquise como você ouviu dizer 🗣️
              </span>
            )}
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
