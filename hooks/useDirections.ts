import { useMapsLibrary } from "@vis.gl/react-google-maps";
import { useEffect, useState } from "react";

export function useDirections(
  destination: google.maps.DirectionsRequest["destination"],
  origin?: google.maps.DirectionsRequest["origin"],
) {
  const routesLibrary = useMapsLibrary("routes");
  const [directionsService, setDirectionsService] = useState<google.maps.DirectionsService>();
  const [leg, setLeg] = useState<google.maps.DirectionsLeg>();

  // Initialize directions service and renderer
  useEffect(() => {
    if (!routesLibrary) return;
    setDirectionsService(new routesLibrary.DirectionsService());
  }, [routesLibrary]);

  // Use directions service
  useEffect(() => {
    if (!directionsService || !origin) return;

    directionsService
      .route({
        origin,
        destination,
        travelMode: google.maps.TravelMode.DRIVING,
        provideRouteAlternatives: true,
      })
      .then((response) => {
        setLeg(response.routes[0].legs[0]);
      })
      .catch(console.error);
  }, [directionsService, origin, destination]);

  return { leg };
}
