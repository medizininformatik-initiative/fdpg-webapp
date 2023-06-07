<template>
  <el-row :gutter="20" type="flex" class="fdpg-dashboard-page-action-wrapper">
    <el-col v-for="(action, idx) in actions" :key="'action' + idx" :sm="24" :lg="12">
      <div class="fdpg-dashboard-action" :class="'fdpg-dashboard-action--' + action.style">
        <div>
          <span class="fdpg-dashboard-action__label">
            {{ $t(action.descriptionText) }}
          </span>
        </div>
        <el-button
          :type="action.style === 'blue' ? 'primary' : 'success'"
          :data-testId="action.testId"
          @click="action.action()"
        >
          {{ $t(action.actionText) }}
        </el-button>
      </div>
    </el-col>
  </el-row>
</template>

<script setup lang="ts">
import type { IDashboardAction } from '@/types/dashboard-actions.interface'
import type { PropType } from 'vue'

defineProps({
  actions: {
    type: Array as PropType<IDashboardAction[]>,
    required: true,
  },
})
</script>

<style lang="scss" scoped>
@import 'src/assets/sass/variable';

.fdpg-dashboard-page-action-wrapper {
  margin-bottom: 10px;

  .el-col {
    margin-bottom: 20px;

    .fdpg-dashboard-action {
      display: flex;
      border-width: 2px;
      border-radius: 8px;
      align-items: center;
      border-style: solid;
      padding: 27px 40px 27px 18px;
      justify-content: space-between;

      .fdpg-dashboard-action__label {
        color: $black;
        font-size: 20px;
        font-weight: 600;
        margin: 0 20px 0 0;
        background-color: $white;
      }

      &.fdpg-dashboard-action--blue {
        border-color: $blue;
        background-image: url('/src/assets/img/dashboard/background/blue-dot.png');
      }

      &.fdpg-dashboard-action--green {
        border-color: $green;
        background-image: url('/src/assets/img/dashboard/background/green-dot.png');
      }

      &:focus-visible {
        outline-style: outset;
        outline-color: blue;
        outline-width: 2px;
      }
    }
  }
}
</style>
