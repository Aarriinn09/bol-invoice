import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { authAPI } from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [vendor, setVendor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sessionKey, setSessionKey] = useState(0);
  // sessionKey increments on every login/logout
  // App.jsx watches this to reset all state

  useEffect(() => {
    const token = localStorage.getItem("bol_token");
    if (!token) {
      setLoading(false);
      return;
    }

    authAPI
      .me()
      .then((v) => {
        setVendor(v);
        setLoading(false);
      })
      .catch(() => {
        localStorage.removeItem("bol_token");
        setLoading(false);
      });
  }, []);

  function login(token, vendorData) {
    localStorage.setItem("bol_token", token);
    setVendor(vendorData);
    setSessionKey((k) => k + 1); // ← triggers state reset in App
  }

  function logout() {
    localStorage.removeItem("bol_token");
    setVendor(null);
    setSessionKey((k) => k + 1); // ← triggers state reset in App
  }

  return (
    <AuthContext.Provider
      value={{ vendor, loading, login, logout, sessionKey }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
