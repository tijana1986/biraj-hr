import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { useAuth } from "@/lib/auth";
import {
  listMyFavorites,
  addFavorite,
  removeFavorite,
  clearFavorites,
  importFavorites,
} from "@/lib/favorites.functions";

const KEY = "biraj_wishlist";

type Ctx = {
  ids: string[];
  toggle: (id: string) => void;
  has: (id: string) => boolean;
  clear: () => void;
};

const C = createContext<Ctx | null>(null);

function readLocal(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function writeLocal(next: string[]) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  }
}

export function WishlistProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [ids, setIds] = useState<string[]>([]);
  const importedForUser = useRef<string | null>(null);

  useEffect(() => {
    if (!user) {
      importedForUser.current = null;
      setIds(readLocal());
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        if (importedForUser.current !== user.id) {
          const local = readLocal();
          if (local.length) {
            try { await importFavorites({ data: { listing_ids: local } }); } catch { /* ignore */ }
            writeLocal([]);
          }
          importedForUser.current = user.id;
        }
        const remote = await listMyFavorites();
        if (!cancelled) setIds(remote);
      } catch {
        if (!cancelled) setIds([]);
      }
    })();
    return () => { cancelled = true; };
  }, [user]);

  const toggle = (id: string) => {
    const has = ids.includes(id);
    const next = has ? ids.filter((x) => x !== id) : [...ids, id];
    const prev = ids;
    setIds(next);
    if (user) {
      void (has
        ? removeFavorite({ data: { listing_id: id } })
        : addFavorite({ data: { listing_id: id } })
      ).catch(() => setIds(prev));
    } else {
      writeLocal(next);
    }
  };

  const clear = () => {
    const prev = ids;
    setIds([]);
    if (user) {
      void clearFavorites().catch(() => setIds(prev));
    } else {
      writeLocal([]);
    }
  };

  return <C.Provider value={{ ids, toggle, has: (id) => ids.includes(id), clear }}>{children}</C.Provider>;
}

export function useWishlist() {
  const ctx = useContext(C);
  if (!ctx) throw new Error("useWishlist must be used inside WishlistProvider");
  return ctx;
}