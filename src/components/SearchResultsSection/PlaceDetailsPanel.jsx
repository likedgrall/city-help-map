const renderRatingStars = (rating) => {
  return Array.from({ length: 5 }, (_, index) => (
    <span className="rating-star" key={index} aria-hidden="true">
      <i className="fa-solid fa-star" />
      <i
        className="fa-solid fa-star rating-star-fill"
        style={{
          width: `${Math.max(0, Math.min(1, rating - index)) * 100}%`,
        }}
      />
    </span>
  ));
};

function PlaceDetailsPanel({ place, isClosing, onClose }) {
  if (!place) {
    return null;
  }

  return (
    <aside
      className={`place-details-panel ${isClosing ? "place-details-panel-closing" : ""}`}
      aria-label={`Подробнее: ${place.title}`}
    >
      <button
        className="place-details-close"
        type="button"
        onClick={onClose}
        aria-label="Закрыть подробную карточку"
      >
        <i className="fa-solid fa-xmark" aria-hidden="true" />
      </button>

      {place.banner ? (
        <img className="place-details-banner" src={place.banner} alt={place.title} />
      ) : (
        <div className="place-details-banner place-details-banner-empty">
          Фотографий нет
        </div>
      )}

      <div className="place-details-content">
        <span className="place-details-category">{place.category}</span>
        <h3>{place.title}</h3>
        <p className="place-details-address">{place.address}</p>

        <div
          className="place-details-rating"
          aria-label={`Рейтинг ${place.rating} из 5`}
        >
          <span className="place-details-stars">
            {renderRatingStars(place.rating)}
          </span>
          <strong>{place.rating}</strong>
        </div>

        <p>{place.description}</p>
        <p>{place.details}</p>

        <dl className="place-details-meta">
          <div>
            <dt>Тип помощи</dt>
            <dd>{place.helpType}</dd>
          </div>
          <div>
            <dt>Телефон</dt>
            <dd>{place.phone}</dd>
          </div>
          <div>
            <dt>Координаты</dt>
            <dd>{place.coords.join(", ")}</dd>
          </div>
        </dl>
      </div>
    </aside>
  );
}

export default PlaceDetailsPanel;
