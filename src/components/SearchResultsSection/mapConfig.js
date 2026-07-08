import L from "leaflet";

export const MAP_CENTER = [67.9386, 32.9358];

export const LEAFLET_ATTRIBUTION_PREFIX =
  '<span title="Россия">🇷🇺</span> <a href="https://leafletjs.com/" title="A JavaScript library for interactive maps">Leaflet</a>';

export function createPlaceIcon(isSelected) {
  return L.divIcon({
    className: `place-marker ${isSelected ? "place-marker-selected" : ""}`,
    html: '<i class="fa-solid fa-map-pin"></i>',
    iconSize: isSelected ? [40, 48] : [26, 32],
    iconAnchor: isSelected ? [20, 46] : [13, 30],
    popupAnchor: [0, isSelected ? -44 : -28],
  });
}
