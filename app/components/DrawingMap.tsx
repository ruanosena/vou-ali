"use client";
import React from "react";
import { ControlPosition, Map, MapControl } from "@vis.gl/react-google-maps";

import { UndoRedoControl } from "./UndoRedoControl";
import { useDrawingManager } from "../../hooks/useDrawingManager";
import ControlPanel from "./ControlPanel";
import { POSITION } from "./MapCenter";

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

      <MapControl position={ControlPosition.TOP_CENTER}>
        <UndoRedoControl drawingManager={drawingManager} />
      </MapControl>
    </>
  );
};

export default DrawingMap;
