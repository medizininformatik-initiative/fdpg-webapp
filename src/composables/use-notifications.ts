import { ElNotification } from 'element-plus'
import { useI18n } from 'vue-i18n'
export default () => {
  const { t } = useI18n()
  const showErrorMessage = (message?: string | string[]) => {
    if (message === undefined) {
      ElNotification({ title: 'Error', message: t('general.genericError'), type: 'error' })
    } else if (typeof message === 'object') {
      message.forEach((m, index) =>
        setTimeout(() => {
          ElNotification({ title: 'Error', message: m, type: 'error' })
        }, 100 * index),
      )
    } else {
      ElNotification({ title: 'Error', message: message, type: 'error' })
    }
  }

  const showSuccessMessage = (message?: string) => {
    if (message === undefined) {
      message = t('general.submitted')
    }
    ElNotification({ title: 'Success', message: message, type: 'success' })
  }

  return {
    showErrorMessage,
    showSuccessMessage,
  }
}
