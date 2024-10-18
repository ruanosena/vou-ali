"use client";
import { useMapsLibrary } from "@vis.gl/react-google-maps";
import { createContext, ReactNode, useCallback, useContext, useEffect, useRef, useState } from "react";

// GeoContext does not save location in localStorage because it is not secure

type GeoProviderProps = {
  children: ReactNode;
};

interface GeoProviderState {
  location: google.maps.LatLngLiteral;
  locationBias: google.maps.LatLngBoundsLiteral;
  isDefaultLocation: boolean;
  geometryAvailable: boolean;
  mapsGetBoundingBox: (lat: number, lng: number, radius?: number) => google.maps.LatLngBoundsLiteral;
}

const initialState: GeoProviderState = {
  // Brasil default
  location: { lat: -14.4095261, lng: -51.31668 },
  // Bias as Brazil bounds
  locationBias: {
    east: -21.961211249999998,
    north: 7.431802874755189,
    south: -34.32198851984677,
    west: -80.67214874999999,
  },
  isDefaultLocation: true,
  geometryAvailable: false,
  mapsGetBoundingBox: () => ({}) as google.maps.LatLngBoundsLiteral,
};

const GeoProviderContext = createContext<GeoProviderState>(initialState);

export function GeoProvider({ children, ...props }: GeoProviderProps) {
  const [location, setLocation] = useState<google.maps.LatLngLiteral>(initialState.location);
  const [isDefaultLocation, setIsDefaultLocation] = useState(initialState.isDefaultLocation);
  const [locationBias, setLocationBias] = useState<google.maps.LatLngBoundsLiteral>(initialState.locationBias);
  const [geometryAvailable, setGeometryAvailable] = useState(initialState.geometryAvailable);
  const geometry = useMapsLibrary("geometry");

  const mapsGetBoundingBox = useCallback(
    (lat: number, lng: number, radius = 10000): google.maps.LatLngBoundsLiteral => {
      // Create a bounding box with sides ~10km (default) away from the coordinates
      const bounds = new google.maps.LatLngBounds();
      [0, 90, 180, 270].forEach((angle) => {
        const side = geometry!.spherical.computeOffset({ lat, lng }, radius, angle);
        bounds.extend(side);
      });
      return bounds.toJSON();
    },
    [geometry],
  );

  useEffect(() => {
    if ("geolocation" in navigator) {
      // Retrieve latitude & longitude coordinates from `navigator.geolocation` Web API
      navigator.geolocation.getCurrentPosition(({ coords }) => {
        const { latitude, longitude } = coords;
        setLocation({ lat: latitude, lng: longitude });
        setIsDefaultLocation(false);
      });
    }
  }, []);

  useEffect(() => {
    if (geometry && !isDefaultLocation) setLocationBias(mapsGetBoundingBox(location.lat, location.lng));
    setGeometryAvailable(!!geometry);
  }, [geometry, location, isDefaultLocation]);

  const value: GeoProviderState = {
    location,
    locationBias,
    isDefaultLocation: isDefaultLocation,
    mapsGetBoundingBox,
    geometryAvailable,
  };

  return (
    <GeoProviderContext.Provider {...props} value={value}>
      {children}
    </GeoProviderContext.Provider>
  );
}

export const useGeo = () => {
  const context = useContext(GeoProviderContext);

  if (context === undefined) throw new Error("useGeo must be used within a GeoProvider");

  return context;
};
