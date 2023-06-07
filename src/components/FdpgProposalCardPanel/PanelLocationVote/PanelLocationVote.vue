<template>
  <el-row :gutter="20" class="vote">
    <el-col :span="12">
      <el-progress
        text-inside
        :percentage="(voteCount / proposal.requestedLocationsCount) * 100"
        :color="percentColors"
      />
      <p class="uac-vote">
        {{ $t('dashboard.uacVote') }}: <span>{{ `${voteCount}/${proposal.requestedLocationsCount}` }}</span>
      </p>
    </el-col>
    <el-col :span="12">
      <el-progress
        text-inside
        :percentage="(proposal.totalPromisedDataAmount / proposal.desiredDataAmount) * 100"
        :color="percentColors"
      />
      <p class="uac-data">
        <span>{{ `${proposal.totalPromisedDataAmount}/${proposal.desiredDataAmount}` }}</span>
      </p>
    </el-col>
  </el-row>
</template>

<script setup lang="ts">
import type { IProposalDetail } from '@/types/proposal.types'
import type { PropType } from 'vue';
import { computed } from 'vue'

const props = defineProps({
  proposal: {
    type: Object as PropType<IProposalDetail>,
    required: true,
  },
})

const percentColors = [
  { color: '#e52117', percentage: 50 },
  { color: '#5a79ae', percentage: 90 },
  { color: '#9bb923', percentage: 100 },
]

const voteCount = computed(() => {
  return props.proposal.requestedButExcludedCount + props.proposal.uacApprovedCount
})
</script>

<style lang="scss" scoped>
.vote {
  margin-top: 20px;
  margin-bottom: 10px;

  p {
    margin-top: 4px;
    margin-bottom: 0;

    &.uac-data {
      text-align: center;
    }

    span {
      font-weight: 600;
    }
  }
}
</style>
