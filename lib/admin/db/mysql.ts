import "server-only";
import mysql from "mysql2/promise";
import type { Db, Row, SelectOpts, Where } from "./driver";
import { TABLES, addColumnSql, createTableSql, snake, type TableDef, type TableKey } from "./schema";
import {
  COLUMNS_SQL,
  bumpSql,
  countSql,
  deleteSql,
  getSql,
  insertManySql,
  insertSql,
  rowFromSql,
  selectSql,
  updateSql,
} from "./sql";

/**
 * MySQL / MariaDB driver (Hostinger). Configured by DB_HOST, DB_PORT,
 * DB_USER, DB_PASSWORD and DB_NAME.
 *
 * Dates come back as strings (dateStrings) and the session runs in UTC, so a
 * DATETIME written as "2026-10-12 06:42:00" means 06:42 UTC everywhere.
 * Statements are built in ./sql.ts: every identifier back-quoted, every
 * value a placeholder.
 */

let pool: mysql.Pool | null = null;

function getPool(): mysql.Pool {
  if (pool) return pool;
  pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: Number(process.env.DB_POOL || 5),
    connectTimeout: 5000,
    dateStrings: true,
    timezone: "Z",
    charset: "utf8mb4",
    supportBigNumbers: true,
    bigNumberStrings: false,
    ...(process.env.DB_SSL === "true" ? { ssl: { rejectUnauthorized: true } } : {}),
  });
  return pool;
}

let migrated: Promise<void> | null = null;

/** Creates missing tables and columns. Runs once per process. */
async function migrate(): Promise<void> {
  const p = getPool();
  for (const def of Object.values(TABLES) as TableDef[]) {
    await p.query(createTableSql(def));
    const [cols] = await p.query<mysql.RowDataPacket[]>(COLUMNS_SQL, [def.name]);
    const have = new Set(cols.map((r) => String(r.c)));
    for (const key of Object.keys(def.cols)) {
      if (!have.has(snake(key))) await p.query(addColumnSql(def, key));
    }
  }
}

function ready(): Promise<void> {
  if (!migrated) {
    migrated = migrate().catch((e) => {
      migrated = null; // retry on the next call
      throw e;
    });
  }
  return migrated;
}

async function exec<T extends mysql.RowDataPacket[] | mysql.ResultSetHeader>(sql: string, args: unknown[] = []) {
  await ready();
  const [res] = await getPool().query<T>(sql, args);
  return res;
}

const def = (t: TableKey) => TABLES[t] as TableDef;

export function createMysqlDb(): Db {
  return {
    kind: "mysql",
    describe: `MySQL · ${process.env.DB_NAME}@${process.env.DB_HOST}`,

    async select<T = Row>(table: TableKey, where?: Where, opts: SelectOpts = {}): Promise<T[]> {
      const s = selectSql(def(table), where, opts);
      const rows = await exec<mysql.RowDataPacket[]>(s.sql, s.args);
      return rows.map((r) => rowFromSql(def(table), r) as T);
    },

    async get<T = Row>(table: TableKey, id: number): Promise<T | null> {
      const s = getSql(def(table), id);
      const rows = await exec<mysql.RowDataPacket[]>(s.sql, s.args);
      return rows[0] ? (rowFromSql(def(table), rows[0]) as T) : null;
    },

    async insert(table: TableKey, row: Row): Promise<number> {
      const s = insertSql(def(table), row);
      const res = await exec<mysql.ResultSetHeader>(s.sql, s.args);
      return Number(res.insertId || 0);
    },

    async insertMany(table: TableKey, rows: Row[], opts: { ignore?: boolean } = {}): Promise<void> {
      for (let i = 0; i < rows.length; i += 200) {
        const s = insertManySql(def(table), rows.slice(i, i + 200), opts.ignore);
        await exec<mysql.ResultSetHeader>(s.sql, [s.values]);
      }
    },

    async update(table: TableKey, where: Where, patch: Row): Promise<number> {
      const s = updateSql(def(table), where, patch);
      if (!s) return 0;
      const res = await exec<mysql.ResultSetHeader>(s.sql, s.args);
      return res.affectedRows;
    },

    async remove(table: TableKey, where: Where): Promise<number> {
      const s = deleteSql(def(table), where);
      const res = await exec<mysql.ResultSetHeader>(s.sql, s.args);
      return res.affectedRows;
    },

    async count(table: TableKey, where?: Where): Promise<number> {
      const s = countSql(def(table), where);
      const rows = await exec<mysql.RowDataPacket[]>(s.sql, s.args);
      return Number(rows[0]?.n ?? 0);
    },

    async bump(table: TableKey, rows: Row[], inc: string[]): Promise<void> {
      if (!rows.length) return;
      const s = bumpSql(def(table), rows, inc);
      await exec<mysql.ResultSetHeader>(s.sql, [s.values]);
    },
  };
}
