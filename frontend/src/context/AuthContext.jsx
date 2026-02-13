import React, { createContext, useContext, useMemo, useState } from "react";

const AuthContext = createContext(null);

const storageKey = "skillhive_auth";

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(() => {
    const saved = localStorage.getItem(storageKey);
    return saved ? JSON.parse(saved) : null;
  });

  const login = (data) => {
    localStorage.setItem(storageKey, JSON.stringify(data));
    setAuth(data);
  };

  const logout = () => {
    localStorage.removeItem(storageKey);
    setAuth(null);
  };

  const value = useMemo(() => ({ auth, login, logout }), [auth]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
