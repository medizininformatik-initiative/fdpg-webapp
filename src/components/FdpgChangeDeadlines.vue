<template>
  <div class="section">
    <h2 class="section-title">{{ $t('proposal.deadlinesChange') }}</h2>

    <el-row
      :gutter="20"
      v-for="(deadlineOrder, _) in deadlineOrderList"
      :key="proposalDeadlines[deadlineOrder.deadlineType]"
    >
      <el-col :span="24">
        <FdpgDeadlineItem
          v-model="proposalDeadlines[deadlineOrder.deadlineType]"
          :label="cleanDueDateKey(deadlineOrder.deadlineType)"
          :placeholder="$t(`proposal.dueDateNotSet`)"
          :disabled="deadlineOrder.isLocked"
          :min-date="deadlineOrder.minDate"
          :max-date="deadlineOrder.maxDate"
        />
      </el-col>
    </el-row>

    <el-row justify="end" class="button-row">
      <el-col :span="3">
        <el-button type="primary" @click="saveDeadlines">
          {{ $t('general.save') }}
        </el-button>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { computed, defineProps, onMounted, ref, watch } from 'vue'
import FdpgDeadlineItem from './FdpgDeadlineItem.vue'
import {
  beforeDeadlineDateConstrains,
  cleanDueDateKey,
  defaultDeadlineOrderList,
  statusToDueDatesMap,
} from '@/utils/deadlines'

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

const emit = defineEmits(['saveDeadlines'])

const proposalDeadlines = ref({})

onMounted(() => {
  if (props.deadlines) {
    proposalDeadlines.value = { ...props.deadlines }
  }
})

const saveDeadlines = () => {
  emit('saveDeadlines', { ...proposalDeadlines.value })
}

watch(
  proposalDeadlines,
  (newValue, _) => {
    Object.keys(newValue).forEach((key) => {
      const currentValue = newValue[key]
      if (currentValue) {
        if (currentValue instanceof Date) {
          currentValue.setHours(8, 0, 0, 0)
        } else {
          const d = new Date(currentValue)
          d.setHours(8, 0, 0, 0)
          newValue[key] = d
        }
      }
    })
  },
  { deep: true, flush: 'sync' },
)

const getMinDate = (deadlineType, deadlines) => {
  if (!deadlines) {
    return null
  }
  const beforeConstraint = beforeDeadlineDateConstrains[deadlineType]

  if (!beforeConstraint) {
    return null
  }

  const date = deadlines[beforeConstraint] ? new Date(deadlines[beforeConstraint]) : null

  if (!date) {
    getMinDate(beforeConstraint, deadlines)
  }

  return date
}

const getMaxDate = (deadlineType, deadlines) => {
  if (!deadlines) {
    return null
  }

  const dates = Object.entries(beforeDeadlineDateConstrains)
    .filter(([_, value]) => value === deadlineType)
    .map(([key]) => (deadlines[key] ? new Date(deadlines[key]) : null))
    .filter((date) => date)

  if (dates.length === 0) {
    return null
  }

  // Return the earliest date
  return dates.reduce((earliest, current) => (current < earliest ? current : earliest))
}

const deadlineOrderList = computed(() => {
  if (!proposalDeadlines.value || Object.keys(proposalDeadlines.value).length === 0) {
    return []
  }

  console.log(proposalDeadlines.value)

  return defaultDeadlineOrderList
    .map((deadlineOrder) => ({
      ...deadlineOrder,
      isLocked: !statusToDueDatesMap[props.status]?.includes?.(deadlineOrder.deadlineType) ?? true,
      minDate: getMinDate(deadlineOrder.deadlineType, proposalDeadlines.value),
      maxDate: getMaxDate(deadlineOrder.deadlineType, proposalDeadlines.value),
    }))
    .sort((a, b) => a.order - b.order)
})
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
  display: flex;
  justify-content: flex-end;
}

.el-button {
  width: 100%;
}
</style>
