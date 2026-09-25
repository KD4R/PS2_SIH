export async function writeAuditLog(
  userId: string,
  role: string,
  resourceType: string,
  resourceId: string,
  action: string,
  oldState?: any,
  newState?: any
) {
  // In a real system, this would write to a secure append-only audit log table
  console.log(`[AUDIT LOG] User ${userId} (${role}) performed ${action} on ${resourceType} ${resourceId}`, { oldState, newState });
}
