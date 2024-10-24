import { useGeo } from "@/contexts/GeoContext";
import { useCallback, useEffect, useState } from "react";

type SearchSettings = {
  geolocation: boolean;
  sortByDistance: boolean;
  calcDistance: boolean;
};

export const useSearchSettings = (storageKey = "@ruanosena:search-settings-0.1.0") => {
  const { isDefaultLocation, promptGeolocation } = useGeo();
  const [geolocationOn, setGeolocationOn] = useState(false);
  const [sortByDistanceOn, setSortByDistanceOn] = useState(true);
  const [calcDistanceOn, setCalcDistanceOn] = useState(true);

  const setLocalStorageKey = useCallback(
    (key: keyof SearchSettings, value: SearchSettings[keyof SearchSettings]) => {
      let settings: SearchSettings | string | null = localStorage.getItem(storageKey);

      if (settings) settings = JSON.parse(settings) as SearchSettings;
      else settings = { geolocation: geolocationOn, sortByDistance: sortByDistanceOn, calcDistance: calcDistanceOn };

      settings[key] = value;
      localStorage.setItem(storageKey, JSON.stringify(settings));
    },
    [storageKey, geolocationOn, sortByDistanceOn],
  );

  const handleChangeGeolocationOn = useCallback(
    (on: boolean) => {
      if (on) {
        if (isDefaultLocation) {
          promptGeolocation(() => {
            setLocalStorageKey("geolocation", on);
            setGeolocationOn(on);
          });
        } else {
          setLocalStorageKey("geolocation", on);
          setGeolocationOn(on);
        }
      } else {
        setLocalStorageKey("geolocation", on);
        setGeolocationOn(on);
      }
    },
    [promptGeolocation, isDefaultLocation],
  );

  const handleChangeSortByDistance = useCallback((on: boolean) => {
    setLocalStorageKey("sortByDistance", on);
    setSortByDistanceOn(on);
  }, []);

  const handleChangeCalcDistance = useCallback((on: boolean) => {
    setLocalStorageKey("calcDistance", on);
    setCalcDistanceOn(on);
  }, []);

  useEffect(() => {
    let settings: SearchSettings | string | null = localStorage.getItem(storageKey);
    if (settings) {
      settings = JSON.parse(settings) as SearchSettings;
      setGeolocationOn(settings.geolocation);
      setSortByDistanceOn(settings.sortByDistance);
      setCalcDistanceOn(settings.calcDistance);
    }
  }, []);

  useEffect(() => {
    // asks for permission if active and changes if not accepted
    if (geolocationOn && isDefaultLocation)
      promptGeolocation(null, () => {
        setLocalStorageKey("geolocation", false);
        setGeolocationOn(false);
      });
  }, [geolocationOn, isDefaultLocation]);

  return {
    geolocationOn,
    sortByDistanceOn,
    calcDistanceOn,
    handleChangeGeolocationOn,
    handleChangeSortByDistance,
    handleChangeCalcDistance,
  };
};
