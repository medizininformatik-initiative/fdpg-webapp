<template>
  <section class="section message-center">
    <div class="header-row">
      <h2>{{ $t(titleForType) }}</h2>
      <el-switch v-model="showDoneComments" class="switch" :inactive-text="$t('proposal.showDoneComments')" />
    </div>

    <section class="messages">
      <MessageCenterMainMessage
        v-for="message in messagesForType"
        :key="message._id"
        :message="message"
        :type="type"
        :show-done-comments="showDoneComments"
      />
    </section>

    <FdpgCommentForm
      v-model="commentContent"
      :edit="false"
      :type="type"
      @close="handleCancelClick"
      @save="handleSubmit"
    />
  </section>
</template>

<script setup lang="ts">
import useNotifications from '@/composables/use-notifications'
import type { TranslationSchema } from '@/plugins/i18n'
import { useAuthStore } from '@/stores/auth/auth.store'
import { useCommentStore } from '@/stores/comment/comment.store'
import type { IComment, ICommentCreateProps, ICommentDetail } from '@/types/comment.interface'
import { CommentType } from '@/types/comment.interface'
import type { MiiLocation } from '@/types/location.enum'
import { Role } from '@/types/oidc.types'
import type { PropType } from 'vue'
import { computed, onBeforeMount, ref } from 'vue'
import { useRoute } from 'vue-router'
import FdpgCommentForm from './FdpgCommentForm.vue'
import MessageCenterMainMessage from './MessageCenterMainMessage.vue'

const props = defineProps({
  type: {
    type: String as PropType<CommentType.PROPOSAL_MESSAGE_TO_OWNER | CommentType.PROPOSAL_MESSAGE_TO_LOCATION>,
    required: true,
  },
})

const authStore = useAuthStore()
const commentStore = useCommentStore()
const { params } = useRoute()
const proposalId = params.id as string

const showDoneComments = ref(true)

const titleForType = computed<TranslationSchema>(() => {
  if (props.type === CommentType.PROPOSAL_MESSAGE_TO_OWNER) {
    return authStore.singleKnownRole === Role.FdpgMember ? 'proposal.messagesToApplicants' : 'proposal.messagesToFdpg'
  } else {
    return authStore.singleKnownRole === Role.FdpgMember ? 'proposal.messagesToLocations' : 'proposal.messagesToFdpg'
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
const { showErrorMessage } = useNotifications()
const commentContent = ref('')

const handleCancelClick = () => {
  commentContent.value = ''
}
const handleSubmit = async (content: string, locations: MiiLocation[]) => {
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
    showErrorMessage()
  }
}
onBeforeMount(async () => {
  await commentStore.fetchAll({ proposalId })
})
</script>

<style lang="scss" scoped>
@import 'src/assets/sass/variable';

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
