const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Global Audit Logger
 * @param {number} userId - The user performing the action
 * @param {string} action - Action type (CREATE, UPDATE, DELETE, etc.)
 * @param {string} entityType - Model name (Report, Plan, etc.)
 * @param {string|number} entityId - Primary key of the entity
 * @param {object} metadata - Extra details or diffs
 * @param {string} ipAddress - Client IP if available
 */
async function logAudit({ userId, action, entityType, entityId, metadata, ipAddress }) {
  try {
    await prisma.auditLog.create({
      data: {
        userId,
        action,
        entityType,
        entityId: entityId ? String(entityId) : null,
        metadata: metadata ? JSON.stringify(metadata) : null,
        ipAddress: ipAddress || null
      }
    });
    console.log(`[Audit] ${action} on ${entityType} ${entityId} by User ${userId}`);
  } catch (error) {
    console.error('[Audit Error] Failed to create audit log:', error);
  }
}

module.exports = { logAudit };
