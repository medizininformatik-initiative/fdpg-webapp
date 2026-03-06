<template>
  <div class="section">
    <!-- General Appendix/Documents Section -->
    <div class="general-appendix-title-row">
      <h2 class="section-title">{{ t('proposal.appendix') }} ({{ documents.length }})</h2>
      <el-button v-if="isManualUploadDialogVisible" type="primary" plain @click="handleOpenMultiUploadDialog">{{
        t('proposal.addDocuments')
      }}</el-button>
    </div>

    <DocumentList
      :documents="documents"
      :proposal-id="proposalId"
      :is-loading="isDocumentsLoading"
      :is-disabled="!isEditable"
      :two-columns="true"
      empty-alert-text="proposal.noAttachmentsYet"
      @remove="handleDocumentRemove"
    />

    <!-- Feasibility Queries Section -->
    <template v-if="feasibilityQueryDocuments.length > 0">
      <h2 class="section-title">{{ t('proposal.feasibilityDocuments') }} ({{ feasibilityQueryDocuments.length }})</h2>

      <DocumentList
        :documents="feasibilityQueryDocuments"
        :proposal-id="proposalId"
        :is-loading="isFeasibilityQueryDocumentsLoading"
        :is-disabled="true"
        :two-columns="true"
        empty-alert-text="proposal.noAttachmentsYet"
      />
    </template>

    <!-- Draft Contracts and Contracts Section Headers -->
    <el-row v-if="!hideContracts" :gutter="39">
      <el-col :span="12">
        <h2 class="section-title">
          {{ t('proposal.draftContracts') }}
        </h2>
      </el-col>
      <el-col :span="12">
        <h2 class="section-title">
          {{ t('proposal.contracts') }}
        </h2>
      </el-col>
    </el-row>

    <!-- Draft Contracts and Contracts Document Lists (Two Columns) -->
    <el-row v-if="!hideContracts" :gutter="39">
      <el-col :span="12">
        <DocumentList
          :documents="contractDrafts"
          :proposal-id="proposalId"
          :is-loading="isContractDraftsLoading"
          :is-disabled="!isEditable"
          :is-editable="isContractEditable"
          empty-alert-text="proposal.noContractDraftsYet"
          @remove="handleContractDraftRemove"
          @edit="handleContractDraftEditDialogOpen"
        />
      </el-col>

      <el-col :span="12">
        <DocumentList
          :documents="contracts"
          :proposal-id="proposalId"
          :is-loading="isContractsLoading"
          :is-disabled="!isEditable"
          empty-alert-text="proposal.noContractsYet"
          @remove="handleContractRemove"
        />
      </el-col>
    </el-row>

    <!-- Contract Appendix Section Header -->
    <el-row>
      <el-col :span="12">
        <h2 class="section-title">
          {{
            t('proposal.checkContractAppendix', {
              count: contractAppendix.length,
            })
          }}
        </h2>
      </el-col>
    </el-row>

    <!-- Contract Appendix Document List -->
    <el-row>
      <el-col>
        <ContractAppendixList
          :documents="contractAppendix"
          :proposal-id="proposalId"
          :is-loading="isContractAppendixLoading"
          :is-disabled="!isContractEditable"
          :two-columns="true"
          empty-alert-text="proposal.noAttachmentsYet"
          @remove="handleContractAppendixRemove"
          @add="handleContractAppendixAdd"
      /></el-col>
    </el-row>
  </div>

  <!-- Edit Contract Dialog -->
  <EditContractDialog
    v-model="editDialogOpen"
    :proposal-id="proposalId"
    :contract-drafts="contractDrafts"
    :is-contract-drafts-loading="isContractDraftsLoading"
    :supported-mimetype="SupportedMimetype"
    :upload-id="uploadId"
    @remove="handleContractDraftRemove"
    @success="handleEditContractSuccess"
  />

  <!-- Multi Upload Dialog -->
  <MultiUploadDialog
    v-model="multiUploadDialogOpen"
    :proposal-id="proposalId"
    :upload-types="generalAppendixTypes"
    :supported-mimetype="SupportedMimetype"
    @success="handleMultiUploadSuccess"
  />
</template>

