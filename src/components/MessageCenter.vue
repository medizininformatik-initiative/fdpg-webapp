<template>
  <section class="section message-center">
    <div class="header-row">
      <h2>{{ t(titleForType) }}</h2>
      <el-switch
        v-model="showDoneComments"
        class="switch fdpg-switch"
        :inactive-text="t('proposal.showDoneComments')"
      />
    </div>

    <section class="messages">
      <template v-for="(message, index) in messagesForType" :key="message._id">
        <MessageCenterMainMessage
          :message="message"
          :type="type"
          :show-done-comments="showDoneComments"
          :possible-locations="possibleLocations"
        />
        <template v-if="index === firstOpenIndex">
          <FdpgCommentForm
            v-model="commentContent"
            :edit="false"
            :type="type"
            :possible-locations="possibleLocations"
            @close="handleCancelClick"
            @save="handleSubmit"
            :reviewMode="reviewMode"
          />
        </template>
      </template>

      <template v-if="firstOpenIndex === -1">
        <FdpgCommentForm
          v-model="commentContent"
          :edit="false"
          :type="type"
          :possible-locations="possibleLocations"
          @close="handleCancelClick"
          @save="handleSubmit"
          :reviewMode="reviewMode"
        />
      </template>
    </section>
  </section>
</template>

<script setup lang="ts">
import useNotifications from '@/composables/use-notifications'
import type { TranslationSchema } from '@/plugins/i18n'
import { useAuthStore } from '@/stores/auth/auth.store'
import { useCommentStore } from '@/stores/comment/comment.store'
import type { IComment, ICommentCreateProps, ICommentDetail } from '@/types/comment.interface'
import { CommentType } from '@/types/comment.interface'
import type { PropType } from 'vue'
import { computed, onBeforeMount, ref } from 'vue'
import { useRoute } from 'vue-router'
import FdpgCommentForm from './FdpgCommentForm.vue'
import MessageCenterMainMessage from './MessageCenterMainMessage.vue'
import { useI18n } from 'vue-i18n'
import type { ILocation } from '@/types/location.types'

const props = defineProps({
  type: {
    type: String as PropType<
      | CommentType.PROPOSAL_MESSAGE_TO_OWNER
      | CommentType.PROPOSAL_MESSAGE_TO_LOCATION
      | CommentType.PROPOSAL_MESSAGE_TO_DMST
    >,
    required: true,
  },
  reviewMode: {
    type: Boolean,
    default: false,
  },
  possibleLocations: {
    type: Array as PropType<ILocation[]>,
    required: true,
  },
})

const authStore = useAuthStore()
const commentStore = useCommentStore()
const { params } = useRoute()
const { t } = useI18n()
const proposalId = params.id as string

const showDoneCommentsValue = ref(localStorage.getItem(`showDoneComments_${proposalId}_${props.type}`) === 'true')

const showDoneComments = computed({
  get: () => showDoneCommentsValue.value,
  set: (value: boolean) => {
    showDoneCommentsValue.value = value
    localStorage.setItem(`showDoneComments_${proposalId}_${props.type}`, value.toString())
  },
})

const titleForType = computed<TranslationSchema>(() => {
  if (props.type === CommentType.PROPOSAL_MESSAGE_TO_OWNER) {
    return authStore.hasFdpgLevelPermissions() ? 'proposal.messagesToApplicants' : 'proposal.messagesToFdpg'
  } else if (props.type === CommentType.PROPOSAL_MESSAGE_TO_DMST) {
    return authStore.hasFdpgLevelPermissions() ? 'proposal.messagesToDms' : 'proposal.messagesToFdpg'
  } else {
    return authStore.hasFdpgLevelPermissions() ? 'proposal.messagesToLocations' : 'proposal.messagesToFdpg'
  }
})

const messagesForType = computed<ICommentDetail[]>(() => {
  return commentStore.comments
    .filter((comment) => {
      const isOfType = comment.type === props.type
      if (showDoneComments.value) {
        return isOfType
      } else {
        const hasUndoneAnswer = comment.answers.some((answer) => !answer.isDone)
        return isOfType && (hasUndoneAnswer || !comment.isDone)
      }
    })
    .sort((a, b) => {
      return (
        (b.answers.length ? +new Date(b.answers[b.answers.length - 1].createdAt) : +new Date(b.createdAt)) -
        (a.answers.length ? +new Date(a.answers[a.answers.length - 1].createdAt) : +new Date(a.createdAt))
      )
    })
})

const firstOpenIndex = computed<number>(() => {
  for (let i = messagesForType.value.length - 1; i >= 0; i--) {
    const comment = messagesForType.value[i]
    const hasUndoneAnswer = comment.answers.some((answer) => !answer.isDone)
    const isOpen = hasUndoneAnswer || !comment.isDone
    if (isOpen) return i
  }
  return -1
})

const { showErrorMessage } = useNotifications()
const commentContent = ref('')

const handleCancelClick = () => {
  commentContent.value = ''
}
const handleSubmit = async (content: string, locations: string[]) => {
  const createProps: ICommentCreateProps = {
    proposalId,
    objectId: proposalId,
  }
  const commentPayload: IComment = {
    content: content,
    type: props.type,
    locations: props.type === CommentType.PROPOSAL_MESSAGE_TO_LOCATION ? locations : [],
  }

  try {
    await commentStore.createComment(createProps, commentPayload)

    commentContent.value = ''
  } catch (error) {
    showErrorMessage(t('general.failedSubmit'))
  }
}
onBeforeMount(async () => {
  await commentStore.fetchAll({ proposalId })
})
</script>

<style lang="scss" scoped>
@use '@/assets/sass/variable' as *;

.header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  .switch {
    &:focus-within {
      outline: $blue auto 1px;
      outline-offset: 3px;
    }
  }
}
</style>
