"use client";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { seed } from "@/lib/seed";
import type { Store } from "@/lib/domain";
const KEY = "skymart-demo-v1";
const Context = createContext<{
  store: Store;
  update: (change: (s: Store) => Store) => void;
  ready: boolean;
  error: string;
}>({ store: seed, update: () => {}, ready: false, error: "" });
export function StoreProvider({ children }: { children: ReactNode }) {
  const [store, setStore] = useState<Store>(seed);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const data = JSON.parse(raw);
        if (
          data.version === 1 &&
          Array.isArray(data.products) &&
          Array.isArray(data.categories) &&
          Array.isArray(data.movements) &&
          Array.isArray(data.enquiries)
        )
          setStore(data);
        else setError("Saved demo data could not be loaded.");
      }
    } catch {
      setError(
        "Browser storage is unavailable. Changes will last for this session only.",
      );
    }
    setReady(true);
  }, []);
  function update(change: (s: Store) => Store) {
    const next = change(store);
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      setError(
        "Could not save to browser storage. Keep this tab open to retain your changes.",
      );
    }
    setStore(next);
  }
  return (
    <Context.Provider value={{ store, update, ready, error }}>
      {error && (
        <div className="storage-error" role="alert">
          {error}
        </div>
      )}
      {children}
    </Context.Provider>
  );
}
export const useStore = () => useContext(Context);
