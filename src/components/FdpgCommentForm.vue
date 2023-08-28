<template>
  <FdpgInput
    ref="inputRef"
    v-model="comment"
    placeholder="proposal.leaveAComment"
    :size="FdpgInputSize.Small"
    type="textarea"
    :rows="2"
    autosize
  />

  <section role="region" class="action-row">
    <div class="comment-field-actions">
      <el-button type="primary" class="edit-button" :disabled="!comment || comment.trim().length < 2 || isDisabled" @click="handleSubmit">
        <template v-if="edit">
          {{ $t('general.save') }}
        </template>
        <template v-else>
          {{ $t('general.create') }}
        </template>
      </el-button>
      <el-button type="primary" class="cancel-button" plain @click="handleCancel">{{ $t('general.cancel') }}</el-button>
    </div>
    <LocationSelect
      v-if="isMessageToLocation"
      v-model="locationSelection"
      :placeholder="visibility || ''"
      :minimum-selection="minimumSelection"
    />
  </section>
</template>

<script setup lang="ts">
import FdpgInput from '@/components/FdpgInput.vue'
import { FdpgInputSize } from '@/types/component.types'
import { useVModel } from '@vueuse/core'
import LocationSelect from './LocationSelect.vue'
import { useAuthStore } from '@/stores/auth/auth.store'
import { Role } from '@/types/oidc.types'
import { MiiLocation } from '@/types/location.enum'
import type { PropType } from 'vue'
import { computed, ref } from 'vue'
import type { IVisibilityMessage } from '@/composables/use-location-visibility'
import useLocationVisibility from '@/composables/use-location-visibility'
import { CommentType } from '@/types/comment.interface'

const props = defineProps({
  modelValue: {
    type: String,
    required: true,
  },
  edit: {
    type: Boolean,
    default: false,
  },
  type: {
    type: String as PropType<CommentType>,
    required: true,
  },
  isDisabled: {
    type: Boolean,
    default: false,
    required: false,
  },
})

const authStore = useAuthStore()
const isMessageToLocation = computed(() => {
  const answerIsFromFdpg = authStore.singleKnownRole === Role.FdpgMember
  const isMessageToLocation = props.type === CommentType.PROPOSAL_MESSAGE_TO_LOCATION
  return isMessageToLocation && answerIsFromFdpg
})
const locationSelection = ref<MiiLocation[]>([MiiLocation.VirtualAll])
const minimumSelection = [MiiLocation.VirtualAll]

const visibilityMessage = computed<IVisibilityMessage>(() => {
  return {
    owner: { role: authStore.singleKnownRole as Role, miiLocation: authStore.profile?.MII_LOCATION },
    locations: locationSelection.value,
  }
})

const { visibility } = useLocationVisibility(visibilityMessage, props.type, false)

const emit = defineEmits(['close', 'save', 'update:modelValue'])
const comment = useVModel(props, 'modelValue', emit)

const handleSubmit = () => {
  emit('save', comment.value, locationSelection.value)
  setInputFocus()
}

const handleCancel = () => {
  emit('close')
  setInputFocus()
}

const inputRef = ref()

defineExpose({
  inputRef,
})

const setInputFocus = () => {
  if (inputRef.value?.inputRef) {
    inputRef.value.inputRef.focus()
  }
}
</script>

<style lang="scss" scoped>
.action-row {
  margin-top: 0.5rem;
  display: flex;
  justify-content: space-between;
}
.comment-field-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}
</style>
