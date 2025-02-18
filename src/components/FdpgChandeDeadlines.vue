<template>
  <div class="section">
    <h2 class="section-title">{{ $t('proposal.deadlinesChange') }}</h2>

    <el-row :gutter="20" v-for="(value, key) in deadlines" :key="key">
      <el-col :span="24">
        <FdpgDeadlineItem
          v-model="deadlines[key]"
          :label="cleanDueDateKey(key)"
          :placeholder="$t(`proposal.dueDateNotSet`)"
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
import { defineProps, ref, watchEffect } from 'vue'
import FdpgDeadlineItem from './FdpgDeadlineItem.vue'
import { cleanDueDateKey } from '@/utils/deadlines'

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

const deadlines = ref({})

watchEffect(() => {
  if (props.deadlines) {
    deadlines.value = { ...props.deadlines }
  }
})

const saveDeadlines = () => {
  emit('saveDeadlines', { ...deadlines.value })
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
  display: flex;
  justify-content: flex-end;
}

.el-button {
  width: 100%;
}
</style>
