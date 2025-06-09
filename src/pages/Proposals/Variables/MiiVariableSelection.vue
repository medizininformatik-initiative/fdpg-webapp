<template>
  <el-card class="form-group">
    <el-row>
      <el-col :sm="24">
        <p>{{ t('proposal.informationOnMiiSelectionForVariableSelectionStepBody') }}</p>
      </el-col>
    </el-row>
  </el-card>
</template>
<script setup lang="ts">
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
</script>
