import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.renameTable("orders", "orders_old");

  await knex.schema.createTable("orders", (table) => {
    table.increments("id").primary();
    table.integer("table_session_id").notNullable().references("id").inTable("tables_sessions");
    table.integer("product_id").notNullable().references("id").inTable("products");
    table.integer("quantity").notNullable();
    table.decimal("price", 10, 2).notNullable();
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(knex.fn.now());
  });

  await knex("orders").insert(
    knex("orders_old").select(
      "id",
      "table_session_id",
      "product_id",
      "quantity",
      "price",
      "created_at",
      "updated_at",
    ),
  );

  await knex.schema.dropTable("orders_old");
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.renameTable("orders", "orders_old");

  await knex.schema.createTable("orders", (table) => {
    table.increments("id").primary();
    table.integer("table_session_id").notNullable().references("id").inTable("table_sessions");
    table.integer("product_id").notNullable().references("id").inTable("products");
    table.integer("quantity").notNullable();
    table.decimal("price", 10, 2).notNullable();
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(knex.fn.now());
  });

  await knex("orders").insert(
    knex("orders_old").select(
      "id",
      "table_session_id",
      "product_id",
      "quantity",
      "price",
      "created_at",
      "updated_at",
    ),
  );

  await knex.schema.dropTable("orders_old");
}