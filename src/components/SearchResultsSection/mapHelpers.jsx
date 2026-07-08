import { useEffect } from "react";
import { useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { LEAFLET_ATTRIBUTION_PREFIX } from "./mapConfig";

const isValidCoords = (coords) =>
  Array.isArray(coords) &&
  coords.length === 2 &&
  coords.every((coord) => Number.isFinite(coord));

export function MapViewport({ coords, viewMode }) {
  const map = useMap();

  useEffect(() => {
    if (viewMode !== "map" || !isValidCoords(coords)) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      try {
        const container = map.getContainer();

        if (container.clientWidth === 0 || container.clientHeight === 0) {
          return;
        }

        map.stop();
        map.invalidateSize();
        map.setView(coords, Number.isFinite(map.getZoom()) ? map.getZoom() : 13, {
          animate: false,
        });
      } catch {
        // Leaflet can produce transient NaN values while its container is hidden.
      }
    }, 80);

    return () => window.clearTimeout(timeoutId);
  }, [coords, map, viewMode]);

  return null;
}

export function MapAttributionPrefix() {
  const map = useMap();

  useEffect(() => {
    map.attributionControl.setPrefix(LEAFLET_ATTRIBUTION_PREFIX);
  }, [map]);

  return null;
}
