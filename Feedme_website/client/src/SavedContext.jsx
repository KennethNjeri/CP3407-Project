import React, { createContext, useContext, useEffect, useState } from "react";

const SavedContext = createContext();

export function SavedProvider({ children }) {
  const [savedRestaurants, setSavedRestaurants] = useState(() => {
    const saved = localStorage.getItem("feedme_saved_restaurants");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem(
      "feedme_saved_restaurants",
      JSON.stringify(savedRestaurants)
    );
  }, [savedRestaurants]);

  function isSaved(restaurantId) {
    return savedRestaurants.some((r) => String(r.id) === String(restaurantId));
  }

  function toggleSaved(restaurant) {
    setSavedRestaurants((prev) => {
      const exists = prev.some((r) => String(r.id) === String(restaurant.id));

      if (exists) {
        return prev.filter((r) => String(r.id) !== String(restaurant.id));
      }

      return [...prev, restaurant];
    });
  }

  function removeSaved(restaurantId) {
    setSavedRestaurants((prev) =>
      prev.filter((r) => String(r.id) !== String(restaurantId))
    );
  }

  return (
    <SavedContext.Provider
      value={{
        savedRestaurants,
        isSaved,
        toggleSaved,
        removeSaved,
      }}
    >
      {children}
    </SavedContext.Provider>
  );
}

export function useSaved() {
  return useContext(SavedContext);
}