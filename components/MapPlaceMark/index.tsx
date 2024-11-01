"use client";
import { Fragment, PropsWithChildren, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { ControlPosition, useMap, Map, AdvancedMarker, InfoWindow, MapProps } from "@vis.gl/react-google-maps";
const DynamicMapControl = dynamic(() => import("@vis.gl/react-google-maps").then((m) => m.MapControl), { ssr: false });
import { UndoRedoControl } from "../UndoRedoControl";
import { useDrawingManager } from "@/hooks/useDrawingManager";
import "./styles.css";
import { AutocompleteCustom } from "../AutocompleteCustom";
import { useMarker } from "@/contexts/MarkerContext";
import { cn } from "@/lib/utils";

export function MapPlaceMark({ className, ...props }: PropsWithChildren<MapProps>) {
  const drawingManager = useDrawingManager();
  const [selectedPlace, setSelectedPlace] = useState<google.maps.places.PlaceResult | null>(null);

  const map = useMap();
  const { marker, endereco, mode, clear, setMode, requesting } = useMarker();
  const [infoWindowOpen, setInfoWindowOpen] = useState(false);

  const advancedMarkerRef = useRef<google.maps.marker.AdvancedMarkerElement>(null);

  useEffect(() => {
    if (!map || !selectedPlace) return;

    if (selectedPlace.geometry?.viewport) {
      map.fitBounds(selectedPlace.geometry?.viewport);
    }
  }, [map, selectedPlace]);

  useEffect(() => {
    if (!map || !endereco?.enderecoFormatado) return;

    map.fitBounds({ north: endereco.norte!, east: endereco.leste!, west: endereco.oeste!, south: endereco.sul! });
  }, [map, endereco]);

  return mode === "editing" ? (
    <Fragment>
      <Map
        className={cn("aspect-square max-h-[calc(100vh_-_5rem)] md:aspect-[4/3] lg:aspect-video", className)}
        defaultZoom={4}
        defaultCenter={{ lat: -14.4095261, lng: -51.31668 }}
        gestureHandling={"greedy"}
        mapId={process.env.NEXT_PUBLIC_MAP_ID}
        disableDefaultUI
        {...props}
      />
      <DynamicMapControl position={ControlPosition.TOP_RIGHT}>
        <div className="autocomplete-control m-[5px]">
          <AutocompleteCustom onPlaceSelect={setSelectedPlace} />
        </div>
      </DynamicMapControl>

      <DynamicMapControl position={ControlPosition.LEFT_TOP}>
        <UndoRedoControl drawingManager={drawingManager} />;
      </DynamicMapControl>

      {marker.position && (
        <DynamicMapControl position={ControlPosition.LEFT_TOP}>
          <button
            type="button"
            className="ml-[5px] rounded-md bg-indigo-600 px-3.5 py-2.5 text-base font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:bg-gray-600"
            onClick={() => setMode("static")}
            disabled={requesting}
          >
            OK
          </button>
        </DynamicMapControl>
      )}
    </Fragment>
  ) : (
    // Has already fetch geocoding data
    typeof endereco?.enderecoFormatado == "string" && (
      <Fragment>
        <Map
          className={cn(
            "aspect-square max-h-[calc(100vh_-_5rem)] text-background md:aspect-[4/3] lg:aspect-video",
            className,
          )}
          defaultZoom={14}
          center={marker.position}
          mapId={process.env.NEXT_PUBLIC_MAP_ID}
          disableDefaultUI
          {...(endereco?.norte && {
            defaultBounds: {
              north: endereco.norte,
              east: endereco.leste!,
              west: endereco.oeste!,
              south: endereco.sul!,
            },
          })}
          {...props}
        >
          <AdvancedMarker
            ref={advancedMarkerRef}
            position={marker.position}
            onClick={() => endereco?.enderecoFormatado && setInfoWindowOpen(true)}
          />

          {infoWindowOpen && (
            <InfoWindow anchor={advancedMarkerRef.current} onCloseClick={() => setInfoWindowOpen(false)}>
              <h4>{endereco?.enderecoFormatado}</h4>
            </InfoWindow>
          )}
        </Map>
        <DynamicMapControl position={ControlPosition.TOP_LEFT}>
          <button
            className="m-[5px] rounded-md bg-white px-3.5 py-2.5 text-base font-semibold text-gray-900 shadow-md hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:text-lg"
            type="button"
            onClick={clear}
          >
            Mudar localização
          </button>
        </DynamicMapControl>
      </Fragment>
    )
  );
}
