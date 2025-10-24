<template>
  <section role="region" class="section contract-participants">
    <h2>
      {{ $t('proposal.xContractParticipants', { count: signedContractsCount + signedContractsPendingCount + 1 }) }}
    </h2>
    <section role="menubar" class="tab-bar">
      <div
        role="menuitem"
        class="tab-item"
        :class="{ active: activeTab === 'owner' }"
        tabindex="0"
        @click="setActiveTab('owner')"
        @keydown.enter="setActiveTab('owner')"
      >
        {{ $t('general.applicant') }}
      </div>
      <div
        role="menuitem"
        class="tab-item"
        :class="{ active: activeTab === 'locations' }"
        tabindex="0"
        @click="setActiveTab('locations')"
        @keydown.enter="setActiveTab('locations')"
      >
        {{
          $t('proposal.xLocations', {
            count: signedContractsCount + signedContractsPendingCount,
          })
        }}
      </div>
    </section>

    <section v-show="activeTab === 'owner'" role="region">
      <section role="row" class="contract-row">
        <div>{{ ownerRow.ownerName }}</div>
        <div class="contract-info">
          <div class="contract-status" :class="ownerRow.status.style">{{ $t(ownerRow.status.text) }}</div>
          <div class="contract-date">
            {{ ownerRow.signedAt }}
          </div>
        </div>
      </section>
    </section>

    <section v-show="activeTab === 'locations'" role="region">
      <section v-if="isResearcher" role="row" class="contract-researcher-row">
        <div>
          {{ $t('proposal.contractPendingLocationCount', { count: signedContractsPendingCount }) }}
        </div>
        <div>
          {{ $t('proposal.contractAcceptedLocationCount', { count: signedContractsCount }) }}
        </div>
      </section>
      <section
        v-else
        v-for="location in uacFullyApproved.slice(0, isFullView ? uacFullyApproved.length : 3)"
        :key="'approved_' + location._id"
        role="row"
        class="contract-row"
      >
        <div>{{ locationLookUpMapRef[location.location]?.display ?? `unknown ${location.location}` }}</div>
        <div class="contract-info">
          <div class="contract-status" :class="location.status.style">{{ $t(location.status.text) }}</div>
          <div class="contract-date">
            {{ location.signedAt ? new Date(location.signedAt).toLocaleDateString() : '-' }}
          </div>
        </div>
      </section>

      <div
        v-if="uacFullyApproved.length > 3 && !isResearcher"
        class="show-more"
        role="button"
        tabindex="0"
        @click="toggleFullView()"
        @keydown.enter="toggleFullView()"
      >
        <span>{{ isFullView ? $t('dashboard.showLess') : $t('dashboard.showMore') }}</span>
        <span v-if="!isFullView"> ({{ uacFullyApproved.length - 3 }})</span>
        <i :class="isFullView ? 'el-icon-arrow-up' : 'el-icon-arrow-down'" aria-hidden="true" />
      </div>
    </section>
  </section>
</template>

<script setup lang="ts">
import type { TranslationSchema } from '@/plugins/i18n'
import { useAuthStore } from '@/stores/auth/auth.store'
import { useLocationStore } from '@/stores/locations/location.store'
import { useProposalStore } from '@/stores/proposal/proposal.store'
import type { ILocation } from '@/types/location.types'
import { Role } from '@/types/oidc.types'
import { computed, onMounted, ref, type Ref } from 'vue'

type StatusTagStyle = 'pending' | 'accepted' | 'rejected'
const proposalStore = useProposalStore()
const authStore = useAuthStore()
const locationStore = useLocationStore()

const isResearcher = computed(() => authStore.singleKnownRole === Role.Researcher)
const signedContractsCount = computed(() => proposalStore.currentProposal?.signedContractsCount ?? 0)
const signedContractsPendingCount = computed(() => proposalStore.currentProposal?.signedContractsPendingCount ?? 0)

const locationLookUpMapRef: Ref<{ [k: string]: ILocation }> = ref({})

