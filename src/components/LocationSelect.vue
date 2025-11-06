<template>
  <section ref="select" class="location-select">
    <el-select
      v-model="vModel"
      :placeholder="t(placeholder)"
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
      <el-option
        v-for="item in locationOptions"
        :key="item.value"
        :label="item.label"
        :value="item.value"
        :disabled="disabled"
        :data-testId="'option__' + item.value + testIdExtension"
      />
    </el-select>
  </section>
</template>

<script setup lang="ts">
import { PlatformIdentifier } from '@/types/platform-identifier.enum'
import type { ILocation } from '@/types/location.types'
import { useVModel } from '@vueuse/core'
import type { CheckboxValueType } from 'element-plus'
import type { ComputedRef, PropType } from 'vue'
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useProposalStore } from '@/stores/proposal/proposal.store'

const props = defineProps({
  modelValue: {
    type: Array as PropType<string[]>,
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
    type: Array as PropType<string[]>,
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
  allLocations: {
    type: Array as PropType<ILocation[]>,
    required: true,
  },
  isRegisteringForm: {
    type: Boolean,
    default: false,
  },
})

const { t } = useI18n()

const emit = defineEmits(['update:modelValue'])
const vModel = useVModel(props, 'modelValue', emit)

const checkAll = ref(false)
const indeterminate = ref(false)
const proposalStore = useProposalStore()

const locationMap = computed(() => Object.fromEntries(props.allLocations.map((location) => [location._id, location])))

watch(
  () => props.modelValue,
  (newVal, oldVal) => {
    checkAll.value = newVal.length === props.allLocations.length
  },
  { deep: true },
)

const handleCheckAll = (val: CheckboxValueType) => {
  if (val) {
    vModel.value = props.allLocations.map((loc) => loc._id)
  } else {
    vModel.value = []
  }
}

const setMinimumSelection = () => {
  if (vModel.value.length <= 0 && props.minimumSelection.length > 0) {
    vModel.value.push(...props.minimumSelection)
  }
}

const locationOptions: ComputedRef<
  {
    label: string
    value: string
  }[]
> = computed(() => {
  return props.allLocations
    .map((loc) => {
      const location = locationMap.value[loc._id]
      if (!location) {
        console.warn(`Missing location '${loc._id}'`)
        return null
      }
      return { label: location.display, value: loc._id }
    })
    .filter((entry) => !!entry)
    .sort((a, b) => ('' + a.label).localeCompare(b.label))
})

const select = ref()

const openState = ref(false)
const selectedDataSources = computed(() => {
  return proposalStore.currentProposal?.selectedDataSources
})
const handleDropDownChange = (value: boolean) => {
  openState.value = value

  if (!value) {
    setMinimumSelection()
  }
}
</script>

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
