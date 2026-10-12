/**
 * Every table the admin uses, defined once. Both drivers read these
 * definitions: the MySQL driver turns them into CREATE TABLE statements (the
 * app creates its own tables on first connect — no phpMyAdmin steps), and the
 * file driver uses them to convert values.
 *
 * Keys are camelCase in JS and snake_case in SQL. Timestamps are stored as
 * UTC DATETIME; calendar days (plan dates, stats days) as DATE in PKT.
 */

export type ColType =
  | "id" // INT UNSIGNED AUTO_INCREMENT PRIMARY KEY
  | "bigid" // BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY
  | "int"
  | "tinyint"
  | "double"
  | "str"
  | "text"
  | "bool"
  | "json"
  | "date"
  | "datetime"
  | "blob";

export interface Col {
  type: ColType;
  len?: number;
  nullable?: boolean;
  default?: string | number | boolean;
}

export interface TableDef {
  name: string;
  cols: Record<string, Col>;
  /** Composite or non-id primary key (column keys, camelCase). */
  primary?: string[];
  unique?: string[][];
  indexes?: string[][];
}

const c = {
  id: (): Col => ({ type: "id" }),
  bigid: (): Col => ({ type: "bigid" }),
  int: (nullable = false, def?: number): Col => ({ type: "int", nullable, default: def }),
  tinyint: (def = 0): Col => ({ type: "tinyint", default: def }),
  double: (nullable = true): Col => ({ type: "double", nullable }),
  str: (len: number, nullable = false, def?: string): Col => ({ type: "str", len, nullable, default: def }),
  text: (nullable = true): Col => ({ type: "text", nullable }),
  bool: (def = false): Col => ({ type: "bool", default: def }),
  json: (nullable = false): Col => ({ type: "json", nullable }),
  date: (nullable = true): Col => ({ type: "date", nullable }),
  datetime: (nullable = false): Col => ({ type: "datetime", nullable }),
  blob: (): Col => ({ type: "blob" }),
};

export const TABLES = {
  listings: {
    name: "listings",
    cols: {
      id: c.id(),
      slug: c.str(160),
      name: c.str(255),
      city: c.str(60),
      area: c.str(160, false, ""),
      whatsapp: c.str(20, false, ""),
      phone: c.str(20, false, ""),
      phone2: c.str(20, true),
      website: c.str(500, true),
      mapsUrl: c.text(),
      about: c.text(),
      services: c.json(),
      cars: c.json(),
      logoUrl: c.str(255, true),
      googleRating: c.double(),
      googleReviews: c.int(true),
      responseTime: c.str(60, true),
      plan: c.str(8, false, "free"),
      planStart: c.date(),
      planEnd: c.date(),
      verified: c.bool(),
      status: c.str(8, false, "live"),
      hiddenAt: c.datetime(true),
      createdAt: c.datetime(),
      updatedAt: c.datetime(),
      /** Sample data for learning the admin (lib/admin/db/demo.ts). Never public. */
      demo: c.bool(),
    },
    unique: [["slug"]],
    indexes: [["city"], ["status"]],
  },
  listingVersions: {
    name: "listing_versions",
    cols: {
      id: c.id(),
      listingId: c.int(),
      createdAt: c.datetime(),
      kind: c.str(12),
      actor: c.str(255, false, ""),
      note: c.str(500, false, ""),
      changes: c.json(),
      snapshot: c.json(),
      prior: c.json(true),
      refId: c.int(true),
    },
    indexes: [["listingId"]],
  },
  listingRedirects: {
    name: "listing_redirects",
    cols: {
      oldSlug: c.str(160),
      listingId: c.int(),
      createdAt: c.datetime(),
    },
    primary: ["oldSlug"],
  },
  listingRequests: {
    name: "listing_requests",
    cols: {
      id: c.id(),
      createdAt: c.datetime(),
      updatedAt: c.datetime(),
      status: c.str(12, false, "new"),
      payload: c.json(),
      fixes: c.json(),
      duplicateOf: c.int(true),
      rejectReason: c.str(200, true),
      note: c.text(),
      listingId: c.int(true),
      claimId: c.int(true),
      decidedAt: c.datetime(true),
      demo: c.bool(),
    },
    indexes: [["status"]],
  },
  claims: {
    name: "claims",
    cols: {
      id: c.id(),
      createdAt: c.datetime(),
      updatedAt: c.datetime(),
      listingId: c.int(),
      claimantName: c.str(200),
      role: c.str(8),
      claimantWhatsapp: c.str(20),
      message: c.text(),
      changes: c.json(),
      closeRequested: c.bool(),
      verification: c.json(),
      appliedKeys: c.json(),
      status: c.str(12, false, "waiting"),
      flagged: c.bool(),
      rejectReason: c.str(200, true),
      note: c.text(),
      decidedAt: c.datetime(true),
      requestId: c.int(true),
      demo: c.bool(),
    },
    indexes: [["status"], ["listingId"]],
  },
  reports: {
    name: "reports",
    cols: {
      id: c.id(),
      createdAt: c.datetime(),
      updatedAt: c.datetime(),
      listingId: c.int(),
      reason: c.str(16),
      details: c.text(),
      reporterWhatsapp: c.str(20, true),
      status: c.str(12, false, "new"),
      resolvedNote: c.text(),
      resolvedAt: c.datetime(true),
      demo: c.bool(),
    },
    indexes: [["status"], ["listingId"]],
  },
  media: {
    name: "media",
    cols: {
      id: c.id(),
      createdAt: c.datetime(),
      mime: c.str(40),
      size: c.int(),
      data: c.blob(),
      ref: c.str(60, true),
    },
  },
  statEvents: {
    name: "stat_events",
    cols: {
      id: c.bigid(),
      ts: c.datetime(),
      day: { type: "date" },
      hour: c.tinyint(),
      listingId: c.int(),
      kind: c.str(6),
      visitor: c.str(16, false, ""),
      source: c.str(10, false, ""),
      entry: c.str(191, false, ""),
      device: c.str(8, false, ""),
      demo: c.bool(),
    },
    indexes: [["day"], ["listingId", "day"]],
  },
  statShown: {
    name: "stat_shown",
    cols: {
      day: { type: "date" },
      listingId: c.int(),
      page: c.str(191),
      shown: c.int(false, 0),
      posSum: c.int(false, 0),
      demo: c.bool(),
    },
    primary: ["day", "listingId", "page"],
  },
  meta: {
    name: "app_meta",
    cols: {
      k: c.str(64),
      v: c.text(),
    },
    primary: ["k"],
  },
} satisfies Record<string, TableDef>;

