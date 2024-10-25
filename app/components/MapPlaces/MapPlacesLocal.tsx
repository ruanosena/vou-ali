"use client";
import { useGeo } from "@/contexts/GeoContext";
import { useDirections } from "@/hooks/useDirections";
import { getEnderecoBounds } from "@/lib/utils";
import { Local } from "@/types";
import { AdvancedMarker, ControlPosition, InfoWindow, Map, Pin, useMap } from "@vis.gl/react-google-maps";
import React, { Fragment, useEffect, useRef, useState } from "react";
import PanelLocal from "./LocalPanel";
import dynamic from "next/dynamic";
const DynamicMapControl = dynamic(() => import("@vis.gl/react-google-maps").then((m) => m.MapControl), { ssr: false });

interface Props {
  data: Local;
  location?: google.maps.LatLngLiteral;
}

export default function MapPlacesLocal({ data, location: locationProps }: Props) {
  const { location, isDefaultLocation, promptGeolocation } = useGeo();
  const { leg } = useDirections(data, isDefaultLocation ? locationProps : location);

  const map = useMap();

  const [open, setOpen] = useState(false);

  const defaultBounds = useRef<google.maps.LatLngBoundsLiteral | undefined>(getEnderecoBounds(data.endereco)).current;
  const { mapsGetBoundingBox, geometryAvailable } = useGeo();

  useEffect(() => {
    if (!map || !geometryAvailable) return;

    if (!defaultBounds) map.fitBounds(mapsGetBoundingBox(data.lat, data.lng, 250));
  }, [map, geometryAvailable, mapsGetBoundingBox, data]);

  useEffect(() => {
    promptGeolocation();
  }, []);

  return (
    <Fragment>
      <Map
        className="h-screen"
        mapId={process.env.NEXT_PUBLIC_MAP_ID}
        defaultZoom={12}
        defaultBounds={defaultBounds}
        gestureHandling={"greedy"}
        clickableIcons={false}
        disableDefaultUI={true}
      >
        <AdvancedMarker position={data} onClick={() => setOpen(true)}>
          <Pin background={"cyan"} borderColor={"teal"} glyphColor={"darkcyan"} />
        </AdvancedMarker>

        {open && (
          <InfoWindow position={data} onCloseClick={() => setOpen(false)}>
            <p>{leg?.distance?.text}</p>
          </InfoWindow>
        )}
      </Map>
      <DynamicMapControl position={ControlPosition.TOP_RIGHT}>
        <PanelLocal data={data} />
      </DynamicMapControl>
    </Fragment>
  );
}
