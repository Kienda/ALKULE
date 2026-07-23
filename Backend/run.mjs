import { spawn } from "node:child_process";
import { createRequire } from "node:module";

// `npm start` passes --production explicitly. Do not rely on a hosting
// platform to inject NODE_ENV, otherwise a deployment may start `next dev`
// and fail its health check while compiling the first request.
const production = process.argv.includes("--production") || process.env.NODE_ENV === "production";
const frontendPort = process.env.PORT || "3000";
const require = createRequire(import.meta.url);
const nextCli = require.resolve("next/dist/bin/next");
const env = { ...process.env, DOTENV_CONFIG_QUIET: "true" };
const api = spawn(process.execPath, ["Backend/index.mjs"], { stdio: "inherit", env });
const frontend = spawn(process.execPath, [nextCli, production ? "start" : "dev", ...(production ? [] : ["--webpack"]), "-p", frontendPort], { stdio: "inherit", env });

function stop(signal = "SIGTERM") { api.kill(signal); frontend.kill(signal); }
process.on("SIGINT", () => { stop("SIGINT"); process.exit(0); });
process.on("SIGTERM", () => { stop(); process.exit(0); });
api.on("exit", code => { if (code) { frontend.kill(); process.exit(code); } });
frontend.on("exit", code => { api.kill(); process.exit(code ?? 0); });
