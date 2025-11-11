<template>
  <section class="main-message-wrapper">
    <MessageCenterItem
      :message="message"
      :type="type"
      :is-answer-mode="isAnswerMode"
      :possible-locations="possibleLocations"
      @toggle-answer-mode="toggleAnswerMode"
      @create-answer="handleAnswerCreate"
      @mark-as-done="handleCommentDone(message._id, !message.isDone)"
    />
    <MessageCenterAnswerCreator
      v-if="isAnswerMode"
      :message="message"
      :type="type"
      :possible-locations="possibleLocations"
      @toggle-answer-mode="toggleAnswerMode"
      @create-answer="handleAnswerCreate"
    />
    <template v-for="answer in message.answers" :key="answer._id">
      <MessageCenterItem
        v-if="!(answer.isDone && !showDoneComments)"
        :message="answer"
        :is-answer="true"
        :type="type"
        :possible-locations="possibleLocations"
        @mark-as-done="handleAnswerDone(message._id, answer._id, !answer.isDone)"
      />
    </template>
  </section>
</template>

<script setup lang="ts">
import useNotifications from '@/composables/use-notifications'
import { useCommentStore } from '@/stores/comment/comment.store'
import type { CommentType, ICommentDetail, ICreateAnswer } from '@/types/comment.interface'
import type { PropType } from 'vue'
import { ref } from 'vue'
import MessageCenterAnswerCreator from './MessageCenterAnswerCreator.vue'
import MessageCenterItem from './MessageCenterItem.vue'
import type { ILocation } from '@/types/location.types'

const props = defineProps({
  message: {
    type: Object as PropType<ICommentDetail>,
    required: true,
  },
  type: {
    type: String as PropType<
      | CommentType.PROPOSAL_MESSAGE_TO_OWNER
      | CommentType.PROPOSAL_MESSAGE_TO_LOCATION
      | CommentType.PROPOSAL_MESSAGE_TO_DMST
    >,
    required: true,
  },
  showDoneComments: {
    type: Boolean,
    required: true,
  },
  possibleLocations: {
    type: Array as PropType<ILocation[]>,
    required: true,
  },
})

const { showErrorMessage } = useNotifications()
const isAnswerMode = ref(false)

const toggleAnswerMode = (value: boolean) => {
  isAnswerMode.value = value
}

const commentStore = useCommentStore()

const handleAnswerCreate = async (answer: ICreateAnswer) => {
  try {
    await commentStore.createAnswer(props.message._id, answer)
    toggleAnswerMode(false)
  } catch (error) {
    showErrorMessage()
  }
}

const handleCommentDone = async (commentId: string, value: boolean) => {
  try {
    await commentStore.markCommentAsDone(commentId, value)
  } catch (error) {
    showErrorMessage()
  }
}
const handleAnswerDone = async (commentId: string, answerId: string, value: boolean) => {
  try {
    await commentStore.markAnswerAsDone(commentId, answerId, value)
  } catch (error) {
    showErrorMessage()
  }
}
</script>

<style lang="scss" scoped>
@use '@/assets/sass/variable' as *;

.main-message-wrapper {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  box-sizing: border-box;

  margin-bottom: 2rem;
}
</style>
