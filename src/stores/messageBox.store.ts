import { defineStore } from 'pinia'
import type { TranslationSchema } from '@/plugins/i18n'
export interface IMessageBox {
  isOpen?: boolean
  cancelButtonText: TranslationSchema
  cancelButtonClass: string
  showCancelButton: boolean
  title: TranslationSchema
  message: TranslationSchema
  confirmButtonText: TranslationSchema
  callback: (decision: 'confirm' | 'cancel' | 'close') => void
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
    callback: () => {},
  }),

  actions: {
    async openMessageBox(): Promise<void> {
      this.isOpen = true
    },
    async closeMessageBox(): Promise<void> {
      this.isOpen = false
    },
    async setMessageBoxInfo(messageBoxInfo: IMessageBox): Promise<void> {
      this.$patch({ ...messageBoxInfo })
      this.openMessageBox()
    },
  },
})
