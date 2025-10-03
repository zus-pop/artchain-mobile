// hooks/useSearchHistory.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useRef, useState } from "react";

export function useSearchHistory(
  storageKey = "@search_history_contests",
  max = 5
) {
  const [history, setHistory] = useState<string[]>([]);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(storageKey);
        if (!mounted.current) return;
        const arr = raw ? JSON.parse(raw) : [];
        setHistory(Array.isArray(arr) ? arr.filter(Boolean) : []);
      } catch {}
    })();
    return () => {
      mounted.current = false;
    };
  }, [storageKey]);

  const save = useCallback(
    async (term: string) => {
      const t = term.trim();
      if (!t) return;
      const next = [
        t,
        ...history.filter((h) => h.toLowerCase() !== t.toLowerCase()),
      ].slice(0, max);
      if (mounted.current) setHistory(next);
      try {
        await AsyncStorage.setItem(storageKey, JSON.stringify(next));
      } catch {}
    },
    [history, max, storageKey]
  );

  const clear = useCallback(async () => {
    if (mounted.current) setHistory([]);
    try {
      await AsyncStorage.removeItem(storageKey);
    } catch {}
  }, [storageKey]);

  return { history, save, clear };
}
