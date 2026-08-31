import { createClient, SupabaseClient } from '@supabase/supabase-js'

export interface SupabaseConfig {
  url: string
  anonKey: string
}

const STORAGE_KEY_SUPABASE_CONFIG = 'hietm_supabase_config_v1'

// Default environment variables if provided at build/deploy time
const ENV_URL = import.meta.env.VITE_SUPABASE_URL || ''
const ENV_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

export function getSavedSupabaseConfig(): SupabaseConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SUPABASE_CONFIG)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (parsed.url && parsed.anonKey) {
        return parsed
      }
    }
  } catch (e) {
    console.error('Failed to parse saved supabase config', e)
  }

  return {
    url: ENV_URL,
    anonKey: ENV_ANON_KEY,
  }
}

export function saveSupabaseConfig(config: SupabaseConfig) {
  try {
    localStorage.setItem(STORAGE_KEY_SUPABASE_CONFIG, JSON.stringify(config))
  } catch (e) {
    console.error('Failed to save supabase config', e)
  }
}

export function clearSupabaseConfig() {
  try {
    localStorage.removeItem(STORAGE_KEY_SUPABASE_CONFIG)
  } catch (e) {
    console.error('Failed to clear supabase config', e)
  }
}

let activeClient: SupabaseClient | null = null

export function getSupabaseClient(): SupabaseClient | null {
  const config = getSavedSupabaseConfig()
  if (!config.url || !config.anonKey) {
    return null
  }

  if (!activeClient) {
    try {
      activeClient = createClient(config.url, config.anonKey, {
        auth: { persistSession: false },
        realtime: {
          params: {
            eventsPerSecond: 10,
          },
        },
      })
    } catch (e) {
      console.error('Failed to initialize Supabase client', e)
      activeClient = null
    }
  }

  return activeClient
}

export function resetSupabaseClient() {
  activeClient = null
}

export async function testSupabaseConnection(url: string, anonKey: string): Promise<{ success: boolean; error?: string }> {
  try {
    if (!url || !anonKey) {
      return { success: false, error: 'يرجى إدخال الرابط (URL) والمفتاح (Anon Key) الخاص بـ Supabase' }
    }

    const testClient = createClient(url, anonKey, {
      auth: { persistSession: false },
    })

    const { error } = await testClient.from('observers').select('id').limit(1)

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'فشل الاتصال بقاعدة البيانات'
    return { success: false, error: message }
  }
}
