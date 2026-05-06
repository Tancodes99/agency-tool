import { supabase } from '../lib/supabase'

export async function logError({
  agencyId,
  userEmail,
  error,
  page,
}) {

  await supabase
    .from('error_logs')
    .insert([
      {
        agency_id: agencyId,
        user_email: userEmail,
        error_message: error?.message || String(error),
        page,
      },
    ])
}