<script setup lang="ts">
import DocumentList from '@/components/Proposals/Details/DocumentList.vue'
import useNotifications from '@/composables/use-notifications'
import useUpload from '@/composables/use-upload'
import { useAuthStore } from '@/stores/auth/auth.store'
import { useProposalStore } from '@/stores/proposal/proposal.store'
import { ProposalStatus } from '@/types/proposal.types'
import { DirectUpload, UseCaseUpload } from '@/types/upload.types'
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import ContractAppendixList from './Proposals/Details/ContractAppendixList.vue'
import EditContractDialog from './Proposals/Details/EditContractDialog.vue'
import MultiUploadDialog from './Proposals/Details/MultiUploadDialog.vue'
import type { UploadFile } from 'element-plus'
import { useI18n } from 'vue-i18n'
import ESupportedMimetype from '@/types/supported-mimetype.enum'
import { Role } from '@/types/oidc.types'

const { params } = useRoute()
const proposalId = computed(() => params.id as string)

const proposalStore = useProposalStore()
const authStore = useAuthStore()

const { t } = useI18n()

const generalAppendixTypes = [
  DirectUpload.GeneralAppendix,
  DirectUpload.EthicVote,
  DirectUpload.EthicVoteDeclarationOfNonResponsibility,
  DirectUpload.AdditionalDocument,
]

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

const status = computed(() => proposalStore.currentProposal?.status)
const isEditable = computed(
  () =>
    status.value === ProposalStatus.Draft ||
    status.value === ProposalStatus.Rework ||
    (authStore.hasFdpgLevelPermissions() && status.value === ProposalStatus.FdpgCheck),
)
const isContractEditable = computed(
  () => status.value === ProposalStatus.Contracting && authStore.hasFdpgLevelPermissions(),
)

const SupportedMimetype = computed(() => {
  return Object.values(ESupportedMimetype).join(',')
})

const isManualUploadDialogVisible = computed(() => {
  return (isEditable.value && authStore.singleKnownRole === Role.Researcher) || authStore.hasFdpgLevelPermissions()
})

const { showErrorMessage } = useNotifications()

const {
  uploadsForType: documents,
  handleRemoveFile: handleDocumentRemove,
  isAppendixLoading: isDocumentsLoading,
} = useUpload(proposalId, [...generalAppendixTypes, UseCaseUpload.ProposalPDF], showErrorMessage)

const { uploadsForType: feasibilityQueryDocuments, isAppendixLoading: isFeasibilityQueryDocumentsLoading } = useUpload(
  proposalId,
  [UseCaseUpload.FeasibilityQuery],
  showErrorMessage,
)

const {
  uploadsForType: contractDrafts,
  handleRemoveFile: handleContractDraftRemove,
  isAppendixLoading: isContractDraftsLoading,
} = useUpload(proposalId, [UseCaseUpload.ContractDraft], showErrorMessage)

const {
  uploadsForType: contractAppendix,
  handleRemoveFile: handleContractAppendixRemove,
  handleUploadFile: handleContractAppendixUpload,
  isAppendixLoading: isContractAppendixLoading,
} = useUpload(proposalId, [DirectUpload.ContractAppendix], showErrorMessage)

const {
  uploadsForType: contracts,
  handleRemoveFile: handleContractRemove,
  isAppendixLoading: isContractsLoading,
} = useUpload(
  proposalId,
  [UseCaseUpload.LocationContract, UseCaseUpload.ResearcherContract, UseCaseUpload.SkipContract],
  showErrorMessage,
)

const handleContractAppendixAdd = async (file: UploadFile) => {
  await handleContractAppendixUpload(file)
  await proposalStore.setCurrentProposal(proposalStore.currentProposal?._id)
}

const editDialogOpen = ref<boolean>(false)
const uploadId = ref<string | null>(null)

const handleContractDraftEditDialogOpen = (id: string) => {
  uploadId.value = id
  editDialogOpen.value = true
}

const handleEditContractSuccess = async () => {
  uploadId.value = null
}

const multiUploadDialogOpen = ref<boolean>(false)

const handleOpenMultiUploadDialog = () => {
  multiUploadDialogOpen.value = true
}

const handleMultiUploadSuccess = async () => {
  await proposalStore.setCurrentProposal(proposalStore.currentProposal?._id)
}
</script>

<style lang="scss" scoped>
.general-appendix-title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}
</style>
