import {
  integer,
  pgTable,
  varchar,
  uuid,
  text,
  date,
  boolean,
  jsonb,
  decimal,
} from "drizzle-orm/pg-core";

export const productsTable = pgTable("products_table", {
  // 内部字段
  uuid: uuid("uuid").defaultRandom().primaryKey(),
  created_at: date("created_at").defaultNow(),
  // 业务字段
  deprecated: boolean("deprecated").default(false),
  customer_id: varchar("customer_id", { length: 13 }).notNull(), //E05
  customer_name: varchar("customer_name", { length: 27 }).notNull(), //ENDON
  product_ref_3: varchar("product_ref_3", { length: 13 }),
  product_ref_2: varchar("product_ref_2", { length: 13 }),
  product_ref_1: varchar("product_ref_1", { length: 13 }),
  product_imgs_url: jsonb("product_imgs_url").$type<string[]>().default([]),
  product_brand: varchar("product_brand", { length: 27 }),
  product_zone: varchar("product_zone", { length: 13 }),
  product_category: varchar("product_category", { length: 27 }),
  product_type: varchar("product_type", { length: 13 }),
  product_suite_name: varchar("product_suite_name", { length: 13 }),
  product_detail_desc_zh: text("product_detail_desc_zh"),
  product_detail_desc_en: text("product_detail_desc_en"),
  product_name_zh: varchar("product_name_zh", { length: 58 }),
  product_name_en: varchar("product_name_en", { length: 58 }),
  item_status: varchar("item_status", { length: 13 }), // 开发中
  ent_ip_rating: varchar("ent_ip_rating", { length: 13 }),
  ent_testing_class: varchar("ent_testing_class", { length: 13 }),
  ent_lt_source_category: varchar("ent_lt_source_category", { length: 13 }),
  ent_finishes_desc: jsonb("ent_finishes_desc"),
  ent_retail_ctn_type_desc: varchar("ent_retail_ctn_type_desc", { length: 42 }),
  ent_retail_ctn_dimension: varchar("ent_retail_ctn_dimension", { length: 42 }),
  ent_retail_ctn_quantity: integer("ent_retail_ctn_quantity"),
  ent_retail_ctn_cbm: decimal("ent_retail_ctn_cbm", {
    precision: 10,
    scale: 2,
  }),
  ent_retail_ctn_gw: decimal("ent_retail_ctn_gw", { precision: 10, scale: 2 }),
  ent_shipping_ctn_type_desc: varchar("ent_shipping_ctn_type_desc", {
    length: 42,
  }),
  ent_shipping_ctn_dimension: varchar("ent_shipping_ctn_dimension", {
    length: 42,
  }),
  ent_shipping_ctn_quantity: integer("ent_shipping_ctn_quantity"),
  ent_shipping_ctn_cbm: decimal("ent_shipping_ctn_cbm", {
    precision: 10,
    scale: 2,
  }),
  ent_shipping_ctn_gw: decimal("ent_shipping_ctn_gw", {
    precision: 10,
    scale: 2,
  }),
  extra_attrs: jsonb("extra_attrs").$type<Record<string, string>>().default({}),
});
