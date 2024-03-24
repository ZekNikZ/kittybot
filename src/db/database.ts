import { Sequelize } from "sequelize-typescript";
import { SQLITE_HOST, SQLITE_PASS, SQLITE_USER } from "../env.ts";
import { CachedVoiceChannel } from "./CachedVoiceChannel.ts";
import { GameChannel } from "./GameChannel.ts";

export const db = new Sequelize({
  database: "kittybot",
  host: SQLITE_HOST,
  username: SQLITE_USER,
  password: SQLITE_PASS,
  dialect: "sqlite",
  logging: false,
  storage: "database.sqlite3",
  models: [CachedVoiceChannel, GameChannel],
});

await db.sync();

export async function initDB() {}
