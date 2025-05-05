<template>
  <div class="section">
    <h2 class="section-title">{{ $t('proposal.deadlinesChange') }}</h2>

    <div class="section-content">
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
    default: () => ({}),
  },
  status: {
    type: String,
    required: true,
  },
})

const emit = defineEmits(['saveDeadlines'])

const proposalDeadlines = ref({})

const normalizeDate = (date) => {
  if (!date) return null
  const d = new Date(date)
  return d.toISOString().split('T')[0] // Only compare the date part
}

const modifiedDeadlines = computed(() => {
  const changes = {}
  Object.keys(proposalDeadlines.value).forEach((key) => {
    const currentValue = proposalDeadlines.value[key]
    const originalValue = props.deadlines[key]

    if (normalizeDate(currentValue) !== normalizeDate(originalValue)) {
      changes[key] = currentValue
    }
  })
  return changes
})

const saveDeadlines = () => {
  const allowedDeadlines = statusToDueDatesMap[props.status] || []

  const validChanges = Object.entries(modifiedDeadlines.value).reduce((acc, [key, value]) => {
    const originalValue = props.deadlines[key]
    if (allowedDeadlines.includes(key) && normalizeDate(value) !== normalizeDate(originalValue)) {
      acc[key] = value
    }
    return acc
  }, {})

  if (Object.keys(validChanges).length > 0) {
    const allDeadlines = {
      ...props.deadlines,
      ...validChanges,
    }
    emit('saveDeadlines', allDeadlines)
  }
}

onMounted(() => (proposalDeadlines.value = { ...props.deadlines }))

watch(
  () => props.deadlines,
  () => (proposalDeadlines.value = { ...props.deadlines }),
)

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
    return getMinDate(beforeConstraint, deadlines)
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

  return defaultDeadlineOrderList
    .map((deadlineOrder) => ({
      ...deadlineOrder,
      isLocked: !statusToDueDatesMap[props.status]?.includes(deadlineOrder.deadlineType),
      minDate: getMinDate(deadlineOrder.deadlineType, proposalDeadlines.value),
      maxDate: getMaxDate(deadlineOrder.deadlineType, proposalDeadlines.value),
    }))
    .sort((a, b) => a.order - b.order)
})
</script>

<style scoped>
.section-content {
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
