import { supabase } from '../supabase'
import type { AutomationEventType, AutomationEvent } from './types'

export function emit<T extends Record<string, unknown>>(type: AutomationEventType, data: T): void {
  const event: AutomationEvent<T> = {
    id: crypto.randomUUID(),
    type,
    version: 1,
    timestamp: new Date().toISOString(),
    source: 'academy',
    data,
  }
  supabase.functions.invoke('automation-emit', { body: event }).catch(() => {
    // عمداً نادیده گرفته می‌شه — اگه n8n خاموش باشه، سایت نباید بشکنه
  })
}
