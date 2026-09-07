import path from "node:path";
import { defineConfig } from "prisma/config";

export default defineConfig({
  earlyAccess: true,
  schema: path.join("prisma", "schema.prisma"),

  migrate: {
    async url() {
      // Direct (unpooled) URL for schema migrations
      return process.env.DIRECT_URL || process.env.DATABASE_URL || "";
    },
  },
});
