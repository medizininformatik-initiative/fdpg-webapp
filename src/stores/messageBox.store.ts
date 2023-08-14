import { defineStore } from 'pinia'
import type { TranslationSchema } from '@/plugins/i18n'

export type DecisionType = 'confirm' | 'cancel' | 'close'
export interface IMessageBox {
  isOpen?: boolean
  cancelButtonText: TranslationSchema
  cancelButtonClass: string
  showCancelButton: boolean
  title: TranslationSchema
  message: TranslationSchema
  confirmButtonText: TranslationSchema
  callback: (decision: DecisionType) => Promise<void>
}

export const useMessageBoxStore = defineStore('MessageBox', {
  state: (): IMessageBox => ({
    isOpen: false,
    cancelButtonText: 'general.cancel',
    cancelButtonClass: 'el-button--text',
    showCancelButton: true,
    title: 'general.title',
    message: 'general.title',
    confirmButtonText: 'general.save',
    callback: async () => {},
  }),

  actions: {
    openMessageBox(): void {
      this.isOpen = true
    },
    closeMessageBox(): void {
      this.isOpen = false
    },
    setMessageBoxInfo(messageBoxInfo: IMessageBox): void {
      this.$patch({ ...messageBoxInfo })
      this.openMessageBox()
    },
  },
})
