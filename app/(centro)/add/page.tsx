"use client";
import { Map } from "@vis.gl/react-google-maps";
import { ControlPanel } from "@/app/components/ControlPanel";
import { DrawingMap } from "@/app/components/DrawingMap";
import { useOverlayGeometry } from "@/contexts/overlayGeometryContext";
import { notFound } from "next/navigation";
import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import { isCircle, isCirculo, isRectangle, isRetangulo } from "@/types/maps";
import { Circulo } from "@/app/components/Circulo";
import { Retangulo } from "@/app/components/Retangulo";

export default function AddCentro() {
  if (process.env.NODE_ENV === "production") {
    return notFound();
  }
  const { snapshots: areas } = useOverlayGeometry();
  const [isEditingMap, setIsEditingMap] = useState(!areas.length);

  const editingAreaIndex = useRef<number | null>(null);
  const [mapCenter, setMapCenter] = useState<google.maps.LatLngLiteral>();
  const [center, setCenter] = useState<google.maps.LatLngLiteral>();
  const [radius, setRadius] = useState<number>();
  const [bounds, setBounds] = useState<google.maps.LatLngBoundsLiteral>();

  const changeCenter = useCallback((newCenter: google.maps.LatLng | null) => {
    if (!newCenter) return;
    setCenter({ lng: newCenter.lng(), lat: newCenter.lat() });
  }, []);

  const changeBounds = useCallback((newBounds: google.maps.LatLngBounds | null) => {
    if (!newBounds) return;
    setBounds(newBounds.toJSON());
  }, []);

  const nextArea = useCallback(() => {
    if (!isEditingMap) {
      if (editingAreaIndex.current == null) {
        editingAreaIndex.current = 0;
      } else editingAreaIndex.current++;
      const area = areas[editingAreaIndex.current];

      if (isCirculo(area)) {
        setMapCenter({ ...area.center });
        setCenter({ ...area.center });
        setRadius(area.radius);
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
      }
    }
  }, [areas, isEditingMap]);

  useEffect(() => {
    if (!isEditingMap && editingAreaIndex.current == null) nextArea();
    else if (isEditingMap) editingAreaIndex.current = null;
  }, [isEditingMap, nextArea]);

  return isEditingMap ? (
    <Fragment>
      <DrawingMap className="max-h-[calc(100vh_-_6rem)]" />
      <ControlPanel />
    </Fragment>
  ) : (
    <div>
      <span>Check areas before creating</span>
      <button onClick={() => setIsEditingMap(true)}>Edit Areas</button>
      <Map
        className="mx-auto aspect-square max-h-[calc(100vh_-_6rem)] text-black sm:aspect-[4/3] lg:aspect-video"
        onCenterChanged={(event) => setMapCenter(event.detail.center)}
        center={mapCenter}
        defaultZoom={14}
        mapTypeId={"terrain"}
        mapId={process.env.NEXT_PUBLIC_MAP_ID}
      >
        {isCirculo(areas[editingAreaIndex.current ?? 0]) ? (
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
        ) : (
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
    </div>
  );
}
