export type AutomationEventType =
  | 'student.registered'
  | 'course.enrollment.created'
  | 'support.created'
  | 'message.created'
  | 'document.uploaded'
  | 'admin.notification'

export interface AutomationEvent<T = Record<string, unknown>> {
  id: string
  type: AutomationEventType
  version: 1
  timestamp: string
  source: 'academy'
  data: T
}
