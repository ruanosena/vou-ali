"use client";
import { Map } from "@vis.gl/react-google-maps";
import { DrawingMap } from "@/app/components/DrawingMap";
import { useOverlayGeometry } from "@/contexts/overlayGeometryContext";
import { notFound } from "next/navigation";
import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { isCirculo, isRetangulo, Snapshot } from "@/types/maps";
import { Circulo } from "@/app/components/Circulo";
import { Retangulo } from "@/app/components/Retangulo";

export default function AddCentro() {
  if (process.env.NODE_ENV === "production") {
    return notFound();
  }
  const { snapshots: areas, overlays, remove, clear } = useOverlayGeometry();
  const [isEditingMap, setIsEditingMap] = useState(!areas.length);
  const prevIsEditingMap = useRef(true);

  const [area, setArea] = useState<Snapshot>();
  const [mapCenter, setMapCenter] = useState<google.maps.LatLngLiteral>();
  const [center, setCenter] = useState<google.maps.LatLngLiteral>();
  const [radius, setRadius] = useState<number>();
  const [bounds, setBounds] = useState<google.maps.LatLngBoundsLiteral>();

  const changeCenter = useCallback((newCenter: google.maps.LatLng | null) => {
    // circle edit
    if (!newCenter) return;
    setCenter({ lng: newCenter.lng(), lat: newCenter.lat() });
  }, []);

  const changeBounds = useCallback((newBounds: google.maps.LatLngBounds | null) => {
    // rectangle edit
    if (!newBounds) return;
    setBounds(newBounds.toJSON());
  }, []);

  const nextArea = useCallback(() => {
    setArea((prevState) => {
      const prevIndex = areas.findIndex((area) => area === prevState);
      return prevIndex > -1 ? areas[prevIndex + 1] : areas[0];
    });
  }, [areas]);

  const hasNextArea = useMemo(() => {
    const index = areas.findIndex((a) => a === area);
    return index < areas.length - 1;
  }, [areas, area]);

  const previousArea = useCallback(() => {
    setArea((prevState) => {
      const prevIndex = areas.findIndex((area) => area === prevState);
      return prevIndex > 0 ? areas[prevIndex - 1] : undefined;
    });
  }, [areas]);

  const hasPreviousArea = useMemo(() => {
    const index = areas.findIndex((a) => a === area);
    return index > 0;
  }, [areas, area]);

  useEffect(() => {
    if (prevIsEditingMap.current && !isEditingMap) nextArea();
    prevIsEditingMap.current = isEditingMap;
  }, [isEditingMap]);

  useEffect(() => {
    if (area) {
      if (isCirculo(area)) {
        setMapCenter({ ...area.center });
        setCenter({ ...area.center });
        setRadius(area.radius);
        setBounds(undefined);
      } else if (isRetangulo(area)) {
        if (google.maps.LatLngBounds) {
          const latLngBounds = new window.google.maps.LatLngBounds(area.bounds);
          setMapCenter(latLngBounds.getCenter().toJSON());
        } else {
          setMapCenter({
            lat: (area.bounds.south + area.bounds.north) / 2,
            lng: (area.bounds.west + area.bounds.east) / 2,
          });
        }
        setBounds({ ...area.bounds });
        setCenter(undefined);
        setRadius(undefined);
      }
    }
  }, [area]);

  return isEditingMap ? (
    <Fragment>
      <div className="container mx-auto flex items-end justify-evenly p-3">
        <div>
          <button
            className="flex w-36 justify-center bg-blue-600 px-3 py-1.5 text-lg font-semibold leading-6 text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:bg-gray-700"
            onClick={() => setIsEditingMap(false)}
            disabled={!areas.length}
          >
            Continuar
          </button>
        </div>
      </div>
      <DrawingMap className="max-h-[calc(100vh_-_6rem)]" mapTypeId={"terrain"} />
    </Fragment>
  ) : (
    area && (
      <div className="min-h-screen">
        <form
          action={(formData) => {
            console.log(formData);
          }}
          className="container mx-auto flex items-end justify-evenly p-3"
        >
          <div>
            <label htmlFor="input-nome" className="block font-medium leading-6">
              Nome
            </label>
            <div className="mt-2">
              <input
                id="input-nome"
                name="nome"
                type="text"
                required
                autoComplete="address-level2"
                placeholder="Nome da área"
                className="block w-72 rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              />
            </div>
          </div>

          <div>
            <label htmlFor="input-sigla" className="block font-medium leading-6">
              Sigla
            </label>
            <div className="mt-2">
              <input
                id="input-sigla"
                name="sigla"
                type="text"
                required
                placeholder="Sigla para área"
                className="block w-36 rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="flex w-36 justify-center bg-blue-600 px-3 py-1.5 text-lg font-semibold leading-6 text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
              onClick={() => console.log("Enviado")}
            >
              Salvar
            </button>
          </div>
        </form>

        <Map
          className="mx-auto aspect-square max-h-[calc(100vh_-_6rem)] text-black sm:aspect-[4/3] lg:aspect-video"
          onCenterChanged={(event) => setMapCenter(event.detail.center)}
          center={mapCenter}
          defaultZoom={13}
          defaultBounds={bounds}
          mapTypeId={"terrain"}
          mapId={process.env.NEXT_PUBLIC_MAP_ID}
          disableDefaultUI
        >
          {isCirculo(area) && (
            <Circulo
              radius={radius}
              center={center}
              onRadiusChanged={setRadius}
              onCenterChanged={changeCenter}
              strokeColor={"#0c4cb3"}
              strokeOpacity={1}
              strokeWeight={3}
              fillColor={"#3b82f6"}
              fillOpacity={0.3}
              editable
              draggable
            />
          )}
          {isRetangulo(area) && (
            <Retangulo
              bounds={bounds}
              onBoundsChanged={changeBounds}
              strokeColor={"#0c4cb3"}
              strokeOpacity={1}
              strokeWeight={3}
              fillColor={"#3b82f6"}
              fillOpacity={0.3}
              editable
              draggable
            />
          )}
        </Map>

        <div className="container mx-auto flex items-end justify-evenly p-3">
          <div>
            <button
              className="flex justify-center bg-gray-600 px-3 py-1.5 text-lg font-semibold leading-6 text-white shadow-sm hover:bg-gray-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-600"
              onClick={() => {
                setIsEditingMap(true);
                setArea(undefined);
                clear();
              }}
            >
              {overlays.length ? "Adicionar" : "Cancelar"}
            </button>
          </div>

          <div>
            <button
              className="flex justify-center bg-red-600 px-3 py-1.5 text-lg font-semibold leading-6 text-white shadow-sm hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
              onClick={() => {
                nextArea();
                remove(areas.findIndex((a) => a === area));
              }}
            >
              Remover
            </button>
          </div>

          <div>
            <button
              type="button"
              className="flex justify-center border-2 border-blue-600 bg-transparent px-3 py-1.5 text-lg font-semibold leading-6 text-white shadow-sm hover:border-blue-500 hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:border-gray-700 disabled:hover:bg-transparent"
              onClick={() => previousArea()}
              disabled={!hasPreviousArea}
            >
              Voltar
            </button>
          </div>

          <div>
            <button
              type="button"
              className="flex justify-center border-2 border-blue-600 bg-transparent px-3 py-1.5 text-lg font-semibold leading-6 text-white shadow-sm hover:border-blue-500 hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:border-gray-700 disabled:hover:bg-transparent"
              onClick={() => nextArea()}
              disabled={!hasNextArea}
            >
              Próximo
            </button>
          </div>
        </div>
      </div>
    )
  );
}
