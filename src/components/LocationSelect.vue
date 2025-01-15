<template>
  <section ref="select" class="location-select">
    <el-select
      v-model="selection"
      :placeholder="$t(placeholder)"
      popper-class="location-dropdown"
      :multiple="true"
      @visible-change="handleDropDownChange"
      collapse-tags
      :max-collapse-tags="3"
      :placement="placement"
    >
      <el-option-group v-for="group in groupOptions" :key="group.label" :label="group.label">
        <el-option
          v-for="item in group.options"
          :key="item.value"
          :label="item.label"
          :value="item.value"
          :disabled="disabled"
          :data-testId="'option__' + item.value + testIdExtension"
          :class="vModel.includes(MiiLocation.VirtualAll) ? 'selected' : ''"
        />
      </el-option-group>
    </el-select>
  </section>
</template>

<script setup lang="ts">
import useLocationGrouping from '@/composables/use-location-grouping'
import { MiiLocation } from '@/types/location.enum'
import { useVModel } from '@vueuse/core'
import type { PropType } from 'vue'
import { computed, ref } from 'vue'

const props = defineProps({
  modelValue: {
    type: Array as PropType<MiiLocation[]>,
    required: true,
  },
  placeholder: {
    type: String,
    required: true,
  },
  testIdExtension: {
    type: String,
    default: '',
  },
  minimumSelection: {
    type: Array as PropType<MiiLocation[]>,
    required: true,
  },
  placement: {
    type: String,
    default: 'bottom-start',
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  allOptionLabel: {
    type: String,
    required: false,
  },
})

const emit = defineEmits(['update:modelValue'])
const vModel = useVModel(props, 'modelValue', emit)

const selection = computed({
  get() {
    return vModel.value
  },
  set(values) {
    const wasOldVirtualAll = vModel.value.includes(MiiLocation.VirtualAll)
    const isVirtualAll = values.includes(MiiLocation.VirtualAll)

    const selectionValues = groupOptions
      .flatMap((groupOption) => groupOption.options)
      .map((option) => option.value as MiiLocation)

    let result: MiiLocation[] = []

    if (wasOldVirtualAll && values.length === 0) {
      result = []
    } else if (wasOldVirtualAll) {
      result = selectionValues.filter((optionVal) => !values.includes(optionVal))
    } else if (isVirtualAll || values.length === selectionValues.length - 1) {
      result = [MiiLocation.VirtualAll]
    } else {
      result = values
    }

    vModel.value = result
  },
})

const setMinimumSelection = () => {
  if (vModel.value.length <= 0 && props.minimumSelection.length > 0) {
    vModel.value.push(...props.minimumSelection)
  }
}

const { groupOptions } = useLocationGrouping(undefined, props.allOptionLabel)

const select = ref()

const openState = ref(false)

const handleDropDownChange = (value: boolean) => {
  openState.value = value

  if (!value) {
    setMinimumSelection()
  }
}
</script>

<style></style>

<style lang="scss" scoped>
@use '@/assets/sass/variable' as *;

.location-select {
  position: relative;
  display: flex;
  height: fit-content;
  justify-content: flex-end;

  .el-input__inner {
    height: auto;
  }

  :deep(.el-select) {
    .el-input__wrapper {
      box-shadow: none !important;
      border: none !important;
    }

    .el-tag > i {
      display: none;
    }
  }

  :deep(.el-select__tags > i) {
    display: none;
  }
}
</style>
