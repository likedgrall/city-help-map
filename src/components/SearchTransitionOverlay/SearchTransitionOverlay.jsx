function SearchTransitionOverlay({ stage }) {
  if (stage === "idle") {
    return null;
  }

  const isLoading = stage === "loading";

  return (
    <div
      className={`search-transition-overlay search-transition-${stage}`}
      aria-live={isLoading ? "polite" : "off"}
      aria-hidden={!isLoading}
    >
      <div className="transition-cloud transition-cloud-one" />
      <div className="transition-cloud transition-cloud-two" />
      <div className="transition-cloud transition-cloud-three" />
      <div className="transition-cloud transition-cloud-four" />

      {isLoading && (
        <div className="transition-loading" role="status">
          <span className="transition-spinner" aria-hidden="true" />
          <p>Ищем подходящие места помощи...</p>
        </div>
      )}
    </div>
  );
}

export default SearchTransitionOverlay;
