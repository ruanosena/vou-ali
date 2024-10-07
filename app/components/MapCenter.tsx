"use client";
import { AdvancedMarker, InfoWindow, Map, Pin } from "@vis.gl/react-google-maps";
import { useState } from "react";

export const POSITION = { lat: -11.6084223, lng: -40.1364623 };

export function MapCenter() {
  const [open, setOpen] = useState(false);

  return (
    <Map
      className="h-screen text-black"
      defaultZoom={15}
      defaultCenter={POSITION}
      mapId={process.env.NEXT_PUBLIC_MAP_ID}
    >
      <AdvancedMarker position={POSITION} onClick={() => setOpen(true)}>
        <Pin background={"cyan"} borderColor={"teal"} glyphColor={"darkcyan"} />
      </AdvancedMarker>

      {open && (
        <InfoWindow position={POSITION} onCloseClick={() => setOpen(false)}>
          <p>Várzea da Roça</p>
        </InfoWindow>
      )}
    </Map>
  );
}
