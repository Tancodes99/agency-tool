import { supabase } from './supabase'

export async function logActivity({
  agencyId,
  projectId,
  userEmail,
  action,
  metadata = '',
}) {

  await supabase
    .from('activity_logs')
    .insert([
      {
        agency_id: agencyId,
        project_id: projectId,
        user_email: userEmail,
        action,
        metadata,
      }
    ])
}