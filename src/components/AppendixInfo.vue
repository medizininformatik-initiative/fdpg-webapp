<template>
  <div v-if="!(hideDocuments && hideContracts)" class="section">
    <template v-if="!hideDocuments">
      <h2 class="section-title">
        {{ $t('proposal.appendix') }}
      </h2>

      <DocumentList
        :documents="documents"
        :proposal-id="proposalId"
        :is-loading="isDocumentsLoading"
        :is-disabled="
          proposalStore.currentProposal?.status !== ProposalStatus.Draft &&
          proposalStore.currentProposal?.status !== ProposalStatus.Rework
        "
        :two-columns="true"
        empty-alert-text="proposal.noAttachmentsYet"
        @remove="handleDocumentRemove"
      />
    </template>

    <el-row v-if="!hideContracts" :gutter="39">
      <el-col :span="12">
        <h2 class="section-title">
          {{ $t('proposal.draftContracts') }}
        </h2>
      </el-col>
      <el-col :span="12">
        <h2 class="section-title">
          {{ $t('proposal.contracts') }}
        </h2>
      </el-col>
    </el-row>
    <el-row v-if="!hideContracts" :gutter="39">
      <el-col :span="12">
        <DocumentList
          :documents="contractDrafts"
          :proposal-id="proposalId"
          :is-loading="isContractDraftsLoading"
          :is-disabled="
            proposalStore.currentProposal?.status !== ProposalStatus.Draft &&
            proposalStore.currentProposal?.status !== ProposalStatus.Rework
          "
          empty-alert-text="proposal.noContractDraftsYet"
          @remove="handleContractDraftRemove"
        />
      </el-col>
      <el-col :span="12">
        <DocumentList
          :documents="contracts"
          :proposal-id="proposalId"
          :is-loading="isContractsLoading"
          :is-disabled="
            proposalStore.currentProposal?.status !== ProposalStatus.Draft &&
            proposalStore.currentProposal?.status !== ProposalStatus.Rework
          "
          empty-alert-text="proposal.noContractsYet"
          @remove="handleContractRemove"
        />
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import DocumentList from '@/components/Proposals/Details/DocumentList.vue'
import useNotifications from '@/composables/use-notifications'
import useUpload from '@/composables/use-upload'
import { useAuthStore } from '@/stores/auth/auth.store'
import { useProposalStore } from '@/stores/proposal/proposal.store'
import { Role } from '@/types/oidc.types'
import { ProposalStatus } from '@/types/proposal.types'
import { DirectUpload, UseCaseUpload } from '@/types/upload.types'
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const { params } = useRoute()
const proposalId = computed(() => params.id as string)

const proposalStore = useProposalStore()

const hideContracts = computed(() => {
  const statesWithoutContracts = [
    ProposalStatus.Draft,
    ProposalStatus.FdpgCheck,
    ProposalStatus.LocationCheck,
    ProposalStatus.Rejected,
    ProposalStatus.Rework,
  ]

  return proposalStore.currentProposal?.status
    ? statesWithoutContracts.includes(proposalStore.currentProposal?.status)
    : false
})

const authStore = useAuthStore()
const hideDocuments = computed(() => {
  const isFdpgCheck = proposalStore.currentProposal?.status === ProposalStatus.FdpgCheck
  const isFdpgMember = authStore.singleKnownRole === Role.FdpgMember

  return isFdpgCheck && isFdpgMember
})

const { showErrorMessage } = useNotifications()
const {
  uploadsForType: documents,
  handleRemoveFile: handleDocumentRemove,
  isAppendixLoading: isDocumentsLoading,
} = useUpload(
  proposalId,
  [
    DirectUpload.GeneralAppendix,
    DirectUpload.EthicVote,
    DirectUpload.EthicVoteDeclarationOfNonResponsibility,
    UseCaseUpload.FeasibilityQuery,
    UseCaseUpload.ProposalPDF,
  ],
  showErrorMessage,
)

const {
  uploadsForType: contractDrafts,
  handleRemoveFile: handleContractDraftRemove,
  isAppendixLoading: isContractDraftsLoading,
} = useUpload(proposalId, [UseCaseUpload.ContractDraft], showErrorMessage)

const {
  uploadsForType: contracts,
  handleRemoveFile: handleContractRemove,
  isAppendixLoading: isContractsLoading,
} = useUpload(proposalId, [UseCaseUpload.LocationContract, UseCaseUpload.ResearcherContract], showErrorMessage)
</script>
