<template>
  <section :id="task._id" role="region" class="task">
    <div class="task__header">
      <div>
        <span class="task__header__owner">{{ $t(`roles.${task.owner.role}`) }}</span>
        <span class="task__header__date">{{ dateString }}</span>
      </div>
      <i
        class="el-icon-arrow-right"
        :class="{ 'icon-rotate': isExpanded }"
        role="button"
        tabindex="0"
        data-testId="old-task__toggle_expand"
        @click="toggleExpand"
        @keyup.enter="toggleExpand"
      />
    </div>

    <div class="task__content" :class="{ 'task__content--expanded': isExpanded }">{{ task.content }}</div>
  </section>
</template>

<script setup lang="ts">
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

const isExpanded = ref(false)
const toggleExpand = () => {
  isExpanded.value = !isExpanded.value
}
const i18n = useI18n()
const dateString = computed(() => {
  return new Date(props.task.createdAt).toLocaleDateString(i18n.locale.value, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
})
</script>

<style lang="scss" scoped>
.task {
  padding: 0.5rem 0;

  &:not(:last-child) {
    border-bottom: 1px solid rgba(255, 255, 255, 0.5);
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
    display: none;
    margin-top: 0.3rem;

    &--expanded {
      display: block;
    }
  }

  i {
    cursor: pointer;
    &.icon-rotate {
      transform: rotate(90deg);
    }
  }
}
</style>