const uacFullyApproved = computed(() => {
  const conditionAccepted =
    proposalStore.currentProposal?.conditionalApprovals.filter(
      (condition) =>
        condition.isAccepted &&
        !proposalStore.currentProposal?.requestedButExcludedLocations.includes(condition.location),
    ) ?? []
  const uacApprovals =
    proposalStore.currentProposal?.uacApprovals.filter(
      (approval) => !proposalStore.currentProposal?.requestedButExcludedLocations.includes(approval.location),
    ) ?? []

  const approvals = [...uacApprovals, ...conditionAccepted]

  return approvals.map((approval) => {
    const isDecided = approval.signedAt !== undefined
    const isSigned = approval.isContractSigned === true

    let status: { text: TranslationSchema; style: StatusTagStyle }
    {
      if (isSigned) {
        status = { text: 'proposal.contractSigned', style: 'accepted' }
      } else if (isDecided) {
        status = { text: 'proposal.contractRejected', style: 'rejected' }
      } else {
        status = { text: 'proposal.contractPending', style: 'pending' }
      }
    }

    return {
      ...approval,
      status,
    }
  })
})

const ownerRow = computed(() => {
  const proposal = proposalStore.currentProposal
  const ownerName = proposal?.ownerName
  const signedAt = proposal?.researcherSignedAt
    ? new Date(proposal?.researcherSignedAt).toLocaleDateString(undefined, {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      })
    : '-'

  let status: { text: TranslationSchema; style: StatusTagStyle }
  {
    if (proposal?.contractAcceptedByResearcher) {
      status = { text: 'proposal.contractSigned', style: 'accepted' }
    } else if (proposal?.contractRejectedByResearcher) {
      status = { text: 'proposal.contractRejected', style: 'rejected' }
    } else {
      status = { text: 'proposal.contractPending', style: 'pending' }
    }
  }

  return {
    ownerName,
    signedAt,
    status,
  }
})

type Tabs = 'owner' | 'locations'
const activeTab = ref<Tabs>(proposalStore.currentProposal?.researcherSignedAt === undefined ? 'owner' : 'locations')
const setActiveTab = (tab: Tabs) => (activeTab.value = tab)

const isFullView = ref(false)
const toggleFullView = () => {
  isFullView.value = !isFullView.value
}

onMounted(async () => {
  const lm = await locationStore.getLocationLookupMap()
  locationLookUpMapRef.value = lm
})
</script>

<style lang="scss" scoped>
@use '@/assets/sass/variable' as *;
@use 'sass:color';

.contract-participants {
  border: 1px solid $gray-700;
  border-radius: 5px;
  padding: 0 20px 20px 20px;

  .tab-bar {
    display: flex;
    color: $blue;
    font-weight: 600;
    margin-bottom: 20px;

    .tab-item {
      padding: 0.5rem 1rem;
      margin: 1px;
      border-radius: 5px;
      cursor: pointer;
      &.active {
        background: color.adjust($blue, $lightness: 40%);
      }
    }
  }

  .contract-researcher-row {
    display: flex;
    justify-content: space-between;
    flex-direction: column;
    gap: 0.5em;

    &:not(:last-child) {
      margin-bottom: 1rem;
    }
  }

  .contract-row {
    display: flex;
    justify-content: space-between;

    &:not(:last-child) {
      margin-bottom: 1rem;
    }
  }

  .contract-info {
    display: flex;
    align-items: center;
    gap: 2rem;
  }
  .contract-status {
    border-radius: 5px;
    padding: 1px 12px;
    border: 1px solid;
    height: 24px;

    &.pending {
      background-color: color.adjust($gray-900, $lightness: 50%);
      border-color: $gray-900;
    }

    &.accepted {
      background-color: color.adjust($green, $lightness: 50%);
      border-color: $green;
    }

    &.rejected {
      background-color: color.adjust($red-100, $lightness: 40%);
      border-color: $red-100;
      color: $black;
    }
  }

  .show-more {
    color: $blue;
    font-weight: 800;
    text-align: center;
    padding-top: 0.5rem;
    font-size: 16px;
    cursor: pointer;

    i {
      margin-left: 0.5rem;
    }
  }
}
</style>
