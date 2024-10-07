"use client";
import React from "react";
import dynamic from "next/dynamic";
import { ControlPosition, Map } from "@vis.gl/react-google-maps";
const DynamicMapControl = dynamic(() => import("@vis.gl/react-google-maps").then((m) => m.MapControl), { ssr: false });

import { UndoRedoControl } from "./UndoRedoControl";
import { useDrawingManager } from "../../hooks/useDrawingManager";
import { POSITION } from "./MapCenter";
import ControlPanel from "./ControlPanel";

const DrawingMap = () => {
  const drawingManager = useDrawingManager();

  return (
    <>
      <Map
        className="mx-auto aspect-square max-h-[calc(100vh_-_6rem)] sm:aspect-[4/3] lg:aspect-video"
        defaultZoom={14}
        defaultCenter={POSITION}
        gestureHandling={"greedy"}
        disableDefaultUI={true}
      />

      <ControlPanel />

      <DynamicMapControl position={ControlPosition.TOP_CENTER}>
        <UndoRedoControl drawingManager={drawingManager} />;
      </DynamicMapControl>
    </>
  );
};

export default DrawingMap;
