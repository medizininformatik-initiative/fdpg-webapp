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

    <div class="message-content ql-editor" v-html="message.content"></div>

    <section v-if="couldAnswer || hasFdpgLevelPermissions" role="region">
      <el-button v-if="couldAnswer" link :disabled="isAnswerMode" @click="toggleAnswerMode(true)">
        {{ t('proposal.answerComment') }}
      </el-button>
      <el-button
        v-if="hasFdpgLevelPermissions"
        class="button__mark-as-done"
        :class="[{ 'is-done': message.isDone }]"
        link
        :disabled="isAnswerMode"
        @click="markAsDone"
      >
        {{ message.isDone ? t('proposal.markAsOpen') : t('proposal.markAsDone') }}
      </el-button>
    </section>
  </section>
</template>

<script setup lang="ts">
import useLocationVisibility from '@/composables/use-location-visibility'
import { useAuthStore } from '@/stores/auth/auth.store'
import { useLocationStore } from '@/stores/locations/location.store'
import type { CommentType, IAnswerDetail, ICommentDetail } from '@/types/comment.interface'
import type { ILocation } from '@/types/location.types'
import type { PropType, Ref } from 'vue'
import { computed, onMounted, ref } from 'vue'
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
  possibleLocations: {
    type: Array as PropType<ILocation[]>,
    required: true,
    default: [],
  },
})

const hasFdpgLevelPermissions = computed(() => authStore.hasFdpgLevelPermissions())

const emit = defineEmits(['toggleAnswerMode', 'createAnswer', 'markAsDone'])

const toggleAnswerMode = (value: boolean) => {
  emit('toggleAnswerMode', value)
}

const markAsDone = () => {
  emit('markAsDone')
}

const locationStore = useLocationStore()
const locationLookUpMapRef: Ref<Record<string, ILocation>> = ref({})

const { t } = useI18n()
const ownerText = computed(() => {
  if (props.message.owner.miiLocation) {
    const role = t(`roles.${props.message.owner.role}`)
    const location = locationLookUpMapRef.value[props.message.owner.miiLocation]?.display
    return `${role}, ${location}`
  } else {
    return t(`roles.${props.message.owner.role}`)
  }
})

const computedMessage = computed(() => props.message)
const visibility = computed(
  () => useLocationVisibility(computedMessage, props.type, true, props.possibleLocations)?.visibility,
)
const locations = computed(() => {
  return computedMessage.value.locations?.map((location) => locationLookUpMapRef.value[location]?.display) ?? []
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

onMounted(async () => {
  const lm = await locationStore.getLocationLookupMap()
  locationLookUpMapRef.value = lm
})
</script>

<style lang="scss" scoped>
@use '@/assets/sass/variable' as *;
@use 'sass:color';

.message {
  border: 1px solid $blue;
  background-color: $blue;
  color: $white;
  border-radius: 5px;
  padding: 1rem 2rem 0 2rem;

  box-sizing: border-box;
  width: 100%;

  .button__mark-as-done {
    color: white;
  }

  &.answer-mode {
    background: color.adjust($blue, $lightness: 40%);
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
    border: 1px solid $gray-700;
    background-color: $white;
    color: $gray-900;

    .message-header {
      color: $gray-700;

      .message-owner {
        color: $gray-900;
      }
    }

    .button__mark-as-done {
      color: $gray-900;
    }
  }

  .message-header {
    display: flex;
    gap: 0.8rem;
    margin-bottom: 0.5rem;
    color: $white;

    .message-owner {
      font-weight: 600;
      color: $white;
    }
  }
}
</style>
