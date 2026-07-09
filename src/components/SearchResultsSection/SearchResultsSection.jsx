import { useEffect, useMemo, useRef, useState } from "react";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import { places } from "../../data/places";
import PlaceDetailsPanel from "./PlaceDetailsPanel";
import { MAP_CENTER, createPlaceIcon } from "./mapConfig";
import { MapAttributionPrefix, MapViewport } from "./mapHelpers";
import {
  QUICK_CATEGORIES,
  filterPlacesBySearch,
  normalizeSearchValue,
} from "./search";

function SearchResultsSection({ searchQuery, selectedCity, onBack }) {
  const [localQuery, setLocalQuery] = useState(searchQuery);
  const [selectedPlaceId, setSelectedPlaceId] = useState(places[0]?.id ?? null);
  const [detailsPlace, setDetailsPlace] = useState(null);
  const [isDetailsClosing, setIsDetailsClosing] = useState(false);
  const [isPanelOpen, setIsPanelOpen] = useState(true);
  const [activeMobileView, setActiveMobileView] = useState("list");
  const [popupPlaceId, setPopupPlaceId] = useState(null);
  const markerRefs = useRef({});

  const cityPlaces = useMemo(
    () =>
      places.filter(
        (place) =>
          normalizeSearchValue(place.city) === normalizeSearchValue(selectedCity),
      ),
    [selectedCity],
  );

  const filteredPlaces = useMemo(
    () => filterPlacesBySearch(cityPlaces, localQuery),
    [cityPlaces, localQuery],
  );

  const selectedPlace = useMemo(() => {
    if (filteredPlaces.length === 0) {
      return null;
    }

    return (
      filteredPlaces.find((place) => place.id === selectedPlaceId) ??
      filteredPlaces[0]
    );
  }, [filteredPlaces, selectedPlaceId]);

  useEffect(() => {
    if (!popupPlaceId || activeMobileView !== "map") {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      const marker = markerRefs.current[popupPlaceId];

      if (marker) {
        try {
          marker.openPopup();
        } catch {
          // Popup auto-pan can fail while Leaflet recalculates a just-shown map.
        }
        setPopupPlaceId(null);
      }
    }, 120);

    return () => window.clearTimeout(timeoutId);
  }, [activeMobileView, popupPlaceId, selectedPlace]);

  const handleSearchSubmit = (event) => {
    event.preventDefault();
  };

  const handleCategorySearch = (category) => {
    setLocalQuery(category);
  };

  const closeDetailsPanel = () => {
    if (!detailsPlace) {
      return;
    }

    setIsDetailsClosing(true);

    window.setTimeout(() => {
      setDetailsPlace(null);
      setIsDetailsClosing(false);
    }, 240);
  };

  const handlePlaceSelect = (place) => {
    setSelectedPlaceId(place.id);
    setPopupPlaceId(place.id);
    setActiveMobileView("map");
    closeDetailsPanel();
  };

  const handleDetailsOpen = (event, place) => {
    event.stopPropagation();
    setIsDetailsClosing(false);
    setDetailsPlace(place);
  };

  return (
    <section className="search-results-section" aria-labelledby="results-title">
      <div className="search-results-container">
        <div
          className={`results-layout ${isPanelOpen ? "" : "panel-collapsed"} ${
            activeMobileView === "map" ? "mobile-map-active" : "mobile-list-active"
          }`}
        >
          <aside className="results-sidebar">
            <header className="search-results-header">
              <div className="results-header-actions">
                <button className="results-back" type="button" onClick={onBack}>
                  <i className="fa-solid fa-chevron-left" aria-hidden="true" />
                  Назад
                </button>
                <button
                  className="mobile-view-switch"
                  type="button"
                  onClick={() => setActiveMobileView("map")}
                >
                  <i className="fa-solid fa-map-location-dot" aria-hidden="true" />
                  Карта
                </button>
              </div>
              <h2 id="results-title">Найденные места помощи</h2>
              <p>
                Здесь будут отображаться организации и точки помощи по выбранной
                категории.
              </p>
            </header>

            <section className="results-list" aria-label="Список мест">
              {filteredPlaces.length === 0 && (
                <p className="empty-results">Ничего не найдено</p>
              )}

              {filteredPlaces.map((place) => (
                <article
                  className={`place-card ${selectedPlace?.id === place.id ? "place-card-active" : ""}`}
                  key={place.id}
                  onClick={() => handlePlaceSelect(place)}
                >
                  <div className="place-card-heading">
                    <h3>{place.title}</h3>
                    <span>{place.category}</span>
                  </div>
                  <p className="place-address">{place.address}</p>
                  <p className="place-description">{place.description}</p>
                  <button
                    className="place-details"
                    type="button"
                    onClick={(event) => handleDetailsOpen(event, place)}
                  >
                    Подробнее
                  </button>
                </article>
              ))}
            </section>
          </aside>

          <button
            className="panel-toggle"
            type="button"
            onClick={() => setIsPanelOpen((isOpen) => !isOpen)}
            aria-label={isPanelOpen ? "Свернуть список" : "Открыть список"}
          >
            <i
              className={`fa-solid ${isPanelOpen ? "fa-chevron-left" : "fa-list-ul"}`}
              aria-hidden="true"
            />
          </button>

          <div className="map-workspace">
            <button
              className="mobile-map-switch"
              type="button"
              onClick={() => setActiveMobileView("list")}
            >
              <i className="fa-solid fa-list-ul" aria-hidden="true" />
              Список
            </button>
            <form className="map-search-panel" onSubmit={handleSearchSubmit}>
              <div className="map-search-row">
                <input
                  type="text"
                  value={localQuery}
                  onChange={(event) => setLocalQuery(event.target.value)}
                  placeholder="Найти место или категорию"
                />
                <button type="submit" aria-label="Найти">
                  <i
                    className="fa-solid fa-magnifying-glass"
                    aria-hidden="true"
                  />
                </button>
              </div>
              <div className="map-category-list" aria-label="Быстрые категории">
                {QUICK_CATEGORIES.map((category) => (
                  <button
                    key={category}
                    type="button"
                    onClick={() => handleCategorySearch(category)}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </form>

            <section
              className="results-placeholder results-map"
              aria-label="Карта"
            >
              <h3>Карта</h3>
              <MapContainer
                center={MAP_CENTER}
                zoom={13}
                scrollWheelZoom
                wheelDebounceTime={20}
                wheelPxPerZoomLevel={90}
                zoomSnap={0.25}
                zoomDelta={0.5}
                zoomControl={false}
                className="leaflet-map"
              >
                <MapAttributionPrefix />
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {selectedPlace && (
                  <MapViewport
                    coords={selectedPlace.coords}
                    viewMode={activeMobileView}
                  />
                )}
                {filteredPlaces.map((place) => (
                  <Marker
                    key={place.id}
                    position={place.coords}
                    icon={createPlaceIcon(selectedPlace?.id === place.id)}
                    ref={(marker) => {
                      if (marker) {
                        markerRefs.current[place.id] = marker;
                      } else {
                        delete markerRefs.current[place.id];
                      }
                    }}
                    eventHandlers={{ click: () => setSelectedPlaceId(place.id) }}
                  >
                    <Popup>
                      <strong>{place.title}</strong>
                      <br />
                      {place.category}
                      <br />
                      {place.address}
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </section>
          </div>
        </div>

        <PlaceDetailsPanel
          place={detailsPlace}
          isClosing={isDetailsClosing}
          onClose={closeDetailsPanel}
        />
      </div>
    </section>
  );
}

export default SearchResultsSection;
