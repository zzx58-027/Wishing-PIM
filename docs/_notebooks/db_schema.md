# 订单 schema
每一次的客户订单都需要记录, 使用 deprecated 标识是否已经废弃
对象实例有许多版本概念, 使用 uuid 减少复杂性
```ts
// 订单 item 不需要这些, 这些是 产品 item 的属性
customer_id: varchar("customer_id", { length: 13 }), // E05
customer_name: varchar("customer_name", { length: 13 }), // ENDON
customer_po_ref: varchar("customer_po_ref", { length: 27 }).notNull(), //一定程度冗余, 因为有 parent_po_id, 但可作为业务字段, 可以用于查询, 因为订单 item 有多版本.
product_desc: varchar("product_desc", { length: 58 }).notNull(), // 虽然可以作为 product 属性, 但是 product 开发阶段可能没有英文描述, 因此需要留底.
order_items 为什么没有 wishing_po_ref, 因为 order_items 更多是支撑订单解析的数据结构, 即使是 customer_po_ref 也是仅做参考, 具体查询应该通过 item 的 parent_uuid 来确定, 订单解析后的结果确认后就不做修改了的. 这种确认只是补齐 AI 解析的不精确性.
```
外键是数据库级别的约束，在每次插入/更新/删除操作时都会进行检查，如果违反约束则会抛出错误。另一方面，关系是更高层次的抽象，仅用于在应用程序级别定义表之间的关系。它们不会以任何方式影响数据库模式，也不会隐式创建外键。
在 Drizzle ORM 中，字段上的 references 和外键（Foreign Key）是一样的.
多维表格的查询引用字段, 可以通过 relations + select 实现, 其实就是一个 关联查询, 并加上持久化操作.
bun run rds1:migrate -- --name init --verbose => -- 告诉 bun 后面的参数应该传递给底层命令