<template>
  <FdpgDialog
    v-model="isOpen"
    :title="$t(messageBoxStore.title)"
    :message="$t(messageBoxStore.message)"
    @close="handleCallback('close')"
  >
    <template #footer>
      <span>
        <el-button
          v-if="messageBoxStore.showCancelButton"
          type="text"
          :class="messageBoxStore.cancelButtonClass"
          @click="handleCallback('cancel')"
        >
          {{ cancelButtonText }}
        </el-button>
        <el-button type="primary" @click="handleCallback('confirm')">
          {{ confirmButtonText }}
        </el-button>
      </span>
    </template>
  </FdpgDialog>
</template>

<script setup lang="ts">
import { useMessageBoxStore } from '@/stores/messageBox.store'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import FdpgDialog from './FdpgDialog.vue'

const { t } = useI18n()
const messageBoxStore = useMessageBoxStore()
const isOpen = computed<boolean>(() => {
  return messageBoxStore.isOpen || false
})
const handleCallback = (decision: 'confirm' | 'cancel' | 'close') => {
  messageBoxStore.callback(decision)
  messageBoxStore.closeMessageBox()
}
const cancelButtonText = computed(() => {
  return t(messageBoxStore.cancelButtonText || 'general.cancel')
})
const confirmButtonText = computed(() => {
  return t(messageBoxStore.confirmButtonText || 'general.save')
})
</script>
