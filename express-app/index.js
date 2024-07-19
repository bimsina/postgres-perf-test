import express from "express";
import { createClient } from "@supabase/supabase-js";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { pgTable, serial, text } from "drizzle-orm/pg-core";

const app = express();
const port = 3000;

const supabase = createClient(
  "http://127.0.0.1:54321",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0"
);

const client = postgres(
  "postgresql://postgres:postgres@127.0.0.1:54322/postgres"
);

const usersTable = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
});
export const db = drizzle(client, {
  schema: {
    usersTable,
  },
});

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.get("/supabasejs", async (req, res) => {
  try {
    const { data, error } = await supabase.from("users").select().limit(100);
    if (error) return res.status(400).send(error.message);
    res.json(data);
  } catch (e) {
    console.log(e);
    res.status(500).send(e.message);
  }
});

app.get("/drizzle", async (req, res) => {
  try {
    const users = await db.query.usersTable.findMany({
      limit: 100,
    });
    res.json(users);
  } catch (e) {
    console.log(e);
    res.status(500).send(e.message);
  }
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
