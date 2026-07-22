import "dotenv/config";
import { randomBytes } from "node:crypto";
import { prisma } from "./db.mjs";
import { hashPassword } from "./auth.mjs";
import { writeAuditLog } from "./audit.mjs";

function parseArgs(argv) {
  const args = {};
  for (const raw of argv) {
    const match = raw.match(/^--([^=]+)=(.*)$/);
    if (match) args[match[1]] = match[2];
  }
  return args;
}

async function bootstrapOwner(args) {
  const email = String(args.email || "").trim().toLowerCase();
  if (!email.includes("@")) {
    console.error("Usage: node Backend/cli.mjs bootstrap-owner --email=owner@example.com [--name=\"Owner Name\"]");
    process.exitCode = 1;
    return;
  }
  const name = args.name || "Owner";

  let user = await prisma.user.findUnique({ where: { email } });
  let generatedPassword = null;

  if (!user) {
    generatedPassword = process.env.OWNER_BOOTSTRAP_PASSWORD || randomBytes(18).toString("base64url");
    user = await prisma.user.create({
      data: {
        email,
        name,
        passwordHash: hashPassword(generatedPassword),
        emailVerifiedAt: new Date(),
      },
    });
  }

  await prisma.userRole.upsert({
    where: { userId_role: { userId: user.id, role: "owner" } },
    create: { userId: user.id, role: "owner" },
    update: {},
  });

  if (user.status !== "active") {
    await prisma.user.update({ where: { id: user.id }, data: { status: "active" } });
  }

  await writeAuditLog({
    actorId: null,
    action: "owner.bootstrap",
    targetType: "user",
    targetId: user.id,
    metadata: { email, createdNewAccount: Boolean(generatedPassword) },
  });

  console.log(`Owner role ensured for ${email}.`);
  if (generatedPassword) {
    console.log("A new account was created. One-time generated password (store it securely, it will not be shown again):");
    console.log(generatedPassword);
  } else {
    console.log("Existing account found; password was not changed.");
  }
}

const [command, ...rest] = process.argv.slice(2);
const args = parseArgs(rest);

try {
  if (command === "bootstrap-owner") {
    await bootstrapOwner(args);
  } else {
    console.error("Unknown command. Available commands: bootstrap-owner");
    process.exitCode = 1;
  }
} finally {
  await prisma.$disconnect();
}
