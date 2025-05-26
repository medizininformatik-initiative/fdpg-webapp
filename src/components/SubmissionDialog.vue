<template>
  <FdpgDialog
    v-model="dialogOpen"
    class="submission-dialog"
    width="50%"
    :title="dialogContent.title"
    :before-close="closeDialog"
    :show-close="false"
    footer-justify="space-between"
  >
    <div class="submission-dialog-content">
      <p v-if="dialogContent.content" class="checkbox-content">
        {{ dialogContent.content }}
      </p>
      <el-row>
        <el-col :sm="12">
          <el-button type="text" link @click="closeDialog">
            {{ t('proposal.backToForm') }}
          </el-button>
        </el-col>
        <el-col :sm="12" class="text-right">
          <el-button
            v-for="action in dialogContent.actions"
            :key="action.text"
            :type="action.attribute.type"
            :plain="action.attribute.plain"
            @click="action.onClick"
          >
            {{ action.text }}
          </el-button>
        </el-col>
      </el-row>
    </div>
    <template #footer>
      <img :src="logo" alt="" v-for="(logo, i) in dataSourceLogos" :key="i" width="120px" />
    </template>
  </FdpgDialog>
</template>

<script setup lang="ts">
import type { PlatformIdentifier } from '@/types/platform-identifier.enum'
import { useVModel } from '@vueuse/core'
import { computed, type PropType } from 'vue'
import { useI18n } from 'vue-i18n'
import FdpgDialog from './FdpgDialog.vue'
import type { DialogContent } from '../types/dialog.types'

const emit = defineEmits(['update:modelValue', 'confirm', 'saveDraft', 'exportPdf'])
const { t } = useI18n()
const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true,
  },
  platform: {
    type: Array as PropType<PlatformIdentifier[]>,
    required: true,
  },
  isValidToSubmit: {
    type: Boolean,
    default: false,
  },
})

const dialogOpen = useVModel(props, 'modelValue', emit)

const closeDialog = () => {
  dialogOpen.value = false
}

const confirm = () => {
  emit('confirm')
}
const saveDraft = () => {
  emit('saveDraft')
}
const exportPdf = () => {
  emit('exportPdf')
}

const dataSourceLogos = [
  new URL('@/assets/img/logo/datasources/dfg.svg', import.meta.url).href,
  new URL('@/assets/img/logo/datasources/dife.svg', import.meta.url).href,
  new URL('@/assets/img/logo/datasources/hfdi.svg', import.meta.url).href,
  new URL('@/assets/img/logo/datasources/mii.svg', import.meta.url).href,
  new URL('@/assets/img/logo/datasources/zb.svg', import.meta.url).href,
]

const dialogContent = computed<DialogContent>(() => {
  return props.isValidToSubmit
    ? {
        title: t('proposal.submitApplicationTitle'),
        content: t('proposal.submitApplicationContent'),
        actions: [
          { text: t('proposal.exportPdfProposal'), onClick: exportPdf, attribute: { type: 'primary', plain: true } },
          { text: t('general.confirm'), onClick: confirm, attribute: { type: 'primary' } },
        ],
      }
    : {
        title: t('proposal.submitApplicationErrorTitle'),
        content: t('proposal.submitApplicationErrorContent'),
        actions: [{ text: t('proposal.saveDraft'), onClick: saveDraft, attribute: { type: 'primary', plain: true } }],
      }
})
</script>

<style lang="scss" scoped>
@use '@/assets/sass/variable' as *;

.text-right {
  display: flex;
  justify-content: flex-end;
  gap: 8px;

  .el-button {
    width: 150px;
    flex-shrink: 0;
  }
}
.submission-dialog {
  .submission-dialog-content {
    padding-bottom: 24px;
    border-bottom: 1px solid $gray-200;
  }
}
</style>
