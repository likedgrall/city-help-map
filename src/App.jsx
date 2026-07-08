import { useEffect, useRef, useState } from "react";
import HeroSection from "./components/HeroSection/HeroSection";
import AboutSection from "./components/AboutSection/AboutSection";
import SearchResultsSection from "./components/SearchResultsSection/SearchResultsSection.jsx";
import SearchTransitionOverlay from "./components/SearchTransitionOverlay/SearchTransitionOverlay.jsx";
import "./App.module.css";

const TRANSITION_TIMING = {
  cloudIn: 900,
  loading: 2000,
  cloudOut: 900,
};

function App() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState("Мончегорск");
  const [isResultsOpen, setIsResultsOpen] = useState(false);
  const [isHomeHidden, setIsHomeHidden] = useState(false);
  const [transitionStage, setTransitionStage] = useState("idle");
  const transitionTimers = useRef([]);

  useEffect(() => {
    return () => {
      transitionTimers.current.forEach((timerId) => clearTimeout(timerId));
    };
  }, []);

  const addTransitionTimer = (callback, delay) => {
    const timerId = window.setTimeout(callback, delay);
    transitionTimers.current.push(timerId);
  };

  const clearTransitionTimers = () => {
    transitionTimers.current.forEach((timerId) => clearTimeout(timerId));
    transitionTimers.current = [];
  };

  const handleSearch = (query) => {
    clearTransitionTimers();
    setSearchQuery(query.trim());
    setTransitionStage("cloud-in");

    addTransitionTimer(() => {
      setIsHomeHidden(true);
      setTransitionStage("loading");
    }, TRANSITION_TIMING.cloudIn);

    addTransitionTimer(() => {
      setIsResultsOpen(true);
      setIsHomeHidden(false);
      setTransitionStage("cloud-out");
    }, TRANSITION_TIMING.cloudIn + TRANSITION_TIMING.loading);

    addTransitionTimer(() => {
      setTransitionStage("idle");
      transitionTimers.current = [];
    }, TRANSITION_TIMING.cloudIn +
      TRANSITION_TIMING.loading +
      TRANSITION_TIMING.cloudOut);
  };

  const handleBackToHome = () => {
    clearTransitionTimers();
    setTransitionStage("cloud-in");

    addTransitionTimer(() => {
      setIsResultsOpen(false);
      setIsHomeHidden(false);
      setSearchQuery("");
      setTransitionStage("cloud-out");
    }, TRANSITION_TIMING.cloudIn);

    addTransitionTimer(() => {
      setTransitionStage("idle");
      transitionTimers.current = [];
    }, TRANSITION_TIMING.cloudIn + TRANSITION_TIMING.cloudOut);
  };

  return (
    <>
      {isResultsOpen ? (
        <SearchResultsSection
          searchQuery={searchQuery}
          selectedCity={selectedCity}
          onBack={handleBackToHome}
        />
      ) : isHomeHidden ? null : (
        <>
          <HeroSection
            selectedCity={selectedCity}
            onCityChange={setSelectedCity}
            onSearch={handleSearch}
          />
          <AboutSection />
        </>
      )}
      <SearchTransitionOverlay stage={transitionStage} />
    </>
  );
}

export default App;
