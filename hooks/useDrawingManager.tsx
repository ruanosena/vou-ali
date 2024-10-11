import { useMap, useMapsLibrary } from "@vis.gl/react-google-maps";
import { useEffect, useState } from "react";

export function useDrawingManager(initialValue: google.maps.drawing.DrawingManager | null = null) {
  const map = useMap();
  const drawing = useMapsLibrary("drawing");

  const [drawingManager, setDrawingManager] = useState<google.maps.drawing.DrawingManager | null>(initialValue);

  useEffect(() => {
    if (!map || !drawing) return;

    // https://developers.google.com/maps/documentation/javascript/reference/drawing
    const newDrawingManager = new drawing.DrawingManager({
      map,
      drawingMode: null,
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

    return () => {
      newDrawingManager.setMap(null);
    };
  }, [drawing, map]);

  return drawingManager;
}
