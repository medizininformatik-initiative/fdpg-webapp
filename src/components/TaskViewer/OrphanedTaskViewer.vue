<template>
  <section v-if="orphanedTasks.length > 0 && authStore.singleKnownRole === 'FdpgMember'" class="orphaned-task-viewer">
    <div class="orphaned-task-viewer__header">
      <h3 class="orphaned-task-viewer__title">⚠️ Orphaned Tasks</h3>
      <p class="orphaned-task-viewer__description">
        {{ t('proposal.orphanedTasksDescription') }}
      </p>
    </div>

    <div class="orphaned-task-viewer__tasks">
      <div
        v-for="(task, idx) in orphanedTasks"
        :key="'orphaned-task-' + idx"
        class="orphaned-task"
        :class="{ 'orphaned-task--done': task.isDone }"
      >
        <div class="orphaned-task__header">
          <div class="orphaned-task__info">
            <span class="orphaned-task__owner">{{ t(`roles.${task.owner.role}`) }}</span>
            <span class="orphaned-task__date">{{ getLocaleDateString(task.createdAt) }}</span>
            <span class="orphaned-task__object-id">Object ID: {{ task.referenceObjectId }}</span>
          </div>
          <div class="orphaned-task__status">
            <i class="fa fa-regular" :class="task.isDone ? 'fa-check-circle' : 'fa-circle'" />
          </div>
        </div>

        <div class="orphaned-task__content" v-html="task.content"></div>

        <div class="orphaned-task__actions">
          <el-button @click="deleteTask(task._id)" size="small" :loading="isLoading" link>
            <i class="fa fa-trash"></i>
            {{ t('general.delete') }}
          </el-button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useAuthStore } from '@/stores/auth/auth.store'
import { useCommentStore } from '@/stores/comment/comment.store'
import { useProposalStore } from '@/stores/proposal/proposal.store'
import { type DecisionType, useMessageBoxStore } from '@/stores/messageBox.store'
import type { ICommentDetail } from '@/types/comment.interface'
import { CommentType } from '@/types/comment.interface'
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElButton } from 'element-plus'
import { getLocaleDateString } from '@/utils/date.util'

const commentStore = useCommentStore()
const proposalStore = useProposalStore()
const authStore = useAuthStore()
const messageBoxStore = useMessageBoxStore()
const { t } = useI18n()

const isLoading = ref(false)

const existingObjectIds = computed(() => {
  const proposal = proposalStore.currentProposal
  if (!proposal) return new Set<string>()

  const ids = new Set<string>()

  const extractIds = (obj: any) => {
    if (obj && typeof obj === 'object') {
      if (Array.isArray(obj)) {
        obj.forEach(extractIds)
      } else {
        if (obj._id && typeof obj._id === 'string') {
          ids.add(obj._id)
        }
        Object.keys(obj).forEach((key) => {
          if (key !== '_id') {
            extractIds(obj[key])
          }
        })
      }
    }
  }

  extractIds(proposal)
  return ids
})

const orphanedTasks = computed(() => {
  return commentStore.comments.filter((comment: ICommentDetail) => {
    return comment.type === CommentType.PROPOSAL_TASK && !existingObjectIds.value.has(comment.referenceObjectId)
  })
})

const deleteTask = (commentId: string) => {
  messageBoxStore.setMessageBoxInfo({
    cancelButtonText: 'general.cancel',
    cancelButtonClass: 'el-button--text',
    showCancelButton: true,
    title: 'general.delete',
    message: 'general.deleteConfirmation',
    confirmButtonText: 'general.delete',
    callback: async (decision: DecisionType) => {
      if (decision === 'confirm') {
        isLoading.value = true
        try {
          await commentStore.deleteComment(commentId)
        } catch (error) {
          console.error('Error deleting comment:', error)
        } finally {
          isLoading.value = false
        }
      }
    },
  })
}
</script>

<style lang="scss" scoped>
@use '@/assets/sass/variable' as *;

.orphaned-task-viewer {
  margin: 2rem 0;
  padding: 1.5rem;
  background-color: $gray-100;
  border: 1px solid $gray-400;
  border-radius: 8px;

  &__header {
    margin-bottom: 1rem;
  }

  &__title {
    margin: 0 0 0.5rem 0;
    color: $red;
    font-size: 1.1rem;
    font-weight: 600;
  }

  &__description {
    margin: 0;
    color: $gray-900;
    font-size: 0.9rem;
    line-height: 1.4;
  }

  &__tasks {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
}

.orphaned-task {
  background: $red;
  color: $white;
  padding: 10px 20px;
  border-radius: 20px 0px 20px 20px;
  position: relative;

  &:not(:last-child) {
    margin-bottom: 0.5rem;
  }

  &--done {
    background: $green;
  }

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.5rem;
  }

  &__info {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  &__owner {
    font-weight: 700;
    font-size: 0.9rem;
  }

  &__date {
    color: rgba(255, 255, 255, 0.8);
    font-size: 0.8rem;
  }

  &__object-id {
    font-family: monospace;
    font-size: 0.7rem;
    color: rgba(255, 255, 255, 0.7);
    background-color: rgba(255, 255, 255, 0.2);
    padding: 0.2rem 0.4rem;
    border-radius: 4px;
    display: inline-block;
    margin-top: 0.25rem;
  }

  &__status {
    i {
      font-size: 1.2rem;
    }
  }

  &__content {
    margin: 0.5rem 0;
    line-height: 1.5;
  }

  &__actions {
    margin-top: 0.5rem;
    display: flex;
    justify-content: flex-end;

    .el-button {
      color: $white;

      &:hover {
        color: $white;
        opacity: 0.8;
      }
    }
  }
}

@media (max-width: 768px) {
  .orphaned-task {
    &__header {
      flex-direction: column;
      align-items: flex-start;
      gap: 0.5rem;
    }

    &__status {
      align-self: flex-end;
    }
  }
}
</style>
