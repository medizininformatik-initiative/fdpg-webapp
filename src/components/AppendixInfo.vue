<template>
  <div v-if="!(hideDocuments && hideContracts)" class="section">
    <template v-if="!hideDocuments">
      <h2 class="section-title">{{ t('proposal.appendix') }} ({{ documents.length }})</h2>

      <DocumentList
        :documents="documents"
        :proposal-id="proposalId"
        :is-loading="isDocumentsLoading"
        :is-disabled="!isEditable"
        :two-columns="true"
        empty-alert-text="proposal.noAttachmentsYet"
        @remove="handleDocumentRemove"
      />
    </template>

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

  <FdpgDialog v-model="editDialogOpen" :title="t('proposal.editContract')" width="50%">
    <FdpgUpload
      :is-loading="isContractDraftsLoading"
      :is-disabled="false"
      :hide-file-list="false"
      :file-list="relevantEditContractDocuments"
      @change="handleEditContractUpload"
      :accept="SupportedMimetype"
      :proposal-id="proposalId"
      @remove="handleContractDraftRemove"
    >
      <el-button class="upload-button" link>
        {{ t('proposal.chooseAFile') }}
        <template #icon>
          <el-icon class="bi-paperclip"></el-icon>
        </template>
      </el-button>
    </FdpgUpload>

    <div v-if="!!uploadedFile" class="display-uploaded">
      <el-icon class="bi-paperclip"></el-icon>
      <div>{{ uploadedFile.name }}</div>
    </div>

    <template #footer>
      <span>
        <el-button link @click="handleCloseDialog">
          {{ t('general.cancel') }}
        </el-button>
        <el-button type="primary" @click="handleEditContract" :disabled="isContractDraftsLoading || !uploadedFile">
          {{ t('general.save') }}
        </el-button>
      </span>
    </template>
  </FdpgDialog>
</template>
<script setup lang="ts">
import DocumentList from '@/components/Proposals/Details/DocumentList.vue'
import useNotifications from '@/composables/use-notifications'
import useUpload from '@/composables/use-upload'
import { useAuthStore } from '@/stores/auth/auth.store'
import { useProposalStore } from '@/stores/proposal/proposal.store'
import { type IUpload, ProposalStatus } from '@/types/proposal.types'
import { DirectUpload, UseCaseUpload } from '@/types/upload.types'
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import ContractAppendixList from './Proposals/Details/ContractAppendixList.vue'
import type { UploadFile } from 'element-plus'
import FdpgDialog from './FdpgDialog.vue'
import FdpgUpload from './FdpgUpload.vue'
import { useI18n } from 'vue-i18n'
import ESupportedMimetype from '@/types/supported-mimetype.enum'

const { params } = useRoute()
const proposalId = computed(() => params.id as string)

const proposalStore = useProposalStore()

const { t } = useI18n()

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
const isEditable = computed(() => status.value === ProposalStatus.Draft || status.value === ProposalStatus.Rework)
const isContractEditable = computed(
  () => status.value === ProposalStatus.Contracting && authStore.hasFdpgLevelPermissions(),
)

const authStore = useAuthStore()
const hideDocuments = computed(() => {
  const isFdpgCheck = proposalStore.currentProposal?.status === ProposalStatus.FdpgCheck
  const isFdpgMember = authStore.hasFdpgLevelPermissions()

  return isFdpgCheck && isFdpgMember
})

const SupportedMimetype = computed(() => {
  return Object.values(ESupportedMimetype).join(',')
})

const { showErrorMessage, showSuccessMessage } = useNotifications()
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
    DirectUpload.AdditionalDocument,
    UseCaseUpload.ProposalPDF,
    UseCaseUpload.FeasibilityQuery,
  ],
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
} = useUpload(proposalId, [UseCaseUpload.LocationContract, UseCaseUpload.ResearcherContract], showErrorMessage)

const handleContractAppendixAdd = async (file: UploadFile) => {
  await handleContractAppendixUpload(file)
  await proposalStore.setCurrentProposal(proposalStore.currentProposal?._id)
}

const editDialogOpen = ref<boolean>(false)
const uploadedFile = ref<UploadFile | null>(null)
// const relevantEditContractDocuments = ref<IUpload[]>([])
const uploadId = ref<string | null>(null)
const relevantEditContractDocuments = computed<IUpload[]>(() => {
  return contractDrafts.value.filter((doc) => doc._id === uploadId.value)
})

const handleContractDraftEditDialogOpen = (id: string) => {
  uploadId.value = id
  handleOpenDialog()
}

const handleOpenDialog = () => {
  editDialogOpen.value = true
}

const handleCloseDialog = () => {
  uploadedFile.value = null
  uploadId.value = null
  editDialogOpen.value = false
}

const handleEditContractUpload = async (file: UploadFile) => {
  uploadedFile.value = file
}

const handleEditContract = async () => {
  const file = uploadedFile.value?.raw

  if (!file || !uploadId.value) {
    showErrorMessage()
    handleCloseDialog()
  } else {
    try {
      await proposalStore.updateContracting(proposalId.value, file as File, uploadId.value)
      showSuccessMessage(t('general.submitted'))

      await proposalStore.setCurrentProposal(proposalStore.currentProposal?._id)
    } catch {
      showErrorMessage()
    }

    handleCloseDialog()
  }
}
</script>

<style lang="scss" scoped>
.display-uploaded {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 10px;
}
</style>
