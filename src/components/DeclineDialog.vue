<template>
  <FdpgDialog v-model="dialogOpen" width="50%" :title="$t(title)" :before-close="closeDialog" :show-close="false">
    <div>
      <p>{{ $t(description) }}</p>

      <FdpgLabel html-for="proposal.declineReasonLabel" />
      <FdpgInput
        v-model="declineReason"
        data-testId="declineReason"
        placeholder="proposal.declineReasonPlaceholder"
        type="textarea"
        :rows="2"
        autosize
      />
    </div>

    <template #footer>
      <span>
        <el-button type="text" data-testId="button__closeSignDialog" @click="closeDialog">
          {{ $t('general.cancel') }}
        </el-button>
        <el-button
          type="primary"
          :disabled="!declineReason || declineReason.trim().length <= 0"
          data-testid="button__confirm"
          @click="confirm"
        >
          {{ $t(buttonText) }}
        </el-button>
      </span>
    </template>
  </FdpgDialog>
</template>

<script setup lang="ts">
import type { PropType } from 'vue'
import { ref } from 'vue'

import type { TranslationSchema } from '@/plugins/i18n'
import { useVModel } from '@vueuse/core'
import FdpgLabel from './FdpgLabel.vue'
import FdpgInput from './FdpgInput.vue'
import FdpgDialog from './FdpgDialog.vue'

const emit = defineEmits(['update:modelValue', 'confirm'])

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true,
  },

  title: {
    type: String as PropType<TranslationSchema>,
    required: true,
  },

  description: {
    type: String as PropType<TranslationSchema>,
    required: true,
  },

  buttonText: {
    type: String as PropType<TranslationSchema>,
    required: true,
  },
})

const declineReason = ref<string | undefined>(undefined)

const dialogOpen = useVModel(props, 'modelValue', emit)
const closeDialog = () => {
  declineReason.value = undefined
  dialogOpen.value = false
}

const confirm = () => {
  if (declineReason.value && declineReason.value.trim().length > 0) {
    emit('confirm', declineReason.value)
  }
}
</script>
