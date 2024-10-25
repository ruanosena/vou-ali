"use client";
import { useGeo } from "@/contexts/GeoContext";
import { useDirections } from "@/hooks/useDirections";
import { getEnderecoBounds } from "@/lib/utils";
import { Endereco } from "@/types";
import { AdvancedMarker, InfoWindow, Map, Pin, useMap } from "@vis.gl/react-google-maps";
import React, { useEffect, useRef, useState } from "react";

interface Props {
  data: Endereco;
  location?: google.maps.LatLngLiteral;
}

export default function MapPlacesEndereco({ location: locationProps, data }: Props) {
  const { location, isDefaultLocation, promptGeolocation } = useGeo();
  const { leg } = useDirections(data, isDefaultLocation ? locationProps : location);

  const map = useMap();

  const [open, setOpen] = useState(false);

  const defaultBounds = useRef<google.maps.LatLngBoundsLiteral | undefined>(getEnderecoBounds(data)).current;
  const { mapsGetBoundingBox, geometryAvailable } = useGeo();

  useEffect(() => {
    if (!map || !geometryAvailable) return;

    if (!defaultBounds) map.fitBounds(mapsGetBoundingBox(data.lat, data.lng, 250));
  }, [map, geometryAvailable, mapsGetBoundingBox, data]);

  return (
    <Map
      className="max-h-screen"
      mapId={process.env.NEXT_PUBLIC_MAP_ID}
      defaultZoom={12}
      defaultBounds={defaultBounds}
      gestureHandling={"greedy"}
      clickableIcons={false}
      disableDefaultUI={false}
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
  );
}
