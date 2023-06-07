<template>
  <div class="lead">
    <el-tooltip
      effect="dark"
      :content="
        proposalStore.currentProposal?.userProject.generalProjectInformation.projectTitle ??
        $t('dashboard.researchRequestForDataDelivery')
      "
      placement="bottom-end"
    >
      <h1 class="title">
        {{
          proposalStore.currentProposal?.userProject.generalProjectInformation.projectTitle ??
          $t('dashboard.researchRequestForDataDelivery')
        }}
      </h1>
    </el-tooltip>
    <div class="header__actions--display">
      <template v-for="(button, idx) in buttons" :key="'button' + idx">
        <el-button
          v-if="!button.isHidden"
          :plain="button.type === 'secondary'"
          :data-testId="button.testId"
          :type="button.type"
          @click="button.action"
        >
          {{ $t(button.label) }}
        </el-button>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useProposalStore } from '@/stores/proposal/proposal.store'
import type { IButtonConfig } from '@/types/button-config.interface'
import type { PropType } from 'vue'

const proposalStore = useProposalStore()

defineProps({
  buttons: {
    type: Array as PropType<IButtonConfig[]>,
    required: true,
  },
})
</script>

<style lang="scss" scoped>
.lead {
  display: flex;
  margin-bottom: 34px;
  align-items: center;
  justify-content: space-between;
  .title {
    margin: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    padding-right: 1rem;
    white-space: nowrap;
  }

  .header__actions--display {
    padding-top: 4px;
    display: flex;
  }
}
</style>
