<template>
  <FdpgLabel required html-for="proposal.typeOfUse" size="medium" />
  <el-card class="form-group">
    <FdpgFormItem prop="userProject.typeOfUse.usage">
      <el-checkbox-group
        v-model="typeOfUseForm.usage"
        data-testId="typeOfUseForm.usage"
        :disabled="reviewMode || typeOfUseForm.isDone"
      >
        <FdpgCheckbox
          v-for="option in options"
          :key="`checklist-option-${option.value}`"
          :value="option.value"
          :label="'proposal.typeOfUse_' + option.value"
          :info="option.info"
          test-id-extension="__typeOfUseForm.usage"
        />
      </el-checkbox-group>
    </FdpgFormItem>

    <div
      v-if="modelValue.usage && modelValue.usage.length > 0 && configStore.dataPrivacy[props.platform]"
      class="data-privacy-wrapper"
    >
      <FdpgLabel html-for="proposal.typeOfUse_dataPrivacy" />
      <dl>
        <TypeOfUseDataPrivacyItem
          v-for="usage in modelValue.usage"
          :key="usage"
          class="privacy-note"
          :text="configStore.dataPrivacy[props.platform]?.messages[usage].text[locale]"
          :headline="configStore.dataPrivacy[props.platform]?.messages[usage].headline[locale]"
        />
      </dl>

      <FdpgFormItem prop="userProject.typeOfUse.dataPrivacyExtra">
        <FdpgLabel html-for="proposal.dataPrivacyExtra" />
        <FdpgInput
          v-model="typeOfUseForm.dataPrivacyExtra"
          data-testId="typeOfUseForm.dataPrivacyExtra"
          placeholder="proposal.dataPrivacyExtraPlaceholder"
          :disabled="reviewMode || typeOfUseForm.isDone"
          type="textarea"
          :rows="2"
          autosize
        />
      </FdpgFormItem>
    </div>
  </el-card>
</template>

<script setup lang="ts">
import FdpgCheckbox from '@/components/FdpgCheckbox.vue'
import FdpgFormItem from '@/components/FdpgFormItem.vue'
import FdpgLabel from '@/components/FdpgLabel.vue'
import useNotifications from '@/composables/use-notifications'
import type { TranslationSchema } from '@/plugins/i18n'
import { useConfigStore } from '@/stores/config/config.store'
import type { PlatformIdentifier } from '@/types/platform-identifier.enum'
import type { ITypeOfUse } from '@/types/proposal.types'
import { ProposalTypeOfUse } from '@/types/proposal.types'
import { useVModel } from '@vueuse/core'
import type { PropType } from 'vue'
import { onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import TypeOfUseDataPrivacyItem from './TypeOfUseDataPrivacyItem.vue'
import FdpgInput from '@/components/FdpgInput.vue'

const props = defineProps({
  modelValue: {
    type: Object as PropType<ITypeOfUse>,
    required: true,
  },
  reviewMode: {
    type: Boolean,
    default: false,
  },
  platform: {
    type: String as PropType<PlatformIdentifier>,
    required: true,
  },
})

const options = Object.keys(ProposalTypeOfUse).map(function (option) {
  return {
    value: ProposalTypeOfUse[option as keyof typeof ProposalTypeOfUse],
    info: ('proposal.typeOfUse_' +
      ProposalTypeOfUse[option as keyof typeof ProposalTypeOfUse] +
      '_Info') as TranslationSchema,
  }
})

const emit = defineEmits(['update:modelValue'])

const typeOfUseForm = useVModel(props, 'modelValue', emit)

const { locale } = useI18n()
const { showErrorMessage } = useNotifications()
const configStore = useConfigStore()
onMounted(async () => {
  if (!configStore.dataPrivacy[props.platform]) {
    try {
      await configStore.getDataPrivacy(props.platform)
    } catch (error) {
      showErrorMessage()
      console.log(error)
    }
  }
})
</script>
<style lang="scss" scoped>
@import 'src/assets/sass/variable';

.data-privacy-wrapper {
  margin-top: 20px;
  padding: 15px;
  border-radius: 6px;
  background-color: $gray-100;
  border-style: solid;
  border-width: 1px;
  border-color: $gray-400;
}
</style>
