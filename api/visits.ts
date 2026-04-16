/// <reference types="node" />

import { createHash } from "node:crypto";
import { and, count, eq } from "drizzle-orm";
import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { pgTable, serial, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import pg from "pg";

interface ApiRequest {
  method?: string;
  query?: Record<string, string | string[] | undefined>;
  body?: unknown;
}

interface ApiResponse {
  setHeader(name: string, value: string): void;
  status(code: number): ApiResponse;
  json(body: unknown): void;
  end(body?: string): void;
}

function sendJson(response: ApiResponse, statusCode: number, body: unknown) {
  response.status(statusCode).json(body);
}

function getSiteKeyFromQuery(request: ApiRequest) {
  const value = request.query?.siteKey;
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

function parseRequestBody(body: unknown) {
  if (typeof body === "string") {
    try {
      return JSON.parse(body) as Record<string, unknown>;
    } catch {
      return {};
    }
  }

  if (body && typeof body === "object") {
    return body as Record<string, unknown>;
  }

  return {};
}

function normalizeSiteKey(siteKey: unknown) {
  if (typeof siteKey !== "string") return "";
  return siteKey.trim().toLowerCase().slice(0, 64);
}

function normalizeDeviceId(deviceId: unknown) {
  if (typeof deviceId !== "string") return "";
  return deviceId.trim().slice(0, 160);
}

const { Pool } = pg;

const siteUniqueVisits = pgTable(
  "site_unique_visits",
  {
    id: serial("id").primaryKey(),
    siteKey: text("site_key").notNull(),
    deviceHash: text("device_hash").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  table => ({
    siteDeviceUnique: uniqueIndex("site_unique_visits_site_device_unique").on(
      table.siteKey,
      table.deviceHash,
    ),
  }),
);

const schema = { siteUniqueVisits };

type VisitStore = {
  db: NodePgDatabase<typeof schema>;
  siteUniqueVisits: typeof siteUniqueVisits;
};

let cachedVisitStore: VisitStore | null = null;
let cachedDatabaseUrl: string | null = null;

function getVisitStore() {
  const databaseUrl = process.env.DATABASE_URL?.trim();

  if (!databaseUrl) {
    return null;
  }

  if (!cachedVisitStore || cachedDatabaseUrl !== databaseUrl) {
    const pool = new Pool({ connectionString: databaseUrl });

    cachedVisitStore = {
      db: drizzle(pool, { schema }),
      siteUniqueVisits,
    };
    cachedDatabaseUrl = databaseUrl;
  }

  return cachedVisitStore;
}

export default async function handler(request: ApiRequest, response: ApiResponse) {
  response.setHeader("Access-Control-Allow-Origin", "*");
  response.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  response.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (request.method === "OPTIONS") {
    response.status(204).end();
    return;
  }

  const visitStore = await getVisitStore();

  if (!visitStore) {
    sendJson(response, 503, {
      error: "Visit counter needs DATABASE_URL before it can go live.",
    });
    return;
  }

  const { db, siteUniqueVisits } = visitStore;

  try {
    if (request.method === "GET") {
      const siteKey = normalizeSiteKey(getSiteKeyFromQuery(request));

      if (!siteKey) {
        sendJson(response, 400, { error: "siteKey is required." });
        return;
      }

      const [totalRow] = await db
        .select({ total: count() })
        .from(siteUniqueVisits)
        .where(eq(siteUniqueVisits.siteKey, siteKey));

      sendJson(response, 200, {
        siteKey,
        totalUniqueVisitors: Number(totalRow?.total ?? 0),
      });
      return;
    }

    if (request.method !== "POST") {
      sendJson(response, 405, { error: "Method not allowed." });
      return;
    }

    const body = parseRequestBody(request.body);
    const siteKey = normalizeSiteKey(body.siteKey);
    const deviceId = normalizeDeviceId(body.deviceId);

    if (!siteKey || !deviceId) {
      sendJson(response, 400, { error: "siteKey and deviceId are required." });
      return;
    }

    const deviceHash = createHash("sha256").update(deviceId).digest("hex");

    const insertedRows = await db
      .insert(siteUniqueVisits)
      .values({
        siteKey,
        deviceHash,
      })
      .onConflictDoNothing({
        target: [siteUniqueVisits.siteKey, siteUniqueVisits.deviceHash],
      })
      .returning({ id: siteUniqueVisits.id });

    const [totalRow] = await db
      .select({ total: count() })
      .from(siteUniqueVisits)
      .where(eq(siteUniqueVisits.siteKey, siteKey));

    const [visitorRow] = await db
      .select({ createdAt: siteUniqueVisits.createdAt })
      .from(siteUniqueVisits)
      .where(and(eq(siteUniqueVisits.siteKey, siteKey), eq(siteUniqueVisits.deviceHash, deviceHash)))
      .limit(1);

    sendJson(response, 200, {
      siteKey,
      totalUniqueVisitors: Number(totalRow?.total ?? 0),
      countedVisit: insertedRows.length > 0,
      createdAt: visitorRow?.createdAt ?? null,
    });
  } catch (error) {
    sendJson(response, 500, {
      error: error instanceof Error ? error.message : "Unable to update visit counter.",
    });
  }
}
