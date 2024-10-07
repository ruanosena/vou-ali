"use client";
import React, { PropsWithChildren } from "react";
import dynamic from "next/dynamic";
import { ControlPosition, Map, MapProps } from "@vis.gl/react-google-maps";
const DynamicMapControl = dynamic(() => import("@vis.gl/react-google-maps").then((m) => m.MapControl), { ssr: false });

import { UndoRedoControl } from "./UndoRedoControl";
import { useDrawingManager } from "../../hooks/useDrawingManager";
import { POSITION } from "./MapCenter";
import { cn } from "@/lib/utils";

interface Props extends PropsWithChildren<MapProps> {}

export function DrawingMap({ className, ...props }: Props) {
  const drawingManager = useDrawingManager();

  return (
    <>
      <Map
        className={cn("mx-auto aspect-square sm:aspect-[4/3] lg:aspect-video", className)}
        defaultZoom={14}
        defaultCenter={POSITION}
        gestureHandling={"greedy"}
        disableDefaultUI={true}
        {...props}
      />

      <DynamicMapControl position={ControlPosition.TOP_CENTER}>
        <UndoRedoControl drawingManager={drawingManager} />;
      </DynamicMapControl>
    </>
  );
}
