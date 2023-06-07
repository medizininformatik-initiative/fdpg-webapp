<template>
  <section ref="select" class="location-select">
    <div
      class="content"
      role="button"
      tabindex="0"
      :class="{ 'no-pointer': openState }"
      @click.stop="toggle"
      @keydown.enter="toggle()"
    >
      {{ placeholder }}
    </div>
    <el-select
      v-model="selection"
      placeholder=" "
      popper-class="location-dropdown"
      :multiple="true"
      style="width: 580px"
      @visible-change="handleDropDownChange"
    >
      <el-option-group v-for="group in groupOptions" :key="group.label" :label="group.label">
        <el-option
          v-for="item in group.options"
          :key="item.value"
          :label="item.label"
          :value="item.value"
          :data-testId="'option__' + item.value + testIdExtension"
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

    let result: MiiLocation[] = []

    if (wasOldVirtualAll) {
      result = values.filter((value) => value !== MiiLocation.VirtualAll)
    } else if (isVirtualAll) {
      result = [MiiLocation.VirtualAll]
    } else {
      result = values
    }

    if (result.length <= 0) {
      result.push(...props.minimumSelection)
    }

    vModel.value = result
  },
})

const { groupOptions } = useLocationGrouping()

const select = ref()

const openState = ref(false)
const toggle = () => {
  if (openState.value === false && select.value) {
    const inputElement = select.value.querySelector('input')
    inputElement?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }))
  }
}
const handleDropDownChange = (value: boolean) => {
  openState.value = value
}
</script>

<style>
.el-select-dropdown.location-dropdown {
  /* Sorry. Magic Number since placement property on the el-select is ignored */
  transform: translateY(-330px);
}
</style>

<style lang="scss" scoped>
@import 'src/assets/sass/variable';

.location-select {
  position: relative;
  display: flex;
  justify-content: flex-end;

  .el-input__inner {
    height: auto;
  }

  :deep(.el-input__suffix) {
    display: none;
  }

  :deep(.el-select) {
    pointer-events: none;
    .el-input__wrapper {
      box-shadow: none !important;
      border: none !important;
    }
  }

  :deep(.el-select__tags > span) {
    display: none;
  }

  .content {
    position: absolute;
    z-index: 2;
    transform: translate(0, 0.2rem);
    line-height: 47px;
    border-radius: 5px;

    padding: 0 1rem;
    background: $gray-900;
    color: $white;
    cursor: pointer;

    &.no-pointer {
      pointer-events: none;
    }

    &:focus-within {
      outline: $blue auto 1px;
      outline-offset: 3px;
    }
  }
}
</style>
