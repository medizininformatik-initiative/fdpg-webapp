<template>
  <section :id="task._id" role="region" class="task" :class="{ 'task--done': task.isDone }">
    <div class="task__header">
      <div>
        <span class="task__header__owner">{{ $t(`roles.${task.owner.role}`) }}</span>
        <span class="task__header__date">{{ dateString }}</span>
      </div>
      <i
        role="button"
        :disabled="isDoneLoading"
        tabindex="0"
        class="fa fa-regular"
        :class="task.isDone ? 'fa-check-circle' : 'fa-circle'"
        data-testId="current-task__is-done-trigger"
        @click="toggleIsDone"
        @keyup.enter="toggleIsDone"
      />
    </div>

    <div class="task__content">{{ task.content }}</div>
  </section>
</template>

<script setup lang="ts">
import useNotifications from '@/composables/use-notifications'
import { useCommentStore } from '@/stores/comment/comment.store'
import type { ICommentDetail } from '@/types/comment.interface'
import type { PropType} from 'vue';
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  task: {
    type: Object as PropType<ICommentDetail>,
    required: true,
  },
})

const { showErrorMessage } = useNotifications()
const commentStore = useCommentStore()

const i18n = useI18n()
const dateString = computed(() => {
  return new Date(props.task.createdAt).toLocaleDateString(i18n.locale.value, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
})

const isDoneLoading = ref(false)

const toggleIsDone = async () => {
  if (isDoneLoading.value) {
    return
  }
  isDoneLoading.value = true
  try {
    await commentStore.markCommentAsDone(props.task._id, !props.task.isDone)
  } catch (error) {
    showErrorMessage()
    console.log(error)
  }
  isDoneLoading.value = false
}
</script>

<style lang="scss" scoped>
@import 'src/assets/sass/variable';
.task {
  background: $blue;
  color: white;
  padding: 10px 20px;
  border-radius: 20px 0px 20px 20px;

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

    &__owner {
      font-weight: 700;
    }

    &__date {
      color: rgba(255, 255, 255, 0.8);
      margin-left: 0.5rem;
    }
  }

  &__content {
    margin-top: 0.3rem;
  }

  i {
    cursor: pointer;
  }
}
</style>
