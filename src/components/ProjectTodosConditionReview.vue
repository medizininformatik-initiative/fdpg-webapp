<template>
  <section class="section contract-conditions">
    <div class="contract-condition-row">
      <div
        v-if="uacCondition.uploadId"
        role="button"
        class="condition-text cursor-pointer"
        :data-testId="'button__condition-download__' + uacCondition.location"
        tabindex="0"
        @click="handleDownload(uacCondition.uploadId)"
        @keydown.enter="handleDownload(uacCondition.uploadId)"
      >
        {{ MII_LOCATIONS[uacCondition.location].display }}:
        {{ getFileName(uacCondition.uploadId) }}
      </div>

      <div class="condition-interaction">
        <div class="condition-data-amount">
          {{ $t('proposal.conditionApprovalDataVolume', { amount: uacCondition.dataAmount }) }}
        </div>
      </div>
    </div>

    <div class="contract-condition-row">
      <div class="condition-text-area">
        <div>Forwarded conditions to FDPG members</div>
        <div v-if="isDisabled">{{ uacCondition.conditionReasoning }}</div>
        <FdpgInput v-else v-model="uacCondition.conditionReasoning" type="textarea" :rows="2" autosize></FdpgInput>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import useDownload from '@/composables/use-download'
import useNotifications from '@/composables/use-notifications'
import FdpgInput from './FdpgInput.vue'
import { MII_LOCATIONS } from '@/constants'
import { useProposalStore } from '@/stores/proposal/proposal.store'
import type { IConditionalApproval } from '@/types/proposal.types'
import { computed, type PropType } from 'vue'
import { useRoute } from 'vue-router'

const props = defineProps({
  uacCondition: {
    type: Object as PropType<IConditionalApproval>,
    required: true,
  },
  isDisabled: {
    type: Boolean,
    default: false,
  },
})

const { params } = useRoute()
const proposalId = computed(() => params.id as string)
const { showErrorMessage } = useNotifications()
const proposalStore = useProposalStore()

const { downloadFile } = useDownload(proposalId, showErrorMessage)
const handleDownload = async (id: string) => {
  if (proposalId.value) {
    await downloadFile(id)
  }
}

const getFileName = (uploadId?: string) => {
  const uploads = proposalStore.currentProposal?.uploads ?? []

  return uploads.find((upload: any) => upload._id === uploadId)?.fileName ?? ''
}
</script>

<style lang="scss" scoped>
@use '@/assets/sass/variable' as *;

.contract-conditions {
  margin-top: 1rem;
  padding: 0 0 1rem 0;

  h3 {
    padding: 1rem 0 0 1rem;
    display: flex;
    align-items: center;
    i {
      background-color: $gray-800;
      color: $white;
      border-radius: 50%;
      width: 2.2rem;
      height: 2.2rem;
      display: inline-flex;
      justify-content: center;
      align-items: center;
      margin-right: 1rem;
    }
  }

  .contract-condition-row {
    display: flex;
    justify-content: space-between;

    padding: 0 12px;
    line-height: 24px;

    &:not(:last-child) {
      margin-bottom: 1rem;
    }

    .condition-text {
      font-size: 16px;
      color: $blue;
      font-weight: 600;
    }

    .cursor-pointer {
      cursor: pointer;
    }
    .condition-interaction {
      display: flex;
      align-items: center;
      gap: 2rem;
    }

    .condition-data-amount {
      display: flex;
      align-items: center;
      gap: 2rem;
      color: $green;
    }

    .condition-text-area {
      margin-top: 1rem;
      display: flex;
      flex-direction: column;
      width: 100%;
      justify-content: start;
      align-items: start;
      gap: 1rem;
    }
  }
}
</style>
