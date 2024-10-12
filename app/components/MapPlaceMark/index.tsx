"use client";
import { Fragment, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { ControlPosition, useMap, Map, AdvancedMarker, InfoWindow } from "@vis.gl/react-google-maps";
const DynamicMapControl = dynamic(() => import("@vis.gl/react-google-maps").then((m) => m.MapControl), { ssr: false });
import { UndoRedoControl } from "../UndoRedoControl";
import { useDrawingManager } from "@/hooks/useDrawingManager";
import "./styles.css";
import { AutocompleteCustom } from "../AutocompleteCustom";
import { useMarker } from "@/contexts/MarkerContext";

export function MapPlaceMark() {
  const [selectedPlace, setSelectedPlace] = useState<google.maps.places.PlaceResult | null>(null);

  const map = useMap();
  const { marker, local, requesting, mode, clear } = useMarker();
  const [infoWindowOpen, setInfoWindowOpen] = useState(false);

  const drawingManager = useDrawingManager();
  const advancedMarkerRef = useRef<google.maps.marker.AdvancedMarkerElement>(null);
  console.log(marker, local, requesting);

  useEffect(() => {
    if (!map || !selectedPlace) return;

    if (selectedPlace.geometry?.viewport) {
      map.fitBounds(selectedPlace.geometry?.viewport);
    }
  }, [map, selectedPlace]);

  return mode === "editing" ? (
    <Fragment>
      <Map
        className="aspect-square max-h-[calc(100vh_-_5rem)] md:aspect-[4/3] lg:aspect-video"
        defaultZoom={4}
        defaultCenter={{ lat: -14.4095261, lng: -51.31668 }}
        gestureHandling={"greedy"}
        disableDefaultUI
      />
      <DynamicMapControl position={ControlPosition.TOP_RIGHT}>
        <div className="autocomplete-control m-[5px]">
          <AutocompleteCustom onPlaceSelect={setSelectedPlace} />
        </div>
      </DynamicMapControl>

      <DynamicMapControl position={ControlPosition.LEFT_TOP}>
        <UndoRedoControl drawingManager={drawingManager} />;
      </DynamicMapControl>
    </Fragment>
  ) : (
    // Has already fetch geocoding data
    typeof local?.enderecoFormatado == "string" && (
      <Fragment>
        <Map
          className="aspect-square max-h-[calc(100vh_-_5rem)] text-background md:aspect-[4/3] lg:aspect-video"
          defaultZoom={14}
          center={marker.position}
          mapId={process.env.NEXT_PUBLIC_MAP_ID}
          disableDefaultUI
          {...(local?.norte && {
            defaultBounds: { north: local.norte, east: local.leste!, west: local.oeste!, south: local.sul! },
          })}
        >
          <AdvancedMarker
            ref={advancedMarkerRef}
            position={marker.position}
            onClick={() => local?.enderecoFormatado && setInfoWindowOpen(true)}
          />

          {infoWindowOpen && (
            <InfoWindow anchor={advancedMarkerRef.current} onCloseClick={() => setInfoWindowOpen(false)}>
              <h4>{local?.enderecoFormatado}</h4>
            </InfoWindow>
          )}
        </Map>
        <DynamicMapControl position={ControlPosition.TOP_LEFT}>
          <button
            className="m-[5px] rounded-md bg-white px-3.5 py-2.5 text-sm font-semibold text-gray-900 shadow-md hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:text-base"
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
