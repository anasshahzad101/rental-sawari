import "server-only";
import fs from "node:fs";
import path from "node:path";
import type { Db, Row, SelectOpts, Where } from "./driver";
import { matches } from "./driver";
import { TABLES, type TableDef, type TableKey } from "./schema";

/**
 * Development driver: every table in one JSON file (.data/admin-store.json,
 * git-ignored). It exists so the admin can be exercised end to end on a
 * machine without MySQL — the same repo code runs on top of either driver.
 *
 * It is never meant for production: a redeploy on Hostinger replaces the
 * app folder and the file with it. lib/admin/db/index.ts only picks it when
 * no database is configured, and the admin shows a warning when that happens
 * in production.
 */

interface Store {
  tables: Partial<Record<TableKey, Row[]>>;
  autoinc: Partial<Record<TableKey, number>>;
}

// ADMIN_STORE_FILE lets a second dev server use its own copy.
const FILE = process.env.ADMIN_STORE_FILE || path.join(process.cwd(), ".data", "admin-store.json");

type G = typeof globalThis & { __rsFileStore?: Store; __rsFileTimer?: NodeJS.Timeout | null };
const g = globalThis as G;

function load(): Store {
  if (g.__rsFileStore) return g.__rsFileStore;
  let store: Store = { tables: {}, autoinc: {} };
  try {
    store = JSON.parse(fs.readFileSync(FILE, "utf8")) as Store;
  } catch {
    // first run
  }
  g.__rsFileStore = store;
  return store;
}

function flush() {
  const store = load();
  fs.mkdirSync(path.dirname(FILE), { recursive: true });
  const tmp = `${FILE}.${process.pid}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(store));
  fs.renameSync(tmp, FILE);
}

function save() {
  if (g.__rsFileTimer) clearTimeout(g.__rsFileTimer);
  g.__rsFileTimer = setTimeout(() => {
    g.__rsFileTimer = null;
    try {
      flush();
    } catch (e) {
      console.error("[admin-store] could not write", e);
    }
  }, 150);
}

function rows(table: TableKey): Row[] {
  const s = load();
  return (s.tables[table] ??= []);
}

function idKey(def: TableDef): string | null {
  return Object.entries(def.cols).find(([, c]) => c.type === "id" || c.type === "bigid")?.[0] ?? null;
}

function pkKeys(def: TableDef): string[] {
  if (def.primary) return def.primary;
  const k = idKey(def);
  return k ? [k] : [];
}

/** Blobs are kept as base64 in JSON and handed back as Buffers. */
function out(def: TableDef, r: Row): Row {
  const o: Row = {};
  for (const [k, col] of Object.entries(def.cols)) {
    const v = r[k];
    if (col.type === "blob") o[k] = typeof v === "string" ? Buffer.from(v, "base64") : v;
    else if (col.type === "bool") o[k] = !!v;
    else o[k] = v === undefined ? (col.nullable ? null : col.default ?? null) : structuredClone(v);
  }
  return o;
}

function into(def: TableDef, r: Row, base: Row = {}): Row {
  const o: Row = { ...base };
  for (const [k, v] of Object.entries(r)) {
    const col = def.cols[k];
    if (!col) continue;
    if (col.type === "blob" && Buffer.isBuffer(v)) o[k] = v.toString("base64");
    else if (col.type === "date" && typeof v === "string") o[k] = v.slice(0, 10);
    else o[k] = v === undefined ? null : structuredClone(v);
  }
  return o;
}

function withDefaults(def: TableDef, r: Row): Row {
  const o: Row = { ...r };
  for (const [k, col] of Object.entries(def.cols)) {
    if (o[k] === undefined) o[k] = col.default ?? (col.type === "bool" ? false : null);
  }
  return o;
}

function clashes(def: TableDef, list: Row[], r: Row, skip?: Row): boolean {
  const keysets = [pkKeys(def), ...(def.unique ?? [])].filter((ks) => ks.length);
  return list.some((x) => x !== skip && keysets.some((ks) => ks.every((k) => x[k] === r[k])));
}

export function createFileDb(): Db {
  return {
    kind: "file",
    describe: `Local file · ${path.relative(process.cwd(), FILE)}`,

    async select<T = Row>(table: TableKey, where?: Where, opts: SelectOpts = {}): Promise<T[]> {
      const def = TABLES[table] as TableDef;
      let list = rows(table).filter((r) => matches(r, where));
      if (opts.orderBy) {
        const k = opts.orderBy;
        const dir = opts.desc ? -1 : 1;
        list = [...list].sort((a, b) => {
          const x = a[k] as number | string;
          const y = b[k] as number | string;
          return x === y ? 0 : x > y ? dir : -dir;
        });
      }
      if (opts.limit) list = list.slice(0, opts.limit);
      return list.map((r) => {
        const o = out(def, r);
        if (!opts.columns) return o as T;
        return Object.fromEntries(opts.columns.map((c) => [c, o[c]])) as T;
      });
    },

    async get<T = Row>(table: TableKey, id: number): Promise<T | null> {
      const def = TABLES[table] as TableDef;
      const key = idKey(def);
      const r = key ? rows(table).find((x) => x[key] === id) : undefined;
      return r ? (out(def, r) as T) : null;
    },

    async insert(table: TableKey, row: Row): Promise<number> {
      const def = TABLES[table] as TableDef;
      const s = load();
      const key = idKey(def);
      const r = withDefaults(def, into(def, row));
      let id = 0;
      if (key) {
        id = (s.autoinc[table] ?? rows(table).reduce((m, x) => Math.max(m, Number(x[key]) || 0), 0)) + 1;
        s.autoinc[table] = id;
        r[key] = id;
      }
      if (clashes(def, rows(table), r)) throw new Error(`Duplicate entry in ${def.name}`);
      rows(table).push(r);
      save();
      return id;
    },

    async insertMany(table: TableKey, list: Row[], opts: { ignore?: boolean } = {}): Promise<void> {
      for (const row of list) {
        try {
          await this.insert(table, row);
        } catch (e) {
          if (!opts.ignore) throw e;
        }
      }
    },

    async update(table: TableKey, where: Where, patch: Row): Promise<number> {
      const def = TABLES[table] as TableDef;
      const list = rows(table);
      let n = 0;
      for (let i = 0; i < list.length; i++) {
        if (!matches(list[i], where)) continue;
        const next = into(def, patch, list[i]);
        if (clashes(def, list, next, list[i])) throw new Error(`Duplicate entry in ${def.name}`);
        list[i] = next;
        n++;
      }
      if (n) save();
      return n;
    },

    async remove(table: TableKey, where: Where): Promise<number> {
      const s = load();
      const before = rows(table);
      const keep = before.filter((r) => !matches(r, where));
      s.tables[table] = keep;
      const n = before.length - keep.length;
      if (n) save();
      return n;
    },

    async count(table: TableKey, where?: Where): Promise<number> {
      return rows(table).filter((r) => matches(r, where)).length;
    },

    async bump(table: TableKey, list: Row[], inc: string[]): Promise<void> {
      const def = TABLES[table] as TableDef;
      const pk = pkKeys(def);
      const all = rows(table);
      for (const row of list) {
        const r = into(def, row);
        const hit = all.find((x) => pk.every((k) => x[k] === r[k]));
        if (hit) for (const k of inc) hit[k] = (Number(hit[k]) || 0) + (Number(r[k]) || 0);
        else all.push(withDefaults(def, r));
      }
      save();
    },
  };
}
