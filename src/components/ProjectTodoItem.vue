<template>
  <div class="todo-item">
    <div class="todo-row">
      <i class="bi-clipboard-check" aria-hidden="true" />

      <span class="todo-title" @click="toggleExpand">{{ projectTodo.date }} {{ projectTodo.title }}</span>
      <div v-show="!isExpanded" class="todo-description todo-description--short">{{ projectTodo.description }}</div>

      <i
        class="el-icon-arrow-right"
        :class="{ 'icon-rotate': isExpanded }"
        role="button"
        tabindex="0"
        @click="toggleExpand"
        @keyup.enter="toggleExpand"
      />
    </div>
    <template v-if="isExpanded">
      <div class="todo-description todo-description--long">{{ projectTodo.description }}</div>

      <div
        v-if="projectTodo.actionLabel"
        class="todo-action"
        role="button"
        tabindex="0"
        :data-testId="projectTodo.testId"
        :disabled="isDisabled"
        @click="projectTodo.action"
        @keyup.enter="projectTodo.action"
      >
        {{ $t(projectTodo.actionLabel) }}
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import type { IProjectTodo } from '@/types/project-todo.interface'
import type { PropType} from 'vue';
import { ref } from 'vue'

defineProps({
  projectTodo: {
    type: Object as PropType<IProjectTodo>,
    required: true,
  },
  isDisabled: {
    type: Boolean,
    default: false,
  },
})

const isExpanded = ref(false)
const toggleExpand = () => (isExpanded.value = !isExpanded.value)
</script>

<style lang="scss" scoped>
@import 'src/assets/sass/variable';

.todo-item {
  border-radius: 3px;
  border: 1px solid $gray-700;
  display: flex;
  flex-direction: column;
  position: relative;
  align-items: center;
  padding: 7px 35px 8px 10px;
  margin: 0 0 0.5rem 0;

  i {
    cursor: pointer;
    &.icon-rotate {
      transform: rotate(90deg);
    }

    &:first-child {
      line-height: 14px;
      margin-right: 10px;

      &::before {
        font-size: 20px;
      }
    }

    &:last-child {
      right: 10px;
      position: absolute;
    }
  }

  .todo-title {
    margin: 0;
    color: $blue;
    font-weight: 600;
    cursor: pointer;
    user-select: none;

    span {
      font-weight: 600;
    }
  }

  &:last-child {
    margin: 0;
  }

  .todo-row {
    display: flex;
    width: 100%;
    gap: 1em;
  }

  .todo-description {
    &--short {
      width: 30%;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    &--long {
      box-sizing: border-box;
      width: 100%;
      padding: 0.5rem 1rem 0.5rem 1rem;
      border-left: 1px solid $blue;
      margin: 1rem 0 0 18px;
    }
  }

  .todo-action {
    align-self: end;
    color: $blue;
    font-weight: 600;
    cursor: pointer;
    user-select: none;
  }
}
</style>
