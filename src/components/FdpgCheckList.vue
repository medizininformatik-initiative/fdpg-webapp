<template>
  <div class="section">
    <h2 class="section-title">
      {{
        $t(title, {
          checkedCount: checklist.length,
          optionsCount: Object.keys(checklistOptions).length,
        })
      }}
    </h2>
    <el-checkbox-group v-model="checklist" class="checklist" :disabled="isDisabled">
      <FdpgCheckbox
        v-for="(label, value) in checklistOptions"
        :key="`checklist-option-${value}`"
        :value="value"
        :label="label"
        :size="FdpgInputSize.Small"
      />
    </el-checkbox-group>
  </div>
</template>

<script setup lang="ts">
import type { PropType } from 'vue';
import { computed } from 'vue'
import type { TranslationSchema } from '@/plugins/i18n'
import { FdpgInputSize } from '@/types/component.types'
import { useVModel } from '@vueuse/core'
import FdpgCheckbox from './FdpgCheckbox.vue'

const props = defineProps({
  modelValue: {
    type: Object as PropType<Record<string, boolean>>,
    required: true,
  },

  checklistOptions: {
    type: Object as PropType<Record<string, TranslationSchema>>,
    required: true,
  },
  isDisabled: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String as PropType<TranslationSchema>,
    required: true,
  },
})

const emit = defineEmits(['update:modelValue'])

const componentDto = useVModel(props, 'modelValue', emit)

const checklist = computed({
  get() {
    return Object.entries(componentDto.value)
      .filter(([_key, value]) => value)
      .map(([key, _value]) => key)
  },
  set(values) {
    componentDto.value = Object.keys(props.checklistOptions).reduce((acc, option) => {
      acc[option] = values.includes(option)
      return acc
    }, {})
  },
})
</script>

<style lang="scss" scoped>
.checklist {
  display: flex;
  flex-direction: column;
}
</style>
