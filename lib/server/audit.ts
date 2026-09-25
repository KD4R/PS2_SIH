export async function writeAuditLog(
  userId: string,
  action: string,
  resourceId: string,
  resourceType: string,
  metadata?: any
) {
  // In a real system, this would write to a secure append-only audit log table
  console.log(`[AUDIT LOG] User ${userId} performed ${action} on ${resourceType} ${resourceId}`, metadata || "");
}
