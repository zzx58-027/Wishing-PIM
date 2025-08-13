import { pgTable, varchar, uuid, text, date, jsonb } from "drizzle-orm/pg-core";

import { productsTable } from "./products";

export const productRelatedDocsTable = pgTable("product_related_docs", {
  /* 内部字段 */
  uuid: uuid("uuid").defaultRandom().primaryKey(),
  created_at: date("created_at").defaultNow(),
  parent_product_uuid: uuid("parent_product_uuid")
    .references(() => productsTable.uuid, { onDelete: "cascade" })
    .notNull(),
  /* 业务字段 */
  doc_type: varchar(),
  product_ref_3: varchar("product_ref_3", { length: 13 }).notNull(),
  doc_name: varchar("doc_name", { length: 58 }).notNull(),
  doc_desc_arr: jsonb("doc_desc_arr").$type<string[]>().default([]), // 名称, 位置, 用量, 备注
  doc_extracted_raw_text: text("doc_extracted_raw_text"),
  ai_custom_extracted_text: text("ai_custom_extracted_text"),
  file_url: varchar("file_url", { length: 255 }),
  s3_path: varchar("s3_path", { length: 255 }),
  file_version: date("file_version"),
  thumbnail_url: varchar("thumbnail_url", { length: 255 }),
  doc_remarks: varchar("doc_remarks", { length: 255 }),
  extra_attrs: jsonb("extra_attrs").$type<Record<string, string>>().default({}),
});
