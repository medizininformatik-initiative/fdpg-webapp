<template>
  <el-card class="form-group form-group--collapsed">
    <h5 :class="{ 'invalid-form': !isValid }">
      {{ title }}
    </h5>
    <div class="form-group--collapsed__actions">
      <el-button v-if="!reviewMode" type="text" data-testId="handleRemoveBiosample" @click="handleRemove(index)">
        {{ $t('general.delete') }}
      </el-button>
      <el-button type="text" data-testId="handleEditBiosample" @click="handleEdit(index)">
        {{ reviewMode ? $t('general.view') : $t('general.edit') }}
      </el-button>
    </div>
  </el-card>
</template>

<script setup lang="ts">
import type { IBiosample } from '@/types/proposal.types'
import type { ValidateFieldsError } from 'async-validator'
import type { FormInstance } from 'element-plus'
import type { PropType } from 'vue'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  biosampleForm: {
    type: Object as PropType<IBiosample>,
    required: true,
  },

  reviewMode: {
    type: Boolean,
    default: false,
  },

  formRef: {
    type: Object as PropType<FormInstance>,
    required: false,
    default: () => undefined,
  },

  index: {
    type: Number,
    required: true,
  },
})

const emit = defineEmits(['edit', 'remove'])

const handleEdit = (idx: number) => {
  emit('edit', idx)
}

const handleRemove = async (idx: number) => {
  emit('remove', idx)
}

const checkIsFormValid = (invalidFields?: ValidateFieldsError): boolean => {
  return Object.entries(invalidFields ?? {}).length === 0
}

const { t } = useI18n()
const title = computed(() => {
  if (props.biosampleForm.type && props.biosampleForm.type.trim().length > 0) {
    return props.biosampleForm.type
  } else {
    return t('proposal.biosampleTitleUnknown')
  }
})

const isValid = computed(() => {
  let isValidForm = false
  props.formRef?.validateField(
    [
      `userProject.informationOnRequestedBioSamples.biosamples[${props.index}].type`,
      `userProject.informationOnRequestedBioSamples.biosamples[${props.index}].count`,
      `userProject.informationOnRequestedBioSamples.biosamples[${props.index}].parameter`,
      `userProject.informationOnRequestedBioSamples.biosamples[${props.index}].laboratoryResources`,
      `userProject.informationOnRequestedBioSamples.biosamples[${props.index}].requirements`,
    ],
    (_, invalidFields) => {
      isValidForm = checkIsFormValid(invalidFields)
    },
  )
  return isValidForm
})
</script>
