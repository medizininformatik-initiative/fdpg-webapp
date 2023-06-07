<template>
  <el-row class="section quick-info-row" :gutter="39">
    <el-col v-for="(item, idx) in items" :key="'quickinfo' + idx" class="field" :sm="24" :md="item.fullSize ? 39 : 12">
      <div class="field__name">
        <i :class="item.icon" aria-hidden="true"></i>
        {{ item.label }}
      </div>
      <div class="field__value-wrapper">
        <span v-for="(value, vIdx) in item.values" :key="'value' + vIdx" class="field__value"> {{ value }} </span>
      </div>
    </el-col>
  </el-row>
</template>

<script setup lang="ts">
import type { IQuickInfo } from '@/types/quick-info.interface'
import type { PropType } from 'vue'

defineProps({
  items: {
    type: Array as PropType<IQuickInfo[]>,
    required: true,
  },
})
</script>

<style lang="scss" scoped>
@import 'src/assets/sass/variable';
.quick-info-row {
  row-gap: 2rem;
}
.field {
  color: $black;
  display: flex;
  font-weight: 500;
  justify-content: space-between;
  gap: 2rem;

  .field__name {
    display: flex;
    i {
      color: $blue;
      margin-right: 15px;
    }
  }

  .field__value-wrapper {
    display: flex;
    gap: 1rem;
    flex-flow: wrap;
    justify-content: flex-end;
    align-content: flex-start;
  }

  .field__value {
    padding: 0 9px;
    line-height: 22px;
    height: fit-content;
    border-radius: 4px;
    border: 1px solid $gray-700;
    background-color: $gray-200;
    white-space: nowrap;
  }
}
</style>
