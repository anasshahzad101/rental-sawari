/**
 * The storage interface both drivers implement. Deliberately small: every
 * table goes through the same handful of generic operations, so the MySQL
 * driver and the development file driver can't drift apart in behaviour.
 * Business rules live above this, in lib/admin/repo.
 */
import type { TableKey } from "./schema";

export type Scalar = string | number | boolean | null;

export type Cond =
  | Scalar
  | { between: [Scalar, Scalar] }
  | { in: Scalar[] }
  | { gte: Scalar }
  | { lte: Scalar }
  | { ne: Scalar };

export type Where = Record<string, Cond>;

export interface SelectOpts {
  orderBy?: string;
  desc?: boolean;
  limit?: number;
  /** Only these columns (camelCase). Default: all. */
  columns?: string[];
}

export type Row = Record<string, unknown>;

export interface Db {
  readonly kind: "mysql" | "file";
  /** Human description for the admin ("MySQL · rentalsawari@localhost"). */
  readonly describe: string;
  select<T = Row>(table: TableKey, where?: Where, opts?: SelectOpts): Promise<T[]>;
  get<T = Row>(table: TableKey, id: number): Promise<T | null>;
  /** Inserts one row; returns the new auto-increment id (0 for tables without one). */
  insert(table: TableKey, row: Row): Promise<number>;
  /** Bulk insert. `ignore` skips rows that clash with a unique key. */
  insertMany(table: TableKey, rows: Row[], opts?: { ignore?: boolean }): Promise<void>;
  update(table: TableKey, where: Where, patch: Row): Promise<number>;
  remove(table: TableKey, where: Where): Promise<number>;
  count(table: TableKey, where?: Where): Promise<number>;
  /**
   * Counter upsert: for each row, insert it, or when the primary key exists
   * add its `inc` columns onto the stored ones.
   */
  bump(table: TableKey, rows: Row[], inc: string[]): Promise<void>;
}

export function isCondObject(v: Cond): v is Exclude<Cond, Scalar> {
  return v !== null && typeof v === "object";
}

/** Shared by the file driver: does a row satisfy a where-clause? */
export function matches(row: Row, where: Where | undefined): boolean {
  if (!where) return true;
  for (const [k, cond] of Object.entries(where)) {
    const v = row[k] as Scalar | undefined;
    if (!isCondObject(cond)) {
      if ((v ?? null) !== cond) return false;
      continue;
    }
    if ("between" in cond) {
      const [a, b] = cond.between;
      if (v == null || a == null || b == null || v < a || v > b) return false;
    } else if ("in" in cond) {
      if (!cond.in.includes((v ?? null) as Scalar)) return false;
    } else if ("gte" in cond) {
      if (v == null || cond.gte == null || v < cond.gte) return false;
    } else if ("lte" in cond) {
      if (v == null || cond.lte == null || v > cond.lte) return false;
    } else if ("ne" in cond) {
      if ((v ?? null) === cond.ne) return false;
    }
  }
  return true;
}
