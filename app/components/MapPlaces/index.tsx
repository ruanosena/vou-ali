"use client";
import { useGeo } from "@/contexts/GeoContext";
import { useDirections } from "@/hooks/useDirections";
import { cn, getEnderecoBounds } from "@/lib/utils";
import { Endereco, isLocal, Local, Ponto } from "@/types";
import {
  AdvancedMarker,
  InfoWindow,
  Map,
  Pin,
  useMap,
  AdvancedMarkerAnchorPoint,
  AdvancedMarkerProps,
  APIProvider,
  useAdvancedMarkerRef,
  CollisionBehavior,
} from "@vis.gl/react-google-maps";
import React, { Fragment, useCallback, useEffect, useRef, useState } from "react";

import { MapPin, MapPinCheckInside } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { PlacesResponse } from "@/app/api/places/[location]/route";
import { PLACES_BOUNDING_BOX_RADIUS } from "@/lib/constants";

interface Props {
  data: Endereco | Local;
  location?: google.maps.LatLngLiteral;
}

export default function MapPlaces({ location: locationProps, data }: Props) {
  const prevData = useRef<typeof data>(); // util for api call

  const [pontos, setPontos] = useState<Ponto[]>([]);

  const [zIndexSelected, setZIndexSelected] = useState(pontos.length);
  const [zIndexHover, setZIndexHover] = useState<number>(pontos.length + 1);

  const [dataPonto, setDataPonto] = useState<Ponto>({
    id: data.id,
    lat: data.lat,
    lng: data.lng,
    locais: [],
    zIndex: zIndexSelected,
  });

  const { location, isDefaultLocation, promptGeolocation, geometryAvailable, mapsGetBoundingBox } = useGeo();
  const { leg } = useDirections(data, isDefaultLocation ? locationProps : location);

  const map = useMap();

  const defaultBounds = useRef<google.maps.LatLngBoundsLiteral | undefined>(
    getEnderecoBounds(isLocal(data) ? data.endereco : data),
  ).current;

  const [selectedPonto, setSelectedPonto] = useState<Ponto | null>(null);
  const [hoverId, setHoverId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [selectedMarker, setSelectedMarker] = useState<google.maps.marker.AdvancedMarkerElement | null>(null);
  const [infoWindowShown, setInfoWindowShown] = useState(false);

  const onMouseEnter = useCallback((id: string | null) => setHoverId(id), []);
  const onMouseLeave = useCallback(() => setHoverId(null), []);
  const onMarkerClick = useCallback(
    (ponto: Ponto, marker?: google.maps.marker.AdvancedMarkerElement) => {
      setSelectedPonto(ponto);
      setSelectedId(ponto.id);

      if (marker) {
        setSelectedMarker(marker);
      }

      if (ponto.id !== selectedId) {
        setInfoWindowShown(true);
      } else {
        setInfoWindowShown((isShown) => !isShown);
      }
    },
    [selectedId],
  );
  const onMapClick = useCallback(() => {
    setSelectedId(null);
    setSelectedMarker(null);
    setInfoWindowShown(false);
  }, []);
  const handleInfowindowCloseClick = useCallback(() => setInfoWindowShown(false), []);

  useEffect(() => {
    if (!map || !geometryAvailable) return;
    // fit local coordinate bounds
    map.fitBounds(mapsGetBoundingBox(data.lat, data.lng, PLACES_BOUNDING_BOX_RADIUS));
  }, [map, geometryAvailable, mapsGetBoundingBox, data]);

  useEffect(() => {
    if (geometryAvailable && prevData.current !== data) {
      const { lat, lng }: google.maps.LatLngLiteral = isLocal(data) ? data.endereco : data;

      let url = `/api/places/${lat},${lng}`;

      const searchParams = new URLSearchParams();
      Object.entries(mapsGetBoundingBox(lat, lng, PLACES_BOUNDING_BOX_RADIUS)).forEach(([key, value]) =>
        searchParams.append(key, encodeURIComponent(value)),
      );

      url += `?${searchParams.toString()}`;

      fetch(url)
        .then((response) => response.json())
        .then(({ data: pontos }: PlacesResponse) => {
          if (pontos) {
            const [dataPonto] = pontos.splice(
              pontos.findIndex(({ lat: pontoLat, lng: pontoLng }) => lat === pontoLat && lng === pontoLng),
              1,
            );
            setDataPonto((prevState) => ({ ...prevState, locais: dataPonto.locais, zIndex: dataPonto.zIndex }));
            setPontos(pontos);
            setZIndexSelected(pontos.length);
            setZIndexHover(pontos.length + 1);
          }
        });

      prevData.current = data;
    }
  }, [data, geometryAvailable, mapsGetBoundingBox]);

  return (
    <Map
      className="h-screen"
      mapId={process.env.NEXT_PUBLIC_MAP_ID}
      defaultZoom={12}
      defaultCenter={data}
      defaultBounds={defaultBounds}
      gestureHandling={"greedy"}
      clickableIcons={false}
      disableDefaultUI={false}
      onClick={onMapClick}
    >
      {pontos.map((ponto) => {
        const { lat, lng } = ponto;
        let zIndex = ponto.zIndex; // default zIndex

        if (hoverId === ponto.id) {
          zIndex = zIndexHover;
        }

        if (selectedId === ponto.id) {
          zIndex = zIndexSelected;
        }

        return (
          <AdvancedMarkerWithRef
            key={ponto.id}
            position={{ lat, lng }}
            zIndex={zIndex}
            className="transition-all duration-200 ease-in-out"
            style={{
              transform: `scale(${[hoverId, selectedId].includes(ponto.id) ? 1.3 : 1})`,
              transformOrigin: AdvancedMarkerAnchorPoint["BOTTOM"].join(" "),
            }}
            onMarkerClick={(marker: google.maps.marker.AdvancedMarkerElement) => onMarkerClick(ponto, marker)}
            onMouseEnter={() => onMouseEnter(ponto.id)}
            collisionBehavior={CollisionBehavior.OPTIONAL_AND_HIDES_LOWER_PRIORITY}
            onMouseLeave={onMouseLeave}
          >
            <MapPin className="size-10 fill-red-500 stroke-red-600 stroke-1 transition-all duration-200 ease-in-out" />
          </AdvancedMarkerWithRef>
        );
      })}

      <AdvancedMarkerWithRef
        position={dataPonto}
        zIndex={dataPonto.zIndex}
        className="transition-all duration-200 ease-in-out"
        style={{
          transform: `scale(${[hoverId, selectedId].includes(dataPonto.id) ? 1.3 : 1})`,
          transformOrigin: AdvancedMarkerAnchorPoint["BOTTOM"].join(" "),
        }}
        onMarkerClick={(marker: google.maps.marker.AdvancedMarkerElement) => onMarkerClick(dataPonto, marker)}
        onMouseEnter={() => onMouseEnter(dataPonto.id)}
        collisionBehavior={CollisionBehavior.OPTIONAL_AND_HIDES_LOWER_PRIORITY}
        onMouseLeave={onMouseLeave}
      >
        <MapPin className="size-10 fill-[url(#LogoGradient)] stroke-primary/65 stroke-1 transition-all duration-200 ease-in-out">
          <defs>
            <linearGradient id="LogoGradient" gradientTransform="rotate(90)">
              <stop offset="10%" stopColor="#6366f1" />
              <stop offset="55%" stopColor="#0ea5e9" />
              <stop offset="90%" stopColor="#10b981" />
            </linearGradient>
          </defs>
        </MapPin>
      </AdvancedMarkerWithRef>

      {infoWindowShown && selectedMarker && (
        <InfoWindow
          anchor={selectedMarker}
          pixelOffset={[0, -2]}
          onCloseClick={handleInfowindowCloseClick}
          headerDisabled
        >
          <h2>Marker {selectedId}</h2>
          <p>Some arbitrary html to be rendered into the InfoWindow.</p>
          {selectedId === data.id && (
            <Fragment>
              {leg?.distance && <span className={buttonVariants({ variant: "ghost" })}>{leg.distance.text}</span>}
              {isDefaultLocation && (
                <Button variant="ghost" className="text-sm font-semibold leading-6" onClick={() => promptGeolocation()}>
                  {leg?.distance ? "Mais preciso" : "Distância precisa"}{" "}
                  <span aria-hidden="true">
                    <MapPinCheckInside />
                  </span>
                </Button>
              )}
            </Fragment>
          )}
        </InfoWindow>
      )}
    </Map>
  );
}

export const AdvancedMarkerWithRef = (
  props: AdvancedMarkerProps & {
    onMarkerClick: (marker: google.maps.marker.AdvancedMarkerElement) => void;
  },
) => {
  const { children, onMarkerClick, ...advancedMarkerProps } = props;
  const [markerRef, marker] = useAdvancedMarkerRef();

  return (
    <AdvancedMarker
      onClick={() => {
        if (marker) {
          onMarkerClick(marker);
        }
      }}
      ref={markerRef}
      {...advancedMarkerProps}
    >
      {children}
    </AdvancedMarker>
  );
};
