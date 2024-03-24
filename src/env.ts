import dotenv from "dotenv";
dotenv.config();

function optionalEnv(name: string) {
  return process.env[name];
}

function requiredEnv(name: string) {
  const val = process.env[name];
  if (!val) {
    console.error(`Environment variable ${name} not set.`);
    process.exit(1);
  }
  return val;
}

export const TOKEN = requiredEnv("TOKEN");
export const CLIENT_ID = requiredEnv("CLIENT_ID");
export const TEST_SERVER = optionalEnv("TEST_SERVER");

export const ADMIN_USERNAME = optionalEnv("ADMIN_USERNAME");

export const SQLITE_HOST = requiredEnv("SQLITE_HOST");
export const SQLITE_USER = requiredEnv("SQLITE_USER");
export const SQLITE_PASS = requiredEnv("SQLITE_PASS");
