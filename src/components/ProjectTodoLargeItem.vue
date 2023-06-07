<template>
  <div class="check-proposal-card">
    <div class="check-proposal-card-header">
      <h3 class="check-proposal-card-title">
        <i
          :class="[projectTodo.icon ? projectTodo.icon : 'bi bi-search', { 'is-done': projectTodo.isDone }]"
          aria-hidden="true"
        />
        {{ projectTodo.title }}
      </h3>
      <div v-if="hasActions" class="check-proposal-card-actions">
        <el-button
          :disabled="isDisabled"
          class="negative"
          :data-testId="projectTodo.testId + '__false'"
          @click="projectTodo.action(false)"
          ><i class="el-icon-close" aria-hidden="true"
        /></el-button>
        <el-button
          :disabled="isDisabled"
          class="positive"
          :data-testId="projectTodo.testId + '__true'"
          @click="projectTodo.action(true)"
        >
          <i class="el-icon-check" aria-hidden="true" />
        </el-button>
      </div>
    </div>
    <div class="check-proposal-card-content">
      {{ $t(projectTodo.description) }}
    </div>
  </div>
</template>

<script setup lang="ts">
import type { IProjectTodo } from '@/types/project-todo.interface'
import type { PropType } from 'vue'

defineProps({
  projectTodo: {
    type: Object as PropType<IProjectTodo>,
    required: true,
  },
  hasActions: {
    type: Boolean,
    default: false,
  },
  isDisabled: {
    type: Boolean,
    default: false,
  },
})
</script>

<style lang="scss" scoped>
@import 'src/assets/sass/variable';

.check-proposal-card {
  border-radius: 3px;
  border: 1px solid $gray-700;
  padding: 19px;
  margin: 1rem 0 1rem 0;

  &:last-child {
    margin-bottom: 0;
  }

  &:first-child {
    margin-top: 0;
  }

  .check-proposal-card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;

    .check-proposal-card-title {
      margin: 0;
      font-size: 20px;
      display: flex;
      align-items: center;

      i {
        color: white;
        margin-right: 10px;
        border-radius: 50%;
        background-color: #c3c7ce;
        font-size: 16px;
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;

        &.is-done {
          background-color: $green;
        }
      }
    }

    .check-proposal-card-actions {
      .el-button {
        padding: 0;
        width: 40px;
        min-height: 40px;
        background-color: $gray-200;
        border: none;
        color: $blue;

        i {
          font-size: 22px;
        }

        &:last-child {
          margin-left: 10px;
        }

        &:hover {
          &.positive {
            background-color: $green;
          }
          &.negative {
            background-color: $red-100;
          }

          i {
            color: $white;
          }
        }
      }
    }
  }

  .check-proposal-card-content {
    padding-top: 20px;
  }
}
</style>
