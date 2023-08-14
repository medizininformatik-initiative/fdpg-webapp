<template>
  <div class="fdpg-comment-creator">
    <section
      v-for="(comment, index) in commentStore.commentsObj[props.objectId] || []"
      :key="`comment-${comment._id}`"
      class="comment"
    >
      <i class="bi-clipboard-check" aria-hidden="true" :class="comment.isDone && 'is-done'" />
      <el-card
        :id="comment._id"
        :class="{
          'comment-card': !selectedComment || selectedComment._id !== comment._id,
          'comment-field-card': selectedComment && selectedComment._id === comment._id,
        }"
      >
        <template v-if="selectedComment && selectedComment._id === comment._id">
          <FdpgCommentForm
            v-model="selectedComment.content"
            :edit="true"
            @close="handleCancelClick"
            @save="handleSubmit"
          />
        </template>
        <template v-else>
          <div class="comment-card-header">
            <h5>
              {{ $t('roles.' + comment.owner.role) }}
              <span>{{
                new Date(comment.updatedAt).toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit',
                })
              }}</span>
            </h5>
          </div>
          <div class="comment-card-body">
            {{ comment.content }}
          </div>
          <div class="comment-card-actions">
            <div class="left">
              <el-button type="text" size="large" class="edit-btn" @click="() => handleEditClick(index)">
                {{ $t('general.edit') }}
              </el-button>
              <el-button type="text" size="large" class="delete-btn" @click="() => handleDeleteClick(comment._id)">
                {{ $t('general.delete') }}
              </el-button>
            </div>
          </div>
        </template>
      </el-card>
    </section>

    <el-card v-if="visibleCommentField" class="comment-field-card">
      <FdpgCommentForm v-model="newComment" @close="handleCancelClick" @save="handleSubmit" />
    </el-card>
    <el-button
      v-if="!visibleCommentField"
      class="create-comment-button"
      type="primary"
      plain
      @click="handleAddNewComment"
    >
      <i class="fa fa-plus" aria-hidden="true" /> {{ $t('proposal.addTaskForApplicant') }}
    </el-button>
  </div>
</template>

<script setup lang="ts">
import { useCommentStore } from '@/stores/comment/comment.store'
import type { CommentType, ICommentDetail } from '@/types/comment.interface'
import type { PropType } from 'vue'
import { nextTick, ref } from 'vue'
import { useRoute } from 'vue-router'
import FdpgCommentForm from './FdpgCommentForm.vue'

const props = defineProps({
  objectId: {
    type: String,
    default: '',
  },
  type: {
    type: String as PropType<CommentType>,
    required: true,
  },
})

const commentStore = useCommentStore()

const newComment = ref('')

const { params } = useRoute()

const visibleCommentField = ref<boolean>(false)
const selectedComment = ref<ICommentDetail | undefined>(undefined)

const handleSubmit = async (comment: string) => {
  try {
    if (selectedComment.value) {
      const commentObj = {
        locations: selectedComment.value.locations,
        content: comment,
        type: selectedComment.value.type,
      }
      await commentStore.updateComment(selectedComment.value._id, commentObj)
      selectedComment.value = undefined
    } else {
      const commentObj = {
        locations: [],
        content: comment,
        type: props.type,
      }
      await commentStore.createComment({ proposalId: params.id as string, objectId: props.objectId }, commentObj)
      visibleCommentField.value = false
    }
  } catch (e) {
    console.log('TODO: Handle Error')
  }
}

const handleCancelClick = () => {
  selectedComment.value = undefined
  visibleCommentField.value = false
}

const handleEditClick = (idx: number) => {
  selectedComment.value = { ...commentStore.commentsObj[props.objectId][idx] }
  visibleCommentField.value = false
  setTextareaFocus()
}

const handleDeleteClick = (id: string) => {
  commentStore.deleteComment(id)
}

const handleAddNewComment = () => {
  selectedComment.value = undefined
  visibleCommentField.value = true
  setTextareaFocus()
}

const setTextareaFocus = () => {
  nextTick(() => {
    document.getElementsByClassName('comment-field-card')[0]?.getElementsByTagName('textarea')[0]?.focus()
  })
}
</script>

<style lang="scss" scoped>
@import 'src/assets/sass/variable';

.fdpg-comment-creator {
  margin-bottom: 4em;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  padding-left: 30px;

  .comment {
    display: flex;
    flex-direction: row;
    margin-top: 5px;
    width: 100%;

    &:last-of-type {
      margin-bottom: 0.2em;
    }

    i {
      padding: 10px;
      font-size: 1.3em;
      background-color: $blue;
      color: $white;

      &.is-done {
        background-color: $green;
      }
    }
  }
  .comment-card {
    flex-grow: 1;
    margin-bottom: 20px;

    &:last-child {
      margin-bottom: 0;
    }

    .comment-card-body {
      white-space: pre-line;
    }

    .comment-card-header {
      font-size: 1em;

      h5 {
        margin: 0;
        font-size: 1em;
        color: $gray-900;

        span {
          margin-left: 5px;
          font-size: 0.8em;
          font-weight: normal;
        }
      }
    }

    .comment-card-actions {
      display: flex;
      justify-content: space-between;
      margin-top: 0.3em;

      .delete-btn {
        color: $red;
      }

      button {
        height: unset;
        min-height: 0;
        padding: 0;
      }
    }
  }

  .comment-field-card {
    width: 100%;
  }

  .create-comment-button {
    color: $white;
    min-height: 44px;
    padding: 12px 21px 12px 14px;
    background-color: $blue;
    margin-top: 0.3em;
    &:hover,
    &:focus {
      box-shadow: 0 0 10px 0 $gray-600;
      border-color: $blue;
    }

    i {
      margin-right: 12px;
    }
  }
}
</style>
