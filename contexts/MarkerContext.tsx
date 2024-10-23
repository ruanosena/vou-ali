"use client";
import { Timer } from "@/lib/utils";
import { Endereco } from "@/types";
import { Snapshot } from "@/types/maps";
import { useMapsLibrary } from "@vis.gl/react-google-maps";
import { createContext, ReactNode, useContext, useEffect, useRef, useState } from "react";

type MarkerProviderProps = {
  children: ReactNode;
  storageKey?: string;
};

type MarkerMode = "static" | "editing";

interface MarkerProviderState {
  marker: Snapshot;
  setMarkerPosition: (position: google.maps.LatLngLiteral) => void;
  endereco?: Endereco;
  requesting?: boolean;
  clear: () => void;
  mode: MarkerMode;
  setMode: (mode: MarkerMode) => void;
}

const initialState: MarkerProviderState = {
  marker: {},
  setMarkerPosition: () => null,
  endereco: undefined,
  requesting: undefined,
  clear: () => null,
  mode: "editing",
  setMode: () => null,
};

const MarkerProviderContext = createContext<MarkerProviderState>(initialState);

export function MarkerProvider({
  children,
  storageKey = "@ruanosena:mark-state-0.1.0",
  ...props
}: MarkerProviderProps) {
  const [endereco, setEndereco] = useState<Endereco>();
  const [marker, setMarker] = useState<Snapshot>(() => {
    try {
      const data = JSON.parse(localStorage.getItem(storageKey) ?? "");
      return data;
    } catch {
      return {};
    }
  });
  const previousMarker = useRef<typeof marker>();
  const [mode, setMode] = useState<MarkerProviderState["mode"]>(() => (marker.position ? "static" : "editing"));
  const geocoding = useMapsLibrary("geocoding");
  const [geocoder, setGeocoder] = useState<google.maps.Geocoder>();
  const [geocodeDebounce, setGeocodeDebounce] = useState<Timer>();

  useEffect(() => {
    if (!geocoding) return;

    setGeocoder(new geocoding.Geocoder());
  }, [geocoding]);

  useEffect(() => {
    if (marker !== previousMarker.current) {
      if (!geocoder) return;
      if (!marker.position) return setEndereco(undefined);

      // debouncing for reverse geocoding fetch
      geocodeDebounce?.clear();
      setGeocodeDebounce(
        new Timer(() => {
          geocoder.geocode({ location: marker.position }, (result, status) => {
            if (status === "OK") {
              const viewport = result![0].geometry.viewport.toJSON();
              setEndereco({
                id: "",
                enderecoFormatado: result![0].formatted_address,
                ...result![0].geometry.location.toJSON(),
                norte: viewport.north,
                sul: viewport.south,
                leste: viewport.east,
                oeste: viewport.west,
              });
            } else if (status === "ZERO_RESULTS") {
              // 'latlng' em local remoto não retornou nenhum endereço detalhado
              setEndereco({ id: "", enderecoFormatado: "", ...marker.position! });
              // endereco recebe a posição do marcador de mapa
            } else {
              setEndereco(undefined);
            }
          });
        }, previousMarker.current && 2500),
      );
    }
    previousMarker.current = marker;
  }, [geocoder, marker, geocodeDebounce]);

  const value: MarkerProviderState = {
    marker,
    setMarkerPosition: (position: google.maps.LatLngLiteral) => {
      const mark = { position };
      setMarker(mark);
      localStorage.setItem(storageKey, JSON.stringify(mark, null, 2));
    },
    endereco,
    clear: () => {
      localStorage.removeItem(storageKey);
      setMarker({});
      setMode("editing");
    },
    requesting: geocodeDebounce?.active,
    mode,
    setMode,
  };

  return (
    <MarkerProviderContext.Provider {...props} value={value}>
      {children}
    </MarkerProviderContext.Provider>
  );
}

export const useMarker = () => {
  const context = useContext(MarkerProviderContext);

  if (context === undefined) throw new Error("useMark must be used within a MarkProvider");

  return context;
};
