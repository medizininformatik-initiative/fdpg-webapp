<template>
  <FdpgDialog
    v-model="dialogOpen"
    class="terms-dialog"
    width="50%"
    :title="$t('proposal.termsDialogTitle')"
    :before-close="closeDialog"
    :show-close="false"
  >
    <div v-if="configStore.termsAndConditions[props.platform]?.messages">
      <el-checkbox-group v-model="checkList" class="terms-checklist">
        <FdpgCheckbox
          v-for="(option, optionIdx) in configStore.termsAndConditions[platform]?.terms"
          :key="'option_' + optionIdx"
          :value="'option_' + optionIdx"
          :size="FdpgInputSize.Small"
        >
          <i18n-t :keypath="option.label" tag="div" class="checkbox-content" scope="parent">
            <template v-for="(slot, slotIdx) in option.slots" :key="optionIdx + 'slot_' + slotIdx" #[slot.name]>
              <a v-if="slot.link" target="_blank" :href="slot.link">{{ i18n.t(slot.label) }}</a>

              <span v-else>{{ i18n.t(slot.label) }}</span>
            </template>
          </i18n-t>
        </FdpgCheckbox>
      </el-checkbox-group>
    </div>

    <template #footer>
      <span>
        <el-button type="text" data-testId="button__closeSignDialog" @click="closeDialog">
          {{ $t('general.cancel') }}
        </el-button>
        <el-button
          type="primary"
          :disabled="configStore.termsAndConditions[platform] == undefined || checkList.length < configStore.termsAndConditions[platform]!.terms.length"
          data-testid="button__confirm"
          @click="confirm"
        >
          {{ $t('proposal.submitApplication') }}
        </el-button>
      </span>
    </template>
  </FdpgDialog>
</template>

<script setup lang="ts">
import useNotifications from '@/composables/use-notifications'
import { useConfigStore } from '@/stores/config/config.store'
import { FdpgInputSize } from '@/types/component.types'
import type { PlatformIdentifier } from '@/types/platform-identifier.enum'
import { useVModel } from '@vueuse/core'
import type { PropType } from 'vue'
import { onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import FdpgCheckbox from './FdpgCheckbox.vue'
import FdpgDialog from './FdpgDialog.vue'
const emit = defineEmits(['update:modelValue', 'confirm'])

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true,
  },
  platform: {
    type: String as PropType<PlatformIdentifier>,
    required: true,
  },
})

const dialogOpen = useVModel(props, 'modelValue', emit)
const closeDialog = () => {
  dialogOpen.value = false
}

const confirm = () => {
  if (
    configStore.termsAndConditions[props.platform] != undefined &&
    checkList.value.length === configStore.termsAndConditions[props.platform]!.terms.length
  ) {
    emit('confirm')
  }
}

const { showErrorMessage } = useNotifications()
const configStore = useConfigStore()

const i18n = useI18n({
  useScope: 'local',
  messages: configStore.termsAndConditions[props.platform]?.messages,
})

onMounted(async () => {
  if (!configStore.termsAndConditions[props.platform]) {
    try {
      await configStore.getTermsAndConditions(props.platform)

      Object.entries(configStore.termsAndConditions[props.platform]?.messages ?? {}).forEach(([locale, messages]) => {
        i18n.setLocaleMessage(locale, messages)
      })
    } catch (error) {
      showErrorMessage()
      console.log(error)
    }
  }
})

const checkList = ref([])
</script>

<style lang="scss">
@import 'src/assets/sass/variable';

.terms-dialog {
  .terms-checklist {
    .checkbox-content {
      white-space: pre-line;
      word-break: break-word;
      line-height: normal;
    }

    label {
      height: fit-content;
      margin-top: 1em;
    }
  }
}
</style>
