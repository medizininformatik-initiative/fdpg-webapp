<template>
  <section v-if="objectId && authStore.singleKnownRole === Role.Researcher" class="task-viewer">
    <section v-if="tasks.old.length" class="task-viewer__section task-viewer__section--old">
      <OldTask v-for="(task, idx) in tasks.old" :key="'old-task' + idx" :task="task" />
    </section>

    <section v-if="tasks.current.length" class="task-viewer__section">
      <CurrentTask v-for="(task, idx) in tasks.current" :key="'old-task' + idx" :task="task" />
    </section>
  </section>
</template>

<script setup lang="ts">
import { useAuthStore } from '@/stores/auth/auth.store'
import { useCommentStore } from '@/stores/comment/comment.store'
import { useProposalStore } from '@/stores/proposal/proposal.store'
import type { ICommentDetail } from '@/types/comment.interface';
import { CommentType } from '@/types/comment.interface'
import { Role } from '@/types/oidc.types'
import { computed } from 'vue'
import CurrentTask from './CurrentTask/CurrentTask.vue'
import OldTask from './OldTask/OldTask.vue'

const props = defineProps({
  objectId: {
    type: String,
    default: undefined,
  },
})

const commentStore = useCommentStore()
const proposalStore = useProposalStore()
const authStore = useAuthStore()

const tasks = computed(() => {
  const proposalMayorVersion = proposalStore.currentProposal?.version?.mayor ?? 0
  if (props.objectId && commentStore.commentsObj[props.objectId]) {
    return commentStore.commentsObj[props.objectId].reduce(
      (acc, comment) => {
        const commentMayor = comment.versionOfItem?.mayor ?? 0
        if (comment.type === CommentType.PROPOSAL_TASK) {
          if (commentMayor >= proposalMayorVersion || !comment.isDone) {
            acc.current.push(comment)
          } else {
            acc.old.push(comment)
          }
        }
        return acc
      },
      { current: [] as ICommentDetail[], old: [] as ICommentDetail[] },
    )
  } else {
    return { current: [] as ICommentDetail[], old: [] as ICommentDetail[] }
  }
})
</script>

<style lang="scss" scoped>
@import 'src/assets/sass/variable';
.task-viewer {
  display: flex;
  justify-content: space-between;
  gap: 2rem;
  margin-top: -2rem;

  &:not(:last-child) {
    margin-bottom: 2rem;
  }

  &__section {
    width: 100%;
    height: fit-content;
    white-space: pre-line;

    &--old {
      border-radius: 0px 20px 20px 20px;
      background-color: $gray-900;
      color: white;
      padding: 10px 20px;
    }
  }
}
</style>
