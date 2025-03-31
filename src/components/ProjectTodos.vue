<template>
  <div class="section">
    <h2 class="section-title">{{ $t('proposal.todosInTheProject') }} {{ `(${projectTodos.length})` }}</h2>
    <div v-if="projectTodos.length > 0" class="todos">
      <template v-for="(projectTodo, index) in projectTodos" :key="`todo-${index}`">
        <ProjectTodoItem
          v-if="projectTodo.type === 'comment'"
          :is-disabled="isDisabled || projectTodo.readonly"
          :project-todo="projectTodo"
        />
        <ProjectTodoLargeItem
          v-else
          :is-disabled="isDisabled || projectTodo.readonly"
          :has-actions="projectTodo.type === 'decision' || projectTodo.type === 'condition-check'"
          :project-todo="projectTodo"
        ></ProjectTodoLargeItem>
      </template>
    </div>
    <div v-else class="todos todos--empty">
      <i class="bi-check-circle-fill" />
      <h5>{{ $t('proposal.noOpenTasks') }}</h5>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { IProjectTodo } from '@/types/project-todo.interface'
import { type PropType } from 'vue'
import ProjectTodoItem from './ProjectTodoItem.vue'
import ProjectTodoLargeItem from './ProjectTodoLargeItem.vue'

defineProps({
  projectTodos: {
    type: Array as PropType<IProjectTodo[]>,
    required: true,
  },
  isDisabled: {
    type: Boolean,
    required: false,
    default: false,
  },
})
</script>

<style lang="scss" scoped>
@use '@/assets/sass/variable' as *;

.todos {
  &.todos--empty {
    display: flex;
    align-items: center;
    flex-direction: column;
    border-radius: 3px;
    border: 1px solid $gray-700;

    i {
      color: $green;
      font-size: 40px;
      margin-top: 11px;
      line-height: 58px;
    }

    h5 {
      font-size: 18px;
      margin: 0 0 19px;
    }
  }
}
</style>
