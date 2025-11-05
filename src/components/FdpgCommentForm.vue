<template>
  <FdpgTextEditor
    v-model="comment"
    ref="inputRef"
    :placeholder="t('proposal.leaveAComment')"
    v-if="!reviewMode"
  ></FdpgTextEditor>
  <section role="region" class="action-row">
    <div class="comment-field-actions" v-if="!reviewMode">
      <el-button
        type="primary"
        class="edit-button"
        :disabled="!comment || comment.trim().length < 2 || isDisabled"
        @click="handleSubmit"
      >
        <template v-if="edit">
          {{ t('general.save') }}
        </template>
        <template v-else>
          {{ t('general.create') }}
        </template>
      </el-button>
      <el-button type="primary" class="cancel-button" plain @click="handleCancel">{{ t('general.cancel') }}</el-button>
    </div>
    <LocationSelect
      v-if="isMessageToLocation"
      style="width: 580px"
      v-model="locationSelection"
      :placeholder="visibility.value || ''"
      :minimum-selection="minimumSelection"
      :all-locations="possibleLocations"
    />
  </section>
</template>

<script setup lang="ts">
import FdpgTextEditor from '@/components/FdpgTextEditor.vue'
import { useVModel } from '@vueuse/core'
import LocationSelect from '@/components/LocationSelect.vue'
import { useAuthStore } from '@/stores/auth/auth.store'
import { Role } from '@/types/oidc.types'
import type { PropType } from 'vue'
import { computed, ref } from 'vue'
import type { IVisibilityMessage } from '@/composables/use-location-visibility'
import useLocationVisibility from '@/composables/use-location-visibility'
import { CommentType } from '@/types/comment.interface'
import type { ILocation } from '@/types/location.types'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  modelValue: {
    type: String,
    required: true,
  },
  edit: {
    type: Boolean,
    default: false,
    required: false,
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
  reviewMode: {
    type: Boolean,
    default: false,
    required: false,
  },
  possibleLocations: {
    type: Array as PropType<ILocation[]>,
    required: true,
    default: [],
  },
})

const { t } = useI18n()

const authStore = useAuthStore()
const isMessageToLocation = computed(() => {
  const answerIsFromFdpg = authStore.hasFdpgLevelPermissions()
  const isMessageToLocation = props.type === CommentType.PROPOSAL_MESSAGE_TO_LOCATION
  return isMessageToLocation && answerIsFromFdpg
})
const locationSelection = ref<string[]>([])
const minimumSelection: string[] = []

const visibilityMessage = computed<IVisibilityMessage>(() => {
  return {
    owner: { role: authStore.singleKnownRole as Role, miiLocation: authStore.profile?.MII_LOCATION },
    locations: locationSelection.value,
  }
})

const visibility = computed(
  () => useLocationVisibility(visibilityMessage, props.type, false, props.possibleLocations)?.visibility,
)

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
  margin-bottom: 2rem;
  display: flex;
  justify-content: space-between;
}
.comment-field-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}
</style>
