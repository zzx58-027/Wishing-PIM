import {
  integer,
  pgTable,
  uuid,
  varchar,
  smallint,
  decimal,
  date,
  jsonb,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

import { ordersTable } from "./orders";

export const orderItemsTable = pgTable("order_items", {
  /* 内部字段 */
  uuid: uuid("uuid").defaultRandom().primaryKey(),
  parent_order_uuid: uuid("parent_order_uuid")
    .references(() => ordersTable.uuid, { onDelete: "cascade" })
    .notNull(),
  created_at: date("created_at").defaultNow(),
  /* 业务字段 */
  customer_po_ref: varchar("customer_po_ref", { length: 27 }).notNull(),
  wishing_po_ref: varchar("wishing_po_ref", { length: 27 }),
  product_ref_3: varchar("product_ref_3", { length: 27 }).notNull(),
  item_serial_num: smallint("item_serial_num").notNull(),
  order_quantity: integer("order_quantity").notNull(),
  product_desc: varchar("product_desc", { length: 58 }).notNull(), // 虽然可以作为 product 属性, 但是 product 开发阶段可能没有英文描述, 因此需要留底.
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  price_unit: varchar("price_unit", { length: 3 }).notNull(), // ISO 4217 货币代码, 3 length 足够
  lrd_date: date("lrd_date").notNull(),
  extra_attrs: jsonb("extra_attrs").$type<Record<string, string>>().default({}),
});

export const orderItemsRelations = relations(
  orderItemsTable,
  ({ one, many }) => ({
    order: one(ordersTable, {
      fields: [orderItemsTable.parent_order_uuid],
      references: [ordersTable.uuid],
    }),
  })
);
