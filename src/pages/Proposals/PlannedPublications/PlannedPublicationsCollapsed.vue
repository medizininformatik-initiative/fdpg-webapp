<template>
  <el-card class="form-group form-group--collapsed">
    <h5 :class="{ 'invalid-form': !isValid }">
      {{ title }}
    </h5>
    <div class="form-group--collapsed__actions">
      <el-button v-if="!reviewMode" type="text" data-testId="handleRemovePublication" @click="handleRemove(index)">
        {{ $t('general.delete') }}
      </el-button>
      <el-button type="text" data-testId="handleEditPublication" @click="handleEdit(index)">
        {{ reviewMode ? $t('general.view') : $t('general.edit') }}
      </el-button>
    </div>
  </el-card>
</template>

<script setup lang="ts">
import type { IPublication } from '@/types/proposal.types'
import type { ValidateFieldsError } from 'async-validator'
import type { FormInstance } from 'element-plus'
import type { PropType } from 'vue'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  publicationForm: {
    type: Object as PropType<IPublication>,
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
  if (props.publicationForm.description && props.publicationForm.description.trim().length > 0) {
    return props.publicationForm.description
  } else {
    return t('proposal.publicationDescriptionUnknown')
  }
})

const isValid = computed(() => {
  let isValidForm = false
  props.formRef?.validateField(
    [
      `userProject.plannedPublication.publications[${props.index}].type`,
      `userProject.plannedPublication.publications[${props.index}].description`,
      `userProject.plannedPublication.publications[${props.index}].authors`,
    ],
    (_, invalidFields) => {
      isValidForm = checkIsFormValid(invalidFields)
    },
  )
  return isValidForm
})
</script>
