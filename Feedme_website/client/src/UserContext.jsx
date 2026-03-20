import React, { createContext, useContext, useEffect, useState } from "react";

const UserContext = createContext();

const defaultGuestUser = {
  isLoggedIn: false,
  name: "Guest",
  email: "",
};

export function UserProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("feedme_user");
    return saved ? JSON.parse(saved) : defaultGuestUser;
  });

  useEffect(() => {
    localStorage.setItem("feedme_user", JSON.stringify(user));
  }, [user]);

  function login(userData) {
    setUser({
      isLoggedIn: true,
      name: userData.name || "User",
      email: userData.email || "",
    });
  }

  function continueAsGuest() {
    setUser(defaultGuestUser);
  }

  function logout() {
    setUser(defaultGuestUser);
  }

  return (
    <UserContext.Provider
      value={{
        user,
        login,
        logout,
        continueAsGuest,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}