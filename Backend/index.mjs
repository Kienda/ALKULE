import "dotenv/config";
import express from "express";
// Firebase all-in API (Firebase Auth + Firestore). The prior Postgres/Prisma
// router lives in ./api.mjs, parked and independently tested during migration.
import api from "./firebase-api.mjs";

const port = Number(process.env.API_PORT || 4000);
const hostname = process.env.API_HOST || "127.0.0.1";
const server = express();
server.disable("x-powered-by");
server.use("/api", api);
server.get("/", (_request, response) => response.json({ service: "alkule-api", health: "/api/health" }));
server.listen(port, hostname, () => {
  console.log(`Alkule backend ready at http://${hostname}:${port}`);
});
