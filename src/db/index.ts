import { Sequelize } from "sequelize-typescript";
import { SQLITE_HOST, SQLITE_PASS, SQLITE_USER } from "../env";
import { CachedVoiceChannel } from "./CachedVoiceChannel";
import { GameChannel } from "./GameChannel";

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

await db.sync({ alter: true });

export async function initDB() {}
