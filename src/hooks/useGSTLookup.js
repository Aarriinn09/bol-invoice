import { useState, useEffect, useRef } from "react";
import { invoicesAPI } from "../api/client";

export function useGSTLookup(items) {
  const [gstMap, setGstMap] = useState({});
  const timerRef = useRef(null);

  useEffect(() => {
    if (!items || items.length === 0) return;

    // Debounce — wait 500ms after items change
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      try {
        const names = items.map((i) => i.name);
        const result = await invoicesAPI.lookupGST(names);

        const map = {};
        result.forEach((r) => {
          map[r.name] = r;
        });
        setGstMap(map);
      } catch (e) {
        console.error("GST lookup failed:", e);
      }
    }, 500);

    return () => clearTimeout(timerRef.current);
  }, [JSON.stringify(items?.map((i) => i.name))]);

  return gstMap;
}
