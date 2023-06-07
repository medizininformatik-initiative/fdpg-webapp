import type { TranslationSchema } from '@/plugins/i18n'
import type { RouteName } from '@/types/route-name.enum'

export const getLastDashboardTitle = (name: RouteName): TranslationSchema => {
  switch (name) {
    case 'Dashboard': {
      return 'sidebar.dashboard'
    }
    case 'Pending': {
      return 'general.pending'
    }
    case 'Ongoing': {
      return 'general.current'
    }
    case 'Completed': {
      return 'general.completed'
    }
    case 'Archive': {
      return 'general.archive'
    }
    default: {
      return 'sidebar.dashboard'
    }
  }
}
