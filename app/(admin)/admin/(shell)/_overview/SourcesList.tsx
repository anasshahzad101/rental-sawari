"use client";

import * as React from "react";
import { BarList } from "@/components/admin/charts/BarList";

/** "Where visitors came from": Source · bar · Opens · Share; mobile shows the top 4 + "Show all 7 sources". */
export function SourcesList({ rows, total }: { rows: { key: string; label: string; count: number }[]; total: number }) {
  return (
    <BarList
      rows={rows}
      total={total}
      header={{ label: "Source", count: "Opens", pct: "Share" }}
      labelWidth="170px"
      mobileTop={4}
      showAllLabel={(n) => `Show all ${n} sources`}
    />
  );
}
