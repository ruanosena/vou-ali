"use client";
import { Fragment, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { ControlPosition, useMap, Map } from "@vis.gl/react-google-maps";
const DynamicMapControl = dynamic(() => import("@vis.gl/react-google-maps").then((m) => m.MapControl), { ssr: false });
import { PlaceAutocomplete } from "@/app/components/PlaceAutoComplete";
import { UndoRedoControl } from "../UndoRedoControl";
import { useDrawingManager } from "@/hooks/useDrawingManager";
import "./styles.css";

export function MapPlaceMark() {
  const drawingManager = useDrawingManager();
  const [selectedPlace, setSelectedPlace] = useState<google.maps.places.PlaceResult | null>(null);

  const map = useMap();

  useEffect(() => {
    if (!map || !selectedPlace) return;

    if (selectedPlace.geometry?.viewport) {
      map.fitBounds(selectedPlace.geometry?.viewport);
    }
  }, [map, selectedPlace]);

  return (
    <Fragment>
      <Map
        className="aspect-square max-h-[calc(100vh_-_5rem)] md:aspect-[4/3] lg:aspect-video"
        defaultZoom={4}
        defaultCenter={{ lat: -14.4095261, lng: -51.31668 }}
        gestureHandling={"greedy"}
        disableDefaultUI={true}
      />
      <DynamicMapControl position={ControlPosition.TOP_RIGHT}>
        <div className="autocomplete-control m-[5px]">
          <PlaceAutocomplete onPlaceSelect={setSelectedPlace} />
        </div>
      </DynamicMapControl>

      <DynamicMapControl position={ControlPosition.LEFT_TOP}>
        <UndoRedoControl drawingManager={drawingManager} />;
      </DynamicMapControl>
    </Fragment>
  );
}
