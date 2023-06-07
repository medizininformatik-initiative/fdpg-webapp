<template>
  <section class="answer-creator">
    <FdpgInput
      ref="inputRef"
      v-model="answerContent"
      placeholder="proposal.leaveAComment"
      :size="FdpgInputSize.Small"
      type="textarea"
      :rows="2"
      autosize
    />

    <section role="region" class="action-row">
      <div class="comment-field-actions">
        <el-button type="primary" :disabled="!answerContent || answerContent.trim().length < 5" @click="handleSubmit">
          <template v-if="edit">
            {{ $t('general.save') }}
          </template>
          <template v-else>
            {{ $t('general.create') }}
          </template>
        </el-button>
        <el-button type="primary" plain @click="toggleAnswerMode(false)">{{ $t('general.cancel') }}</el-button>
      </div>

      <LocationSelect
        v-if="isAnswerToLocation"
        v-model="locationSelection"
        :placeholder="visibility || ''"
        :minimum-selection="minimumSelection"
      />
    </section>
  </section>
</template>

<script setup lang="ts">
import FdpgInput from '@/components/FdpgInput.vue'
import type { IVisibilityMessage } from '@/composables/use-location-visibility';
import useLocationVisibility from '@/composables/use-location-visibility'
import { useAuthStore } from '@/stores/auth/auth.store'
import type { CommentType, ICommentDetail, ICreateAnswer } from '@/types/comment.interface'
import { FdpgInputSize } from '@/types/component.types'
import { MiiLocation } from '@/types/location.enum'
import { Role } from '@/types/oidc.types'
import type { PropType} from 'vue';
import { computed, onMounted, ref } from 'vue'
import LocationSelect from './LocationSelect.vue'

const props = defineProps({
  message: {
    type: Object as PropType<ICommentDetail>,
    required: true,
  },
  type: {
    type: String as PropType<CommentType.PROPOSAL_MESSAGE_TO_OWNER | CommentType.PROPOSAL_MESSAGE_TO_LOCATION>,
    required: true,
  },
  edit: {
    type: Boolean,
    default: false,
  },
})

const authStore = useAuthStore()
const locationSelection = ref<MiiLocation[]>([])
const answerContent = ref<string>()
const inputRef = ref()

const emit = defineEmits(['toggleAnswerMode', 'createAnswer'])

const toggleAnswerMode = (value: boolean) => {
  emit('toggleAnswerMode', value)
}

const handleSubmit = () => {
  if (answerContent.value && answerContent.value.trim().length >= 5) {
    const answer: ICreateAnswer = {
      content: answerContent.value,
      locations: locationSelection.value,
    }

    emit('createAnswer', answer)
  }
}

const isAnswerToLocation = computed(() => {
  const ownerIsLocation = props.message.owner.role === Role.DizMember || props.message.owner.role === Role.UacMember
  const answerIsFromFdpg = authStore.singleKnownRole === Role.FdpgMember
  return ownerIsLocation && answerIsFromFdpg
})

const minimumSelection = computed(() => {
  if (isAnswerToLocation.value === true) {
    return props.message.owner.miiLocation ? [props.message.owner.miiLocation] : [MiiLocation.VirtualAll]
  } else {
    return []
  }
})

const visibilityMessage = computed<IVisibilityMessage>(() => {
  return {
    owner: { role: authStore.singleKnownRole as Role, miiLocation: authStore.profile?.MII_LOCATION },
    locations: locationSelection.value,
  }
})

const { visibility } = useLocationVisibility(visibilityMessage, props.type, false)

onMounted(() => {
  if (inputRef.value && inputRef.value.inputRef?.input) {
    inputRef.value.inputRef.input.focus()
  }

  if (isAnswerToLocation.value === true) {
    locationSelection.value = props.message.owner.miiLocation
      ? [props.message.owner.miiLocation]
      : [MiiLocation.VirtualAll]
  }
})
</script>

<style lang="scss" scoped>
@import 'src/assets/sass/variable';

.answer-creator {
  box-sizing: border-box;
  width: 100%;
  padding: 1rem 0 1.5rem 2rem;

  .action-row {
    margin-top: 0.5rem;
    display: flex;
    justify-content: space-between;
  }
}
</style>
