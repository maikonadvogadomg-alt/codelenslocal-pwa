/**
 * Banco de dados local — substitui o "@workspace/db" que ficou preso na Replit.
 *
 * Antes: Postgres na nuvem (Neon), precisava de DATABASE_URL e senha.
 * Agora: PGlite — o mesmo Postgres, só que rodando dentro do próprio Node,
 * guardado na pasta  dados/banco  ao lado do programa. Sem internet, sem senha.
 * O resto do código (drizzle) continua igualzinho.
 */
import path from "path";
import fs from "fs";
import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import { pgTable, serial, text, integer, timestamp, uniqueIndex, customType } from "drizzle-orm/pg-core";

const DATA_DIR = path.resolve(process.env.DATA_DIR ?? path.join(process.cwd(), "dados"));
const STORAGE_BASE = path.resolve(process.env.STORAGE_PATH ?? path.join(DATA_DIR, "projetos"));
const DB_DIR = path.join(DATA_DIR, "banco");
fs.mkdirSync(DB_DIR, { recursive: true });
fs.mkdirSync(STORAGE_BASE, { recursive: true });

/**
 * A pasta de cada projeto é guardada só pelo nome (slug) e montada na hora
 * com a pasta atual. Assim dá para mover a pasta do programa (ou trocar de PC)
 * sem os projetos se perderem.
 */
const projectFolder = customType<{ data: string; driverData: string }>({
  dataType: () => "text",
  toDriver: (v) => path.basename(String(v).replace(/\\/g, "/")),
  fromDriver: (v) => path.join(STORAGE_BASE, path.basename(String(v).replace(/\\/g, "/"))),
});

export const projectsTable = pgTable("projects", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull(),
  name: text("name").notNull(),
  storagePath: projectFolder("storage_path").notNull(),
  fileCount: integer("file_count").notNull().default(0),
  sizeBytes: integer("size_bytes").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const projectFilesTable = pgTable(
  "project_files",
  {
    id: serial("id").primaryKey(),
    projectId: integer("project_id").notNull().references(() => projectsTable.id, { onDelete: "cascade" }),
    path: text("path").notNull(),
    content: text("content").notNull(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [uniqueIndex("project_files_project_path").on(t.projectId, t.path)],
);

export const settingsTable = pgTable("settings", {
  id: serial("id").primaryKey(),
  aiApiKey: text("ai_api_key"),
  aiBaseUrl: text("ai_base_url"),
  aiModel: text("ai_model"),
  githubToken: text("github_token"),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const snippetsTable = pgTable("snippets", {
  id: serial("id").primaryKey(),
  title: text("title").notNull().default("Sem título"),
  html: text("html").notNull().default(""),
  css: text("css").notNull().default(""),
  js: text("js").notNull().default(""),
  mode: text("mode").notNull().default("html"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

const client = new PGlite(DB_DIR);

// Cria as tabelas na primeira vez (não apaga nada se já existirem)
await client.exec(`
  CREATE TABLE IF NOT EXISTS projects (
    id SERIAL PRIMARY KEY,
    slug TEXT NOT NULL,
    name TEXT NOT NULL,
    storage_path TEXT NOT NULL,
    file_count INTEGER NOT NULL DEFAULT 0,
    size_bytes INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT now()
  );
  CREATE TABLE IF NOT EXISTS project_files (
    id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    path TEXT NOT NULL,
    content TEXT NOT NULL,
    updated_at TIMESTAMP NOT NULL DEFAULT now()
  );
  CREATE UNIQUE INDEX IF NOT EXISTS project_files_project_path ON project_files(project_id, path);
  CREATE TABLE IF NOT EXISTS settings (
    id SERIAL PRIMARY KEY,
    ai_api_key TEXT,
    ai_base_url TEXT,
    ai_model TEXT,
    github_token TEXT,
    updated_at TIMESTAMP NOT NULL DEFAULT now()
  );
  CREATE TABLE IF NOT EXISTS snippets (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL DEFAULT 'Sem título',
    html TEXT NOT NULL DEFAULT '',
    css TEXT NOT NULL DEFAULT '',
    js TEXT NOT NULL DEFAULT '',
    mode TEXT NOT NULL DEFAULT 'html',
    created_at TIMESTAMP NOT NULL DEFAULT now()
  );
`);

export const db = drizzle(client);
export { STORAGE_BASE, DATA_DIR };
