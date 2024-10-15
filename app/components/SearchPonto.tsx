"use client";
import { useGeo } from "@/contexts/GeoContext";
import { cn } from "@/lib/utils";
import { HTMLAttributes } from "react";

interface Props extends HTMLAttributes<HTMLDivElement> {
  location?: google.maps.LatLngLiteral;
}

export function SearchPonto({ location: locationProps, className, ...props }: Props) {
  const { location: locationNavigator } = useGeo();

  return (
    <div className={cn("flex min-h-screen flex-col items-center justify-center", className)} {...props}>
      <span>
        {locationNavigator.lat}, {locationNavigator.lng}
      </span>
      <span>
        {locationProps?.lat}, {locationProps?.lng}
      </span>
    </div>
  );
}
