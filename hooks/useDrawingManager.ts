import { useMarker } from "@/contexts/MarkerContext";
import { useMap, useMapsLibrary } from "@vis.gl/react-google-maps";
import { useEffect, useRef, useState } from "react";

export function useDrawingManager(initialValue: google.maps.drawing.DrawingManager | null = null) {
  const map = useMap();
  const drawing = useMapsLibrary("drawing");
  const { mode } = useMarker();
  const previousMode = useRef<typeof mode>();

  const [drawingManager, setDrawingManager] = useState<google.maps.drawing.DrawingManager | null>(initialValue);

  useEffect(() => {
    if (mode === "static" || !map || !drawing) return;

    // https://developers.google.com/maps/documentation/javascript/reference/drawing
    const newDrawingManager = new drawing.DrawingManager({
      map,
      drawingMode: google.maps.drawing.OverlayType.MARKER,
      drawingControl: true,
      drawingControlOptions: {
        position: google.maps.ControlPosition.TOP_LEFT,
        drawingModes: [google.maps.drawing.OverlayType.MARKER],
      },
      markerOptions: {
        draggable: true,
      },
    });

    setDrawingManager(newDrawingManager);
    previousMode.current = mode;
    return () => {
      newDrawingManager.setMap(null);
    };
  }, [drawing, map, mode]);

  useEffect(() => {
    if (previousMode.current && previousMode.current !== mode) {
      if (mode === "editing") drawingManager!.setMap(map);
      else if (mode === "static") drawingManager!.setMap(null);
      previousMode.current = mode;
    }
  }, [map, mode, drawingManager]);

  return drawingManager;
}
