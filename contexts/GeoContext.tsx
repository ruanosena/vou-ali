"use client";
import { getBoundingBox } from "@/lib/utils";
import { createContext, ReactNode, useContext, useEffect, useRef, useState } from "react";

// GeoContext does not save location in localStorage because it is not secure

type GeoProviderProps = {
  children: ReactNode;
};

interface GeoProviderState {
  location: google.maps.LatLngLiteral;
  locationBias: google.maps.LatLngBoundsLiteral;
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
};

const GeoProviderContext = createContext<GeoProviderState>(initialState);

export function GeoProvider({ children, ...props }: GeoProviderProps) {
  const [location, setLocation] = useState<google.maps.LatLngLiteral>(initialState.location);
  const [locationBias, setLocationBias] = useState<google.maps.LatLngBoundsLiteral>(initialState.locationBias);

  useEffect(() => {
    if ("geolocation" in navigator) {
      // Retrieve latitude & longitude coordinates from `navigator.geolocation` Web API
      navigator.geolocation.getCurrentPosition(({ coords }) => {
        const { latitude, longitude } = coords;
        setLocation({ lat: latitude, lng: longitude });
        setLocationBias(getBoundingBox(latitude, longitude));
      });
    }
  }, []);

  const value: GeoProviderState = {
    location,
    locationBias,
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
