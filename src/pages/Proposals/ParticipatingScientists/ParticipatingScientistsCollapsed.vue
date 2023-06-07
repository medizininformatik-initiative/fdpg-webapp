<template>
  <div class="form-group-wrapper form-group-wrapper--collapsed">
    <h6 :class="{ 'invalid-form': !isValid }">
      {{ title }}
    </h6>
    <div class="form-group-wrapper--collapsed__actions">
      <el-button v-if="!reviewMode" type="text" @click="handleRemoveParticipant(index)">
        {{ $t('general.delete') }}
      </el-button>
      <el-button type="text" @click="handleEditParticipant(index)">
        {{ reviewMode ? $t('general.view') : $t('general.edit') }}
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { IParticipant } from '@/types/proposal.types'
import { transformParticipants } from '@/utils/form-transform/participant-applicant-transform.util'
import type { ValidateFieldsError } from 'async-validator'
import type { FormInstance } from 'element-plus'
import { computed, onMounted, ref, type PropType } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  participantForm: {
    type: Object as PropType<IParticipant>,
    required: false,
    default: () => transformParticipants(),
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

  reviewMode: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['edit', 'remove'])

const handleEditParticipant = (idx: number) => {
  emit('edit', idx)
}

const handleRemoveParticipant = async (idx: number) => {
  emit('remove', idx)
}

const { t } = useI18n()
const title = computed(() => {
  const firstName = props.participantForm.researcher.firstName ?? ''
  const lastName = props.participantForm.researcher.lastName ?? ''

  const fullName = (firstName + lastName).trim()
  if (fullName.length > 0) {
    return `${firstName} ${lastName}`
  } else {
    return t('proposal.researcherNameUnknown')
  }
})

const checkIsFormValid = (invalidFields?: ValidateFieldsError): boolean => {
  return Object.entries(invalidFields ?? {}).length === 0
}

const isValid = ref(false)
onMounted(() => {
  props.formRef?.validateField(
    [
      `participants.${props.index}.researcher.firstName`,
      `participants.${props.index}.researcher.lastName`,
      `participants.${props.index}.researcher.email`,
      `participants.${props.index}.institute.name`,
      `participants.${props.index}.institute.streetAddress`,
      `participants.${props.index}.institute.houseNumber`,
      `participants.${props.index}.institute.postalCode`,
      `participants.${props.index}.institute.city`,
      `participants.${props.index}.institute.country`,
      `participants.${props.index}.institute.email`,
      `participants.${props.index}.participantCategory.category`,
    ],
    (_, invalidFields) => {
      isValid.value = checkIsFormValid(invalidFields)
    },
  )
})
</script>
