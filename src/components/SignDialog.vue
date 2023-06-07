<template>
  <FdpgDialog
    v-model="dialogOpen"
    width="50%"
    :title="$t('proposal.acceptContractProposal')"
    :before-close="closeDialog"
    :show-close="false"
    aria-modal="true"
  >
    <div>
      <p>{{ $t('proposal.acceptContractProposalModalDescription') }}</p>
      <el-steps direction="vertical">
        <FdpgStep step-icon-color="blue" :title="$t('proposal.downloadContract')">
          <p>{{ $t('proposal.downloadContractDescription') }}</p>
          <div class="el-contracts-list">
            <el-button v-if="contractDraft" type="text" class="contract-download" @click="downloadContractDraft">
              {{ contractDraft?.fileName }}
            </el-button>
            <span v-else class="no-contract-hint">{{ $t('proposal.noContractDraftYet') }}</span>
          </div>
        </FdpgStep>

        <FdpgStep
          step-icon-color="blue-green"
          :title="$t('proposal.sign')"
          :description="$t('proposal.pleaseSignTheContractDescription')"
        />

        <FdpgStep step-icon-color="light-green" :title="$t('proposal.uploadSignitureTitle')">
          <p>{{ $t('proposal.uploadSignitureDescription') }}</p>
          <div v-if="contractFile" class="fdpg-upload-list-item">
            <p class="fdpg-upload-file__name">{{ contractFile.name }}</p>
            <span>({{ (contractFile.size / 1024).toFixed(1) }}KB)</span>
            <el-icon class="el-icon-close" tabindex="0" @click="handleRemoveFile()" @keyup.enter="handleRemoveFile()" />
          </div>
          <FdpgUpload
            accept=".pdf, .doc, .docx"
            :hide-file-list="true"
            :is-loading="false"
            :is-disabled="!contractDraft"
            @change="handleChangeFileList"
          >
            <el-button v-if="!contractFile" class="upload-button" type="text">
              {{ $t('proposal.chooseAFile') }}
              <template #icon>
                <el-icon class="bi-paperclip"></el-icon>
              </template>
            </el-button>
          </FdpgUpload>
        </FdpgStep>

        <!-- https://appsfactory-slack.slack.com/archives/C02C4K5SE3A/p1668423824884309?thread_ts=1668416278.083329&cid=C02C4K5SE3A -->
        <!-- <FdpgStep step-icon-color="light-green" :title="$t('proposal.sendContract')">
          <p>{{ $t('proposal.pleaseSendUsTheSignaturePage') }}<br /><br /></p>
          <p v-for="(label, index) in sendContractList" :key="index">
            {{ label }}
          </p>
        </FdpgStep> -->
      </el-steps>
    </div>
    <template #footer>
      <span>
        <el-button type="text" data-testId="button__closeSignDialog" @click="closeDialog">
          {{ $t('general.cancel') }}
        </el-button>
        <el-button
          type="primary"
          :disabled="!contractDraft || !contractFile"
          data-testid="button__acceptContract"
          @click="acceptContract"
        >
          {{ $t('proposal.acceptContract') }}
        </el-button>
      </span>
    </template>
  </FdpgDialog>
</template>

<script setup lang="ts">
import type { UploadFile } from 'element-plus'
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'

import FdpgStep from '@/components/FdpgStep.vue'
import FdpgUpload from '@/components/FdpgUpload.vue'
import FdpgDialog from './FdpgDialog.vue'
import useNotifications from '@/composables/use-notifications'
import useUpload from '@/composables/use-upload'
import { UseCaseUpload } from '@/types/upload.types'
import { useVModel } from '@vueuse/core'
import useDownload from '@/composables/use-download'

const emit = defineEmits(['update:modelValue', 'closeDialog', 'acceptContract'])

const props = defineProps<{
  modelValue: boolean
}>()

const dialogOpen = useVModel(props, 'modelValue', emit)
const closeDialog = () => {
  contractFile.value = null
  dialogOpen.value = false
}

const { params } = useRoute()
const proposalId = computed(() => params.id as string)

// https://appsfactory-slack.slack.com/archives/C02C4K5SE3A/p1668423824884309?thread_ts=1668416278.083329&cid=C02C4K5SE3A
// const sendContractList: string[] = [
//   'TMF – Technologie- und Methodenplattform',
//   'für die vernetzte medizinische Forschung e.V.',
//   'Charlottenstraße 42',
//   '10117 Berlin',
// ]

const contractFile = ref<UploadFile | null>()

const handleChangeFileList = (file: UploadFile) => {
  contractFile.value = file
}

const handleRemoveFile = () => {
  contractFile.value = null
}

const { showErrorMessage } = useNotifications()
const { uploadsForType: contractDrafts } = useUpload(proposalId, [UseCaseUpload.ContractDraft], showErrorMessage)
const contractDraft = computed(() => contractDrafts.value.at(-1))

const { downloadFile, isDownloadLoading } = useDownload(proposalId, showErrorMessage)
const downloadContractDraft = async () => {
  if (proposalId.value && !isDownloadLoading.value && contractDraft.value?._id) {
    await downloadFile(contractDraft.value?._id)
  }
}

const acceptContract = () => {
  if (contractDraft.value && contractFile.value) {
    emit('acceptContract', contractFile.value)
  }
}
</script>

<style lang="scss">
@import 'src/assets/sass/variable';
.no-contract-hint {
  color: $red-100;
}
</style>
