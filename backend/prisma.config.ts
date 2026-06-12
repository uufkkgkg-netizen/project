import "dotenv/config";
// import { defineConfig } from "prisma/config"; // تم التعطيل لتجاوز خطأ البناء
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

// export default defineConfig({  // تم التعطيل لتجاوز خطأ البناء
//   schema: "prisma/schema.prisma",
//   migrations: {
//     path: "prisma/migrations",
//   },
//   datasource: {
//     url: process.env["DATABASE_URL"],
//   },
// });
