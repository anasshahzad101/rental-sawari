"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

// Once the app has hydrated, portals can render on their first pass (so a
// popover's layout effect can measure its panel straight away). Before that
// they wait a tick to keep the server and client HTML identical.
let hydrated = false;

/** Renders children into document.body (never on the server). */
export function Portal({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(hydrated);
  useEffect(() => {
    hydrated = true;
    setMounted(true);
  }, []);
  return mounted ? createPortal(children, document.body) : null;
}
