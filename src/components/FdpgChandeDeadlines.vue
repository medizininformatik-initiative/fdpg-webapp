<template>
  <div class="section">
    <h2 class="section-title">{{ $t('proposal.deadlinesChange') }}</h2>

    <el-row :gutter="20" v-for="(value, key) in filteredDueDates" :key="key">
      <el-col :span="24">
        <FdpgDeadlineItem v-model="filteredDueDates[key]" :label="key" :placeholder="$t(`proposal.dueDateNotSet`)" />
      </el-col>
    </el-row>

    <el-row justify="end" class="button-row">
      <el-col :span="1">
        <el-button type="primary" @click="saveDeadlines">
          {{ $t('general.save') }}
        </el-button>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { defineProps, toRefs, computed, reactive } from 'vue'
import FdpgDeadlineItem from './FdpgDeadlineItem.vue'
import { statusToDueDatesMap } from '@/utils/deadlines'

const props = defineProps({
  deadlines: {
    type: Object,
    required: true,
  },
  status: {
    type: String,
    required: true,
  },
})

const { deadlines } = toRefs(props)
const emit = defineEmits(['saveDeadlines'])

const filteredDueDates = reactive(
  Object.fromEntries(
    Object.keys(props.deadlines)
      .filter((dueDateKey) => statusToDueDatesMap[props.status]?.includes(dueDateKey))
      .map((key) => [key, props.deadlines[key]]),
  ),
)

const saveDeadlines = () => {
  emit('saveDeadlines', { ...filteredDueDates })
}
</script>

<style scoped>
.section {
  padding: 20px;
}

h2 {
  margin-bottom: 20px;
}

.el-row {
  margin-bottom: 10px;
}

.button-row {
  margin-top: 20px;
}
</style>
