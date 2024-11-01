// "use client"; // not used since parent is already a client boundary
import React, { useEffect, useState, useCallback, FormEvent } from "react";
import { useMap, useMapsLibrary } from "@vis.gl/react-google-maps";
import { useGeo } from "@/contexts/GeoContext";

interface Props {
  onPlaceSelect: (place: google.maps.places.PlaceResult | null) => void;
}

// This is a custom built autocomplete component using the "Autocomplete Service" for predictions
// and the "Places Service" for place details
export const AutocompleteCustom = ({ onPlaceSelect }: Props) => {
  const map = useMap();
  const places = useMapsLibrary("places");

  // https://developers.google.com/maps/documentation/javascript/reference/places-autocomplete-service#AutocompleteSessionToken
  const [sessionToken, setSessionToken] = useState<google.maps.places.AutocompleteSessionToken>();

  // https://developers.google.com/maps/documentation/javascript/reference/places-autocomplete-service
  const [autocompleteService, setAutocompleteService] = useState<google.maps.places.AutocompleteService | null>(null);

  // https://developers.google.com/maps/documentation/javascript/reference/places-service
  const [placesService, setPlacesService] = useState<google.maps.places.PlacesService | null>(null);

  const [predictionResults, setPredictionResults] = useState<Array<google.maps.places.AutocompletePrediction>>([]);

  const [inputValue, setInputValue] = useState<string>("");

  const { locationBias, isDefaultLocation, promptGeolocation } = useGeo();

  const [fetchDebounce, setFetchDebounce] = useState<NodeJS.Timeout>();

  const fetchPredictions = useCallback(
    async (inputValue: string) => {
      if (!autocompleteService || !inputValue) {
        setPredictionResults([]);
        return;
      }

      const request: google.maps.places.AutocompletionRequest = { input: inputValue, sessionToken };
      if (!isDefaultLocation) request.locationBias = locationBias;
      const response = await autocompleteService.getPlacePredictions(request);

      setPredictionResults(response.predictions);
    },
    [autocompleteService, sessionToken, locationBias, isDefaultLocation],
  );

  const handleInputChange = useCallback(
    (event: FormEvent<HTMLInputElement>) => {
      const value = event.currentTarget.value;

      setInputValue(value);

      // debouncing for fetching predictions
      clearTimeout(fetchDebounce);
      setFetchDebounce(setTimeout(() => fetchPredictions(value), 500));
    },
    [fetchPredictions, fetchDebounce],
  );

  const handleSuggestionClick = useCallback(
    (placeId: string) => {
      if (!places) return;

      const detailRequestOptions = {
        placeId,
        fields: ["geometry", "name", "formatted_address"],
        sessionToken,
      };

      const detailsRequestCallback = (placeDetails: google.maps.places.PlaceResult | null) => {
        onPlaceSelect(placeDetails);
        setPredictionResults([]);
        setInputValue(placeDetails?.formatted_address ?? "");
        setSessionToken(new places.AutocompleteSessionToken());
      };

      placesService?.getDetails(detailRequestOptions, detailsRequestCallback);
    },
    [onPlaceSelect, places, placesService, sessionToken],
  );

  useEffect(() => {
    promptGeolocation();
  }, []);

  useEffect(() => {
    if (!places || !map) return;

    setAutocompleteService(new places.AutocompleteService());
    setPlacesService(new places.PlacesService(map));
    setSessionToken(new places.AutocompleteSessionToken());

    return () => setAutocompleteService(null);
  }, [map, places]);

  return (
    <div className="autocomplete-container">
      <input
        className="w-full max-w-56 rounded-sm sm:max-w-80"
        value={inputValue}
        onInput={(event: FormEvent<HTMLInputElement>) => handleInputChange(event)}
        placeholder="Pesquise um local"
      />

      {predictionResults.length > 0 && (
        <ul
          className="custom-list mt-1 max-h-56 w-full max-w-56 overflow-auto rounded-md bg-foreground bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:max-w-80 sm:text-sm"
          tabIndex={-1}
          role="listbox"
        >
          {predictionResults.map(({ place_id, description }) => {
            return (
              <li
                key={place_id}
                className="custom-list-item relative cursor-default select-none px-3 py-2 text-gray-900"
                role="option"
                onClick={() => handleSuggestionClick(place_id)}
              >
                <span className="block truncate font-normal">{description}</span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};
