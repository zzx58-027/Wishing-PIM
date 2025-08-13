import { boolean, date, jsonb, pgTable, uuid, varchar } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

import { orderItemsTable } from "./order_items";
import { orderRelatedDocsTable } from "./order_related_docs";

export const ordersTable = pgTable("orders", {
  /* 内部字段 */
  uuid: uuid("uuid").defaultRandom().primaryKey(),
  created_at: date("created_at").defaultNow(),
  /* 业务字段 */
  customer_id: varchar("customer_id", { length: 13 }).notNull(),
  customer_po_ref: varchar("customer_po_ref", { length: 27 }).notNull(),
  wishing_po_ref: varchar("wishing_po_ref", { length: 27 }),
  deprecated: boolean("deprecated").default(false),
  version_remarks: varchar("version_remarks", { length: 255 }),
  order_date: date("order_date").notNull(),
  extra_attrs: jsonb("extra_attrs").$type<Record<string, string>>().default({}),
});

export const orderRelations = relations(ordersTable, ({ one, many }) => ({
  order_items: many(orderItemsTable),
  order_related_docs: many(orderRelatedDocsTable),
}));
