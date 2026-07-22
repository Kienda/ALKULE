import "dotenv/config";

if (!process.env.TEST_DATABASE_URL) {
  console.error("TEST_DATABASE_URL is not set. Add it to .env before running tests.");
  process.exit(1);
}
if (!process.env.TEST_DATABASE_URL.includes("test")) {
  console.error("TEST_DATABASE_URL must point at a database with 'test' in its name, as a safety check.");
  process.exit(1);
}
process.env.DATABASE_URL = process.env.TEST_DATABASE_URL;

await import("./api.test.mjs");
