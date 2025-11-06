<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { computed } from 'vue'
import { useProposalStore } from '@/stores/proposal/proposal.store.ts'
import { getLocaleDateString } from '@/utils/date.util.ts'

const { t } = useI18n()
const proposalStore = useProposalStore()

const dataDelivery = computed(() => proposalStore.currentProposal?.dataDelivery)

const dueDateForManagementSiteConfirmation = computed(() => {
  const baseDateString = dataDelivery.value?.createdAt ?? dataDelivery.value?.updatedAt

  if (baseDateString === undefined) {
    return undefined
  }

  const baseDate = new Date(baseDateString)
  const dueDate = new Date()
  dueDate.setDate(baseDate.getDate() - 3)
  return dueDate
})

const localDueDateForManagementSiteConfirmation = computed(() => {
  if (dueDateForManagementSiteConfirmation.value === undefined) {
    return undefined
  }

  return getLocaleDateString(dueDateForManagementSiteConfirmation.value)
})

const isDueDatePassed = computed(() => {
  if (dueDateForManagementSiteConfirmation.value === undefined) {
    return false
  }

  const now = new Date()
  return now > dueDateForManagementSiteConfirmation.value
})
</script>

<template>
  <table v-if="dataDelivery !== null && dataDelivery !== undefined" class="dms__table">
    <colgroup>
      <col style="width: 50%" />
      <col style="width: 25%" />
      <col style="width: 25%" />
    </colgroup>

    <thead>
      <tr>
        <th class="dms__th dms__th--left">{{ t('dataDelivery.dataManagementSite') }}</th>
        <th class="dms__th dms__th--center">{{ t('dataDelivery.requestStatus') }}</th>
        <th class="dms__th dms__th--right">{{ t('dataDelivery.dueDate') }}</th>
      </tr>
    </thead>

    <tbody>
      <tr>
        <td class="dms__td dms__td--left">
          {{ dataDelivery.dataManagementSite }}
        </td>

        <td class="dms__td dms__td--center">
          <span class="dms__status" :data-variant="dataDelivery.acceptance">
            {{ t(`dataDelivery.${dataDelivery.acceptance}`) }}
          </span>
        </td>

        <td class="dms__td dms__td--right" :data-expired="isDueDatePassed">
          {{ localDueDateForManagementSiteConfirmation }}
        </td>
      </tr>
    </tbody>
  </table>
</template>

<style scoped lang="scss">
@use '@/assets/sass/variable' as *;

.dms__table {
  width: 100%;
  table-layout: fixed;
  border-collapse: collapse; // cleaner lines
  border-spacing: 0;
  font-size: 1rem;
}

.dms__table thead tr {
  border-bottom: 1px solid $gray-700;
}

.dms__th {
  padding: 0 0 0.5rem 0;
  font-weight: 600;
  color: $gray-900;
}

.dms__th--left {
  text-align: left;
}

.dms__th--center {
  text-align: center;
}

.dms__th--right {
  text-align: right;
}

.dms__td {
  padding-top: 1.25rem;
  color: $black;
  vertical-align: middle;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dms__td--left {
  text-align: left;
}

.dms__td--center {
  text-align: center;
}

.dms__td--right {
  text-align: right;

  &[data-expired='true'] {
    color: $red;
  }
}

.dms__status {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  border: 1px solid $gray-700;
  background: $gray-100;
  color: $black;
  line-height: 1.25rem;

  &[data-variant='ACCEPTED'] {
    background: $green;
    border-color: $green-100;
  }

  &[data-variant='DENIED'] {
    background: $red;
    border-color: $red-100;
    color: $white;
  }

  &[data-variant='PENDING'] {
    background: $gray-100;
    border-color: $gray-700;
  }
}
</style>
