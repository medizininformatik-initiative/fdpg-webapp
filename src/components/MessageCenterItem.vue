<template>
  <section
    class="message"
    :class="[{ 'message-answer': isAnswer }, { 'answer-mode': isAnswerMode }, { 'is-done': message.isDone }]"
  >
    <div class="message-header">
      <span class="message-owner">{{ ownerText }}</span>
      <span class="message-date">{{
        new Date(message.createdAt).toLocaleDateString(undefined, {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
        })
      }}</span>
      <template v-if="visibility">
        <el-popover placement="top-start" :disabled="locations.length <= 1" width="fit-content" trigger="hover">
          <template #reference>
            <div>
              <i class="bi bi-lock-fill" aria-hidden="true" /> <span class="message-visibility">{{ visibility }}</span>
            </div>
          </template>
          <ul v-for="(location, locationIdx) in locations" :key="locationIdx">
            <li>{{ location }}</li>
          </ul>
        </el-popover>
      </template>
    </div>

    <div class="message-content">{{ message.content }}</div>

    <section v-if="couldAnswer || authStore.singleKnownRole === Role.FdpgMember" role="region">
      <el-button v-if="couldAnswer" type="text" :disabled="isAnswerMode" @click="toggleAnswerMode(true)">
        {{ $t('proposal.answerComment') }}
      </el-button>
      <el-button
        v-if="authStore.singleKnownRole === Role.FdpgMember"
        type="text"
        :disabled="isAnswerMode"
        @click="markAsDone"
      >
        {{ message.isDone ? $t('proposal.markAsOpen') : $t('proposal.markAsDone') }}
      </el-button>
    </section>
  </section>
</template>

<script setup lang="ts">
import useLocationVisibility from '@/composables/use-location-visibility'
import { MII_LOCATIONS } from '@/constants'
import { useAuthStore } from '@/stores/auth/auth.store'
import type { CommentType, IAnswerDetail, ICommentDetail } from '@/types/comment.interface'
import { Role } from '@/types/oidc.types'
import type { PropType } from 'vue';
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  message: {
    type: Object as PropType<ICommentDetail | IAnswerDetail>,
    required: true,
  },
  isAnswer: {
    type: Boolean,
    default: false,
  },
  isAnswerMode: {
    type: Boolean,
    default: false,
  },
  type: {
    type: String as PropType<CommentType.PROPOSAL_MESSAGE_TO_OWNER | CommentType.PROPOSAL_MESSAGE_TO_LOCATION>,
    required: true,
  },
})

const emit = defineEmits(['toggleAnswerMode', 'createAnswer', 'markAsDone'])

const toggleAnswerMode = (value: boolean) => {
  emit('toggleAnswerMode', value)
}

const markAsDone = () => {
  emit('markAsDone')
}

const { t } = useI18n()
const ownerText = computed(() => {
  if (props.message.owner.miiLocation) {
    const role = t(`roles.${props.message.owner.role}`)
    const location = MII_LOCATIONS[props.message.owner.miiLocation].display
    return `${role}, ${location}`
  } else {
    return t(`roles.${props.message.owner.role}`)
  }
})

const computedMessage = computed(() => props.message)
const { visibility } = useLocationVisibility(computedMessage, props.type, true)
const locations = computed(() => {
  return computedMessage.value.locations?.map((location) => MII_LOCATIONS[location].display) ?? []
})

const authStore = useAuthStore()
const couldAnswer = computed(() => {
  const isSameRole = props.message.owner.role === authStore.singleKnownRole
  const isSameLocation =
    props.message.owner.miiLocation &&
    authStore.profile?.MII_LOCATION &&
    props.message.owner.miiLocation === authStore.profile?.MII_LOCATION
  return !props.isAnswer && !isSameRole && !isSameLocation
})
</script>

<style lang="scss" scoped>
@import 'src/assets/sass/variable';

.message {
  border: 1px solid $gray-700;
  border-radius: 5px;
  padding: 1rem 2rem 0 2rem;

  box-sizing: border-box;
  width: 100%;

  &.answer-mode {
    background: lighten($blue, 40%);
  }

  &.message-answer {
    width: calc(100% - 2rem);
    margin-top: 1rem;
  }

  .message-content {
    white-space: pre-line;
  }

  .message-content:last-child {
    margin-bottom: 1rem;
  }

  &.is-done {
    .message-content {
      color: $gray-700;
    }
    .message-header {
      color: $gray-700;

      .message-owner {
        color: $gray-700;
      }
    }
  }

  .message-header {
    display: flex;
    gap: 0.8rem;
    margin-bottom: 0.5rem;
    color: $gray-800;

    .message-owner {
      font-weight: 600;
      color: $gray-900;
    }
  }
}
</style>
