<template>
  <section ref="select" class="location-select">
    <el-select
      v-model="vModel"
      :placeholder="$t(placeholder)"
      popper-class="location-dropdown"
      multiple
      @visible-change="handleDropDownChange"
      collapse-tags
      :max-collapse-tags="3"
      :placement="placement"
    >
      <template #header>
        <el-checkbox v-model="checkAll" :indeterminate="indeterminate" @change="handleCheckAll"> All </el-checkbox>
      </template>
      <el-option-group v-for="group in groupOptions" :key="group.label" :label="group.label">
        <el-option
          v-for="item in group.options"
          :key="item.value"
          :label="item.label"
          :value="item.value"
          :disabled="disabled"
          :data-testId="'option__' + item.value + testIdExtension"
        />
      </el-option-group>
    </el-select>
  </section>
</template>

<script setup lang="ts">
import useLocationGrouping from '@/composables/use-location-grouping'
import { SORTED_ACTIVE_LOCATION_OPTIONS } from '@/constants'
import { MiiLocation } from '@/types/location.enum'
import { useVModel } from '@vueuse/core'
import type { CheckboxValueType } from 'element-plus'
import type { PropType } from 'vue'
import { computed, onMounted, ref } from 'vue'

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

const checkAll = ref(false)
const indeterminate = ref(false)

const handleCheckAll = (val: CheckboxValueType) => {
  indeterminate.value = false
  if (val) {
    vModel.value = SORTED_ACTIVE_LOCATION_OPTIONS.map((loc) => loc.value as MiiLocation)
  } else {
    vModel.value = []
  }
}

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
