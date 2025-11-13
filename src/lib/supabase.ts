import { createClient } from '@supabase/supabase-js'

export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://hvkuuuhijtlhsogzgbix.supabase.co'
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh2a3V1dWhpanRsaHNvZ3pnYml4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0ODE4OTMsImV4cCI6MjA3ODA1Nzg5M30.ztW5p4qZreDA8cy4jrWxc32LJFHTN6dVbtLrVCL8eeU'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

export const EDGE_FUNCTIONS = {
  CREATE_AGENT_IDENTITY: `${SUPABASE_URL}/functions/v1/create-agent-identity`,
  PROCESS_PAYMENT: `${SUPABASE_URL}/functions/v1/process-payment`,
  UPDATE_REPUTATION: `${SUPABASE_URL}/functions/v1/update-reputation`,
  GET_MARKETPLACE: `${SUPABASE_URL}/functions/v1/get-marketplace`,
}
