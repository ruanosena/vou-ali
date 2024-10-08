/* eslint-disable complexity */
import { forwardRef, useContext, useEffect, useImperativeHandle, useRef } from "react";

import type { Ref } from "react";
import { GoogleMapsContext, latLngEquals } from "@vis.gl/react-google-maps";

type RectangleEventProps = {
  onClick?: (e: google.maps.MapMouseEvent) => void;
  onDrag?: (e: google.maps.MapMouseEvent) => void;
  onDragStart?: (e: google.maps.MapMouseEvent) => void;
  onDragEnd?: (e: google.maps.MapMouseEvent) => void;
  onMouseOver?: (e: google.maps.MapMouseEvent) => void;
  onMouseOut?: (e: google.maps.MapMouseEvent) => void;
  onBoundsChanged?: (b: ReturnType<google.maps.Rectangle["getBounds"]>) => void;
};

export type RectangleProps = google.maps.RectangleOptions & RectangleEventProps;

export type RectangleRef = Ref<google.maps.Rectangle | null>;

function useRectangle(props: RectangleProps) {
  const {
    onClick,
    onDrag,
    onDragStart,
    onDragEnd,
    onMouseOver,
    onMouseOut,
    onBoundsChanged,
    bounds,
    ...rectangleOptions
  } = props;
  // This is here to avoid triggering the useEffect below when the callbacks change (which happen if the user didn't memoize them)
  const callbacks = useRef<Record<string, (e: unknown) => void>>({});
  Object.assign(callbacks.current, {
    onClick,
    onDrag,
    onDragStart,
    onDragEnd,
    onMouseOver,
    onMouseOut,
    onBoundsChanged,
  });

  const rectangle = useRef(new google.maps.Rectangle()).current;
  // update rectangleOptions (note the dependencies aren't properly checked
  // here, we just assume that setOptions is smart enough to not waste a
  // lot of time updating values that didn't change)
  rectangle.setOptions(rectangleOptions);

  useEffect(() => {
    if (!bounds) return;
    if (!rectangle.getBounds()?.equals(bounds)) rectangle.setBounds(bounds);
  }, [bounds]);

  const map = useContext(GoogleMapsContext)?.map;

  // create rectangle instance and add to the map once the map is available
  useEffect(() => {
    if (!map) {
      if (map === undefined) console.error("<Rectangle> has to be inside a Map component.");

      return;
    }

    rectangle.setMap(map);

    return () => {
      rectangle.setMap(null);
    };
  }, [map]);

  // attach and re-attach event-handlers when any of the properties change
  useEffect(() => {
    if (!rectangle) return;

    // Add event listeners
    const gme = google.maps.event;
    [
      ["click", "onClick"],
      ["drag", "onDrag"],
      ["dragstart", "onDragStart"],
      ["dragend", "onDragEnd"],
      ["mouseover", "onMouseOver"],
      ["mouseout", "onMouseOut"],
    ].forEach(([eventName, eventCallback]) => {
      gme.addListener(rectangle, eventName, (e: google.maps.MapMouseEvent) => {
        const callback = callbacks.current[eventCallback];
        if (callback) callback(e);
      });
    });
    gme.addListener(rectangle, "bounds_changed", () => {
      const newBounds = rectangle.getBounds();
      callbacks.current.onBoundsChanged?.(newBounds);
    });

    return () => {
      gme.clearInstanceListeners(rectangle);
    };
  }, [rectangle]);

  return rectangle;
}

/**
 * Component to render a circle on a map
 */
export const Retangulo = forwardRef((props: RectangleProps, ref: RectangleRef) => {
  const rectangle = useRectangle(props);

  useImperativeHandle(ref, () => rectangle);

  return null;
});
