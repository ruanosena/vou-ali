"use client";
import React, { useRef, useEffect, useState } from "react";
import { useMapsLibrary } from "@vis.gl/react-google-maps";

interface Props {
  onPlaceSelect: (place: google.maps.places.PlaceResult | null) => void;
}

// This is an example of the classic "Place Autocomplete" widget.
// https://developers.google.com/maps/documentation/javascript/place-autocomplete
export const PlaceAutocomplete = ({ onPlaceSelect }: Props) => {
  const [placeAutocomplete, setPlaceAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const places = useMapsLibrary("places");
  const [location, setLocation] = useState<google.maps.LatLngLiteral>();

  useEffect(() => {
    if ("geolocation" in navigator) {
      // Retrieve latitude & longitude coordinates from `navigator.geolocation` Web API
      navigator.geolocation.getCurrentPosition(({ coords }) => {
        const { latitude, longitude } = coords;
        setLocation({ lat: latitude, lng: longitude });
      });
    }
  }, []);

  useEffect(() => {
    if (!places || !inputRef.current) return;

    const options: google.maps.places.AutocompleteOptions = {
      fields: ["geometry", "name", "formatted_address"],
    };
    if (location) {
      // Create a bounding box with sides ~15km away from the coordinates
      options.bounds = {
        north: location.lat + 0.15,
        south: location.lat - 0.15,
        east: location.lng + 0.15,
        west: location.lng - 0.15,
      };
      options.strictBounds = false;
    }

    setPlaceAutocomplete(new places.Autocomplete(inputRef.current, options));
  }, [places, location]);

  useEffect(() => {
    if (!placeAutocomplete) return;

    placeAutocomplete.addListener("place_changed", () => {
      onPlaceSelect(placeAutocomplete.getPlace());
    });
  }, [onPlaceSelect, placeAutocomplete]);

  return (
    <div className="autocomplete-container">
      <input className="w-56 text-base text-background sm:w-80 sm:text-lg/[1.875rem]" ref={inputRef} />
    </div>
  );
};
