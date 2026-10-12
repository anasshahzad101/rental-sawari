/**
 * Pure SQL building for the MySQL driver: identifiers, values and every
 * statement shape it sends. Kept free of server-only imports so the shapes
 * can be checked against the MySQL grammar outside Next.
 */
import type { Cond, Row, Scalar, SelectOpts, Where } from "./driver";
import { isCondObject } from "./driver";
import { snake, type Col, type TableDef } from "./schema";

export const q = (id: string) => `\`${id}\``;

function toSqlDateTime(v: unknown): string | null {
  if (v == null || v === "") return null;
  const d = new Date(String(v));
  if (isNaN(d.getTime())) return null;
  return d.toISOString().slice(0, 19).replace("T", " ");
}

export function toSql(col: Col | undefined, v: unknown): unknown {
  if (v === undefined) return null;
  if (!col) return v;
  switch (col.type) {
    case "json":
      return v == null ? null : JSON.stringify(v);
    case "bool":
      return v ? 1 : 0;
    case "datetime":
      return toSqlDateTime(v);
    case "date":
      return v == null || v === "" ? null : String(v).slice(0, 10);
    default:
      return v;
  }
}

export function fromSql(col: Col | undefined, v: unknown): unknown {
  if (!col) return v;
  if (v == null) return col.type === "bool" ? false : null;
  switch (col.type) {
    case "json":
      try {
        return JSON.parse(String(v));
      } catch {
        return null;
      }
    case "bool":
      return !!Number(v);
    case "datetime":
      return `${String(v).replace(" ", "T")}.000Z`;
    case "date":
      return String(v).slice(0, 10);
    case "id":
    case "bigid":
    case "int":
    case "tinyint":
    case "double":
      return Number(v);
    default:
      return v;
  }
}

export function rowFromSql(def: TableDef, raw: Record<string, unknown>): Row {
  const out: Row = {};
  for (const [k, col] of Object.entries(def.cols)) {
    const sk = snake(k);
    if (sk in raw) out[k] = fromSql(col, raw[sk]);
  }
  return out;
}

export function idKey(def: TableDef): string | null {
  return Object.entries(def.cols).find(([, c]) => c.type === "id" || c.type === "bigid")?.[0] ?? null;
}

export function whereSql(def: TableDef, where: Where | undefined): { sql: string; args: unknown[] } {
  if (!where || !Object.keys(where).length) return { sql: "", args: [] };
  const parts: string[] = [];
  const args: unknown[] = [];
  for (const [k, cond] of Object.entries(where)) {
    const col = def.cols[k];
    if (!col) throw new Error(`Unknown column ${def.name}.${k}`);
    const name = q(snake(k));
    const val = (v: Scalar) => toSql(col, v);
    if (!isCondObject(cond)) {
      if (cond === null) parts.push(`${name} IS NULL`);
      else {
        parts.push(`${name} = ?`);
        args.push(val(cond));
      }
      continue;
    }
    const c = cond as Exclude<Cond, Scalar>;
    if ("between" in c) {
      parts.push(`${name} BETWEEN ? AND ?`);
      args.push(val(c.between[0]), val(c.between[1]));
    } else if ("in" in c) {
      if (!c.in.length) parts.push("1 = 0");
      else {
        parts.push(`${name} IN (${c.in.map(() => "?").join(", ")})`);
        args.push(...c.in.map(val));
      }
    } else if ("gte" in c) {
      parts.push(`${name} >= ?`);
      args.push(val(c.gte));
    } else if ("lte" in c) {
      parts.push(`${name} <= ?`);
      args.push(val(c.lte));
    } else if ("ne" in c) {
      if (c.ne === null) parts.push(`${name} IS NOT NULL`);
      else {
        parts.push(`(${name} <> ? OR ${name} IS NULL)`);
        args.push(val(c.ne));
      }
    }
  }
  return { sql: ` WHERE ${parts.join(" AND ")}`, args };
}

export function selectSql(def: TableDef, where?: Where, opts: SelectOpts = {}) {
  const cols = opts.columns?.length ? opts.columns.map((k) => q(snake(k))).join(", ") : "*";
  const w = whereSql(def, where);
  let sql = `SELECT ${cols} FROM ${q(def.name)}${w.sql}`;
  if (opts.orderBy) sql += ` ORDER BY ${q(snake(opts.orderBy))} ${opts.desc ? "DESC" : "ASC"}`;
  if (opts.limit) sql += ` LIMIT ${Math.max(0, Math.floor(opts.limit))}`;
  return { sql, args: w.args };
}

export function getSql(def: TableDef, id: number) {
  const key = idKey(def);
  if (!key) throw new Error(`${def.name} has no id column`);
  return { sql: `SELECT * FROM ${q(def.name)} WHERE ${q(snake(key))} = ? LIMIT 1`, args: [id] };
}

function writable(def: TableDef, keys: string[]) {
  return keys.filter((k) => def.cols[k] && def.cols[k].type !== "id" && def.cols[k].type !== "bigid");
}

export function insertSql(def: TableDef, row: Row) {
  const keys = writable(def, Object.keys(row));
  return {
    sql: `INSERT INTO ${q(def.name)} (${keys.map((k) => q(snake(k))).join(", ")}) VALUES (${keys.map(() => "?").join(", ")})`,
    args: keys.map((k) => toSql(def.cols[k], row[k])),
  };
}

/** Bulk insert: `VALUES ?` takes a nested array (mysql2 expands it). */
export function insertManySql(def: TableDef, rows: Row[], ignore = false) {
  const keys = Object.keys(def.cols).filter((k) => rows.some((r) => k in r));
  return {
    sql: `INSERT${ignore ? " IGNORE" : ""} INTO ${q(def.name)} (${keys.map((k) => q(snake(k))).join(", ")}) VALUES ?`,
    values: rows.map((r) => keys.map((k) => toSql(def.cols[k], r[k]))),
  };
}

export function updateSql(def: TableDef, where: Where, patch: Row) {
  const keys = writable(def, Object.keys(patch));
  if (!keys.length) return null;
  const w = whereSql(def, where);
  if (!w.sql) throw new Error("Refusing to update without a where-clause");
  return {
    sql: `UPDATE ${q(def.name)} SET ${keys.map((k) => `${q(snake(k))} = ?`).join(", ")}${w.sql}`,
    args: [...keys.map((k) => toSql(def.cols[k], patch[k])), ...w.args],
  };
}

export function deleteSql(def: TableDef, where: Where) {
  const w = whereSql(def, where);
  if (!w.sql) throw new Error("Refusing to delete without a where-clause");
  return { sql: `DELETE FROM ${q(def.name)}${w.sql}`, args: w.args };
}

export function countSql(def: TableDef, where?: Where) {
  const w = whereSql(def, where);
  return { sql: `SELECT COUNT(*) AS n FROM ${q(def.name)}${w.sql}`, args: w.args };
}

/** Counter upsert: add `inc` columns onto an existing row with the same key. */
export function bumpSql(def: TableDef, rows: Row[], inc: string[]) {
  const keys = Object.keys(def.cols).filter((k) => rows.some((r) => k in r));
  const upd = inc.map((k) => `${q(snake(k))} = ${q(snake(k))} + VALUES(${q(snake(k))})`).join(", ");
  return {
    sql: `INSERT INTO ${q(def.name)} (${keys.map((k) => q(snake(k))).join(", ")}) VALUES ? ON DUPLICATE KEY UPDATE ${upd}`,
    values: rows.map((r) => keys.map((k) => toSql(def.cols[k], r[k]))),
  };
}

export const COLUMNS_SQL = "SELECT COLUMN_NAME AS c FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?";
