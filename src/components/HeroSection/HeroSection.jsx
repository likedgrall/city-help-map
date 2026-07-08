import { useState } from "react";

const MAIN_ROADS = [
  "M-50 185 C160 105 260 260 440 216 S700 98 865 226 S1170 420 1490 248",
  "M-80 700 C130 575 288 736 495 625 S770 586 930 696 S1220 775 1500 590",
  "M286 -30 C315 165 395 255 356 420 S420 673 352 940",
  "M1062 -35 C961 174 1087 288 1015 476 S1090 704 1025 930",
];

const SECONDARY_ROADS = [
  "M-30 382 C190 355 242 470 410 440 S646 327 778 409 S1080 505 1475 442",
  "M80 55 C205 180 186 300 275 367 S446 536 603 488 S845 464 940 568 S1232 709 1410 791",
  "M588 -20 C560 135 647 250 585 346 S591 576 744 650 S844 779 793 925",
];

const PIN_CLASSES = [
  "pin-one",
  "pin-two",
  "pin-three",
  "pin-four",
  "pin-five",
  "pin-six",
  "pin-seven",
];

const CITIES = ["Лиски", "Мончегорск", "Мурманск"];

const CATEGORIES = [
  "Медицина",
  "Волонтёры",
  "Документы",
  "Соцпомощь",
  "Детям",
  "Животные",
];
function MapPin({ className }) {
  return (
    <span className={`map-pin ${className}`} aria-hidden="true">
      <i />
    </span>
  );
}

function MapBackground() {
  return (
    <div className="map-background" aria-hidden="true">
      <div className="map-grid" />
      <svg
        className="map-roads"
        viewBox="0 0 1440 900"
        preserveAspectRatio="none"
      >
        {MAIN_ROADS.map((path) => (
          <path key={path} className="road road-main" d={path} />
        ))}
        {SECONDARY_ROADS.map((path) => (
          <path key={path} className="road" d={path} />
        ))}
      </svg>
      <span className="map-park park-one" />
      <span className="map-park park-two" />
      <span className="map-water" />
      <span className="scan scan-one" />
      <span className="scan scan-two" />
      {PIN_CLASSES.map((className) => (
        <MapPin key={className} className={className} />
      ))}
    </div>
  );
}

function HeroSection({ selectedCity, onCityChange, onSearch }) {
  const [query, setQuery] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
    onSearch(query);
  };

  const handleCategorySearch = (category) => {
    setQuery(category);
    onSearch(category);
  };

  return (
    <main className="hero">
      <MapBackground />
      <label className="city-selector">
        <i className="fa-solid fa-map-pin" aria-hidden="true" />
        <select
          value={selectedCity}
          onChange={(event) => onCityChange(event.target.value)}
          aria-label="Выбор города"
        >
          {CITIES.map((city) => (
            <option key={city} value={city}>
              {city}
            </option>
          ))}
        </select>
      </label>
      <section className="hero-content" aria-labelledby="hero-title">
        <h1 id="hero-title">Карта помощи города</h1>
        <form className="search-card" onSubmit={handleSubmit}>
          <label className="search-field">
            <input
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Что ищем?"
              aria-label="Поиск помощи"
            />
          </label>
          <button className="search-button" type="submit" aria-label="Найти">
            Найти
            <i className="fa-solid fa-magnifying-glass" aria-hidden="true" />
          </button>
          <div className="category-list" aria-label="Быстрые категории">
            {CATEGORIES.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => handleCategorySearch(category)}
              >
                {category}
              </button>
            ))}
          </div>
          <p className="search-hint">
            Например: поликлиника, помощь детям, документы, приют для животных
          </p>
        </form>
      </section>
    </main>
  );
}

export default HeroSection;
