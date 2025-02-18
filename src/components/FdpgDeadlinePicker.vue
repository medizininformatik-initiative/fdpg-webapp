<template>
  <div class="section">
    <h2 class="section-title">{{ $t('proposal.projectDeadline') }}</h2>
    <el-col :sm="24" :md="12">
      <FdpgFormItem
        prop="userProject.generalProjectInformation.desiredStartTime"
        data-testId="generalProjectInformationForm.desiredStartTime"
      >
        <FdpgLabel html-for="proposal.desiredStartTime" />
        <FdpgDatePicker
          v-model="dueDateForStatus"
          data-testId="generalProjectInformationForm.desiredStartTime"
          placeholder="proposal.pleaseEnterTheStartTime"
          :min-date="new Date()"
        />
      </FdpgFormItem>
    </el-col>
  </div>
</template>

<script setup lang="ts">
import { useVModel } from '@vueuse/core'
import { defineEmits, defineProps } from 'vue'

const emit = defineEmits(['update:modelValue'])
const props = defineProps({
  modelValue: {
    type: Date,
    required: true,
  },
})
const dueDateForStatus = useVModel(props, 'modelValue', emit)
</script>

<style></style>
