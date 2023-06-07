<template>
  <div class="action-row">
    <div class="action-row__cluster">
      <el-button
        v-for="(button, idx) in clusteredButtons.left"
        :key="'button' + idx"
        :plain="button.type === 'secondary'"
        :disabled="button.isDisabled"
        type="primary"
        @click="button.action"
      >
        {{ $t(button.label) }}
      </el-button>
    </div>
    <div class="action-row__cluster">
      <el-button
        v-for="(button, idx) in clusteredButtons.right"
        :key="'button' + idx"
        :plain="button.type === 'secondary'"
        :disabled="button.isDisabled"
        :data-testId="button.testId"
        type="primary"
        @click="button.action"
      >
        {{ $t(button.label) }}
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { IDetailActionRow } from '@/types/detail-action-row.interface'
import type { PropType } from 'vue';
import { computed } from 'vue'

const props = defineProps({
  buttons: {
    type: Array as PropType<IDetailActionRow[]>,
    required: true,
  },
})

const clusteredButtons = computed(() =>
  props.buttons.reduce(
    (acc, button) => {
      if (!button.isHidden) {
        acc[button.position].push(button)
      }
      return acc
    },
    { left: [] as IDetailActionRow[], right: [] as IDetailActionRow[] },
  ),
)
</script>

<style lang="scss" scoped>
.action-row {
  margin: 3rem 0 2rem 0;
  display: flex;
  justify-content: space-between;
}
</style>
