import type { TranslationSchema } from '@/plugins/i18n'

export interface IProjectTodo {
  date?: string
  title: string
  description: string
  action: (...args: any) => void
  actionLabel?: TranslationSchema
  type: 'comment' | 'decision' | 'info'
  icon?: string
  isDone?: boolean
  testId?: string
}
