import { pgTable, serial, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";

export const siteUniqueVisits = pgTable(
  "site_unique_visits",
  {
    id: serial("id").primaryKey(),
    siteKey: text("site_key").notNull(),
    deviceHash: text("device_hash").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  table => ({
    siteDeviceUnique: uniqueIndex("site_unique_visits_site_device_unique").on(table.siteKey, table.deviceHash),
  }),
);
