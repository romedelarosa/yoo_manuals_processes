import fs from "node:fs";
import { Client } from "pg";

function readEnv(path) {
  return Object.fromEntries(
    fs
      .readFileSync(path, "utf8")
      .split(/\r?\n/)
      .filter(Boolean)
      .filter((line) => !line.startsWith("#"))
      .map((line) => {
        const index = line.indexOf("=");
        return [line.slice(0, index), line.slice(index + 1).replace(/^"|"$/g, "")];
      }),
  );
}

async function main() {
  const sqlPath = process.argv[2];
  if (!sqlPath) throw new Error("Usage: node scripts/apply-sql.mjs <sql-file>");

  const env = readEnv(".env.local");
  const connectionString = env.POSTGRES_URL_NON_POOLING || env.POSTGRES_URL;
  if (!connectionString) throw new Error("POSTGRES_URL is missing from .env.local");

  const relaxedSslConnectionString = connectionString.replace(
    "sslmode=require",
    "sslmode=no-verify",
  );

  const client = new Client({
    connectionString: relaxedSslConnectionString,
    ssl: { rejectUnauthorized: false },
  });

  await client.connect();
  await client.query(fs.readFileSync(sqlPath, "utf8"));
  await client.end();
  console.log("migration_applied");
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
