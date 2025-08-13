import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";
import path from "path";

config({ path: path.join(__dirname, ".env") });

export default defineConfig({
  out: path.join(__dirname, "./src/db/drizzle"),
  schema: path.join(__dirname, "./src/db/schema/*"),
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
