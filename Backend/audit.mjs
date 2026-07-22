import { prisma } from "./db.mjs";

export async function writeAuditLog({ actorId = null, action, targetType = null, targetId = null, metadata = null }) {
  await prisma.auditLog.create({
    data: { actorId, action, targetType, targetId, metadata: metadata ?? undefined },
  });
}
