<template>
  <FdpgLabel required html-for="proposal.typeOfUse" size="medium" :class="{ 'invalid-form': !isValid }" />
  <el-card class="form-group">
    <FdpgFormItem prop="typeOfUse.usage">
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

    <div v-if="shouldDisplayDataPrivacyTextField" class="data-privacy-wrapper">
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

      <FdpgFormItem prop="typeOfUse.dataPrivacyExtra">
        <FdpgLabel html-for="proposal.dataPrivacyExtra" />
        <FdpgTextEditor
          v-model="typeOfUseForm.dataPrivacyExtra"
          data-testId="typeOfUseForm.dataPrivacyExtra"
          :placeholder="t('proposal.dataPrivacyExtraPlaceholder')"
          :disabled="reviewMode || typeOfUseForm.isDone"
        />
      </FdpgFormItem>
    </div>
  </el-card>

  <TaskViewer :object-id="typeOfUseForm._id" />
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
import type { FormInstance } from 'element-plus'
import type { PropType } from 'vue'
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import TypeOfUseDataPrivacyItem from './TypeOfUseDataPrivacyItem.vue'
import FdpgTextEditor from '@/components/FdpgTextEditor.vue'
import type { ValidateFieldsError } from 'async-validator'

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
  formRef: {
    type: Object as PropType<FormInstance>,
    required: false,
    default: () => undefined,
  },
})

const isInitialized = ref(false)

const shouldDisplayDataPrivacyTextField = computed(() => {
  if (!isInitialized.value) {
    return false
  }

  return (
    !!props.modelValue?.usage && props.modelValue?.usage?.length > 0 && !!configStore?.dataPrivacy?.[props.platform]
  )
})

watch(shouldDisplayDataPrivacyTextField, (newValue) => {
  if (!newValue && isInitialized.value) {
    typeOfUseForm.value.dataPrivacyExtra = undefined
  }
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

const { locale, t } = useI18n()
const { showErrorMessage } = useNotifications()
const configStore = useConfigStore()

const checkIsFormValid = (invalidFields?: ValidateFieldsError): boolean => {
  return Object.entries(invalidFields ?? {}).length === 0
}

const isValid = computed(() => {
  let isValidForm = false
  props.formRef?.validateField(['typeOfUse.usage', 'typeOfUse.dataPrivacyExtra'], (_, invalidFields) => {
    isValidForm = checkIsFormValid(invalidFields)
  })
  return isValidForm
})

// Watch for changes in the form values to trigger validation
watch(
  () => typeOfUseForm.value,
  () => {
    if (props.formRef) {
      props.formRef.validateField(['typeOfUse.usage', 'typeOfUse.dataPrivacyExtra'])
    }
  },
  { deep: true },
)

onMounted(async () => {
  if (!configStore.dataPrivacy[props.platform]) {
    try {
      await configStore.getDataPrivacy(props.platform)
    } catch (error) {
      showErrorMessage()
      console.log(error)
    }
  }

  isInitialized.value = true
})
</script>

<style lang="scss" scoped>
@use '@/assets/sass/variable' as *;

.data-privacy-wrapper {
  margin-top: 20px;
  padding: 15px;
  border-radius: 6px;
  background-color: $gray-100;
  border-style: solid;
  border-width: 1px;
  border-color: $gray-400;
}

.invalid-form {
  color: var(--el-color-danger);
}
</style>
