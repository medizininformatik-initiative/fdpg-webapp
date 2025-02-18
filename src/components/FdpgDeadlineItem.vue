<script setup lang="ts">
import { ref } from 'vue'
import { useVModel } from '@vueuse/core'
import FdpgDatePicker from './FdpgDatePicker.vue'
import FdpgLabel from './FdpgLabel.vue'
import { Check, Edit } from '@element-plus/icons-vue'
import { getLocaleDateString } from '@/utils/date.util.ts'
import { cleanDueDateKey } from '@/utils/deadlines.ts'

const props = defineProps({
  modelValue: {
    type: String,
    required: true,
  },
  placeholder: {
    type: String,
    required: true,
  },
  label: {
    type: String,
    required: true,
  },
})

const emit = defineEmits(['update:modelValue'])

const deadline = useVModel(props, 'modelValue', emit)
const isEditing = ref(false)

const openDatePicker = () => {
  isEditing.value = true
}

const closeDatePicker = () => {
  isEditing.value = false
}
</script>

<template>
  <FdpgLabel :htmlFor="`researcherStatus.${cleanDueDateKey(label)}`" />
  <div class="el-row deadline-item">
    <div class="deadline-display">
      <span v-if="!isEditing">{{ getLocaleDateString(deadline) || $t('proposal.dueDateNotSet') }}</span>

      <FdpgDatePicker v-else v-model="deadline" :placeholder="placeholder" :min-date="new Date()" />

      <el-button v-if="!isEditing" text type="primary" :icon="Edit" @click="openDatePicker"> </el-button>
      <el-button v-if="isEditing" text type="success" :icon="Check" @click="closeDatePicker"> </el-button>
    </div>
  </div>
</template>

<style scoped>
.deadline-item {
  width: 100%;
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.deadline-display {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 10px;
  justify-content: space-between;
}

.el-button {
  margin-left: 10px;
}
</style>
