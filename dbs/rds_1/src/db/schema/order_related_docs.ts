import { relations } from "drizzle-orm";
import {
  pgTable,
  varchar,
  uuid,
  date,
  boolean,
  jsonb,
} from "drizzle-orm/pg-core";

import { ordersTable } from "./orders";

export const orderRelatedDocsTable = pgTable("order_related_docs", {
  /* 内部字段 */
  uuid: uuid("uuid").defaultRandom().primaryKey(),
  created_at: date("created_at").defaultNow(),
  parent_order_uuid: uuid("parent_order_uuid")
    .references(() => ordersTable.uuid, { onDelete: "cascade" })
    .notNull(),
  /* 业务字段 */
  // Record: 这里值得思考, 数据库压力会有些大?
  is_main: boolean("is_main").default(false),
  doc_name: varchar("doc_name", { length: 34 }).notNull(),
  doc_remarks: varchar("doc_remarks", { length: 127 }),
  file_url: varchar("file_url", { length: 255 }),
  s3_path: varchar("s3_path", { length: 255 }),
  file_version: date("file_version"),
  thumbnail_url: varchar("thumbnail_url", { length: 255 }),
  extra_attrs: jsonb("extra_attrs").$type<Record<string, string>>().default({}),
});

export const orderRelatedDocsRelations = relations(
  orderRelatedDocsTable,
  ({ one, many }) => ({
    order: one(ordersTable, {
      fields: [orderRelatedDocsTable.parent_order_uuid],
      references: [ordersTable.uuid],
    }),
  })
);
