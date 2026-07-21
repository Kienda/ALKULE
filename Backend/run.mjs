import { spawn } from "node:child_process";
import { createRequire } from "node:module";

const production = process.env.NODE_ENV === "production";
const frontendPort = process.env.PORT || "3000";
const require = createRequire(import.meta.url);
const nextCli = require.resolve("next/dist/bin/next");
const api = spawn(process.execPath, ["Backend/index.mjs"], { stdio: "inherit", env: process.env });
const frontend = spawn(process.execPath, [nextCli, production ? "start" : "dev", ...(production ? [] : ["--webpack"]), "-p", frontendPort], { stdio: "inherit", env: process.env });

function stop(signal = "SIGTERM") { api.kill(signal); frontend.kill(signal); }
process.on("SIGINT", () => { stop("SIGINT"); process.exit(0); });
process.on("SIGTERM", () => { stop(); process.exit(0); });
api.on("exit", code => { if (code) { frontend.kill(); process.exit(code); } });
frontend.on("exit", code => { api.kill(); process.exit(code ?? 0); });