export type TableKey = keyof typeof TABLES;

export function snake(key: string): string {
  return key.replace(/[A-Z]/g, (m) => `_${m.toLowerCase()}`);
}

function colSql(key: string, col: Col): string {
  const name = `\`${snake(key)}\``;
  const nul = col.nullable ? "NULL" : "NOT NULL";
  const def = (v: Col["default"]) => {
    if (v === undefined) return "";
    if (typeof v === "boolean") return ` DEFAULT ${v ? 1 : 0}`;
    if (typeof v === "number") return ` DEFAULT ${v}`;
    return ` DEFAULT '${String(v).replace(/'/g, "''")}'`;
  };
  switch (col.type) {
    case "id":
      return `${name} INT UNSIGNED NOT NULL AUTO_INCREMENT`;
    case "bigid":
      return `${name} BIGINT UNSIGNED NOT NULL AUTO_INCREMENT`;
    case "int":
      return `${name} INT ${nul}${def(col.default)}`;
    case "tinyint":
      return `${name} TINYINT NOT NULL${def(col.default ?? 0)}`;
    case "double":
      return `${name} DOUBLE ${nul}${def(col.default)}`;
    case "str":
      return `${name} VARCHAR(${col.len ?? 255}) ${nul}${def(col.default)}`;
    case "text":
      return `${name} TEXT ${col.nullable === false ? "NOT NULL" : "NULL"}`;
    case "bool":
      return `${name} TINYINT(1) NOT NULL${def(col.default ?? false)}`;
    case "json":
      return `${name} MEDIUMTEXT ${nul}`;
    case "date":
      return `${name} DATE ${nul}`;
    case "datetime":
      return `${name} DATETIME ${nul}`;
    case "blob":
      return `${name} MEDIUMBLOB NOT NULL`;
  }
}

/** CREATE TABLE IF NOT EXISTS for one table (MySQL / MariaDB). */
export function createTableSql(def: TableDef): string {
  const lines = Object.entries(def.cols).map(([k, col]) => `  ${colSql(k, col)}`);
  const idKey = Object.entries(def.cols).find(([, col]) => col.type === "id" || col.type === "bigid")?.[0];
  const pk = def.primary ?? (idKey ? [idKey] : []);
  if (pk.length) lines.push(`  PRIMARY KEY (${pk.map((k) => `\`${snake(k)}\``).join(", ")})`);
  for (const u of def.unique ?? []) {
    lines.push(`  UNIQUE KEY \`uq_${u.map(snake).join("_")}\` (${u.map((k) => `\`${snake(k)}\``).join(", ")})`);
  }
  for (const ix of def.indexes ?? []) {
    lines.push(`  KEY \`ix_${ix.map(snake).join("_")}\` (${ix.map((k) => `\`${snake(k)}\``).join(", ")})`);
  }
  return `CREATE TABLE IF NOT EXISTS \`${def.name}\` (\n${lines.join(",\n")}\n) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`;
}

/** ALTER TABLE … ADD COLUMN for a column added to a definition later. */
export function addColumnSql(def: TableDef, key: string): string {
  return `ALTER TABLE \`${def.name}\` ADD COLUMN ${colSql(key, def.cols[key])}`;
}

/** The whole schema as one script (docs/admin/schema.sql is generated from this). */
export function schemaSql(): string {
  return Object.values(TABLES)
    .map((t) => `${createTableSql(t)};`)
    .join("\n\n");
}
