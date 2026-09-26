import { createClient } from "@/lib/supabase/server";

export async function writeAuditLog(
  userId: string,
  role: string,
  resourceType: string,
  resourceId: string,
  action: string,
  oldState?: any,
  newState?: any
) {
  const supabase = await createClient();
  await supabase.rpc('write_audit_log_entry', {
    p_actor_id: userId,
    p_actor_role: role,
    p_entity_type: resourceType,
    p_entity_id: resourceId,
    p_action: action,
    p_old_value: oldState,
    p_new_value: newState
  });
}
