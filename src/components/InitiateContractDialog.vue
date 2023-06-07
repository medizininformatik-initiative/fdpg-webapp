<template>
  <FdpgDialog
    v-model="dialogOpen"
    class="initiate-contract-dialog"
    width="50%"
    :title="$t('proposal.toContractingModalTitle')"
    :before-close="closeDialog"
    :show-close="false"
  >
    <div>
      <p>{{ $t('proposal.toContractingModalDescription') }}</p>
      <div v-if="contractDraft" class="fdpg-upload-list-item">
        <p class="fdpg-upload-file__name">{{ contractDraft.name }}</p>
        <span>({{ (contractDraft.size / 1024).toFixed(1) }}KB)</span>
        <el-icon class="el-icon-close" tabindex="0" @click="handleRemoveFile()" @keydown.enter="handleRemoveFile()" />
      </div>
      <FdpgUpload
        accept=".pdf"
        :hide-file-list="true"
        :file-list="uploadsForType"
        :is-loading="false"
        :is-disabled="false"
        @change="handleUploadFile"
      >
        <el-button v-if="!contractDraft" class="upload-button" type="text">
          {{ $t('proposal.chooseAFile') }}
          <template #icon>
            <el-icon class="bi-paperclip"></el-icon>
          </template>
        </el-button>
      </FdpgUpload>
    </div>
    <template #footer>
      <span>
        <el-button type="text" data-testId="button__closeInitiateContractDialog" @click="closeDialog">
          {{ $t('general.cancel') }}
        </el-button>
        <el-button
          type="primary"
          :disabled="!contractDraft"
          data-testid="button__initiateContract"
          @click="initiateContract"
        >
          {{ $t('proposal.initiateContract') }}
        </el-button>
      </span>
    </template>
  </FdpgDialog>
</template>

<script setup lang="ts">
import type { UploadFile } from 'element-plus'
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import FdpgUpload from '@/components/FdpgUpload.vue'
import FdpgDialog from '@/components/FdpgDialog.vue'
import useNotifications from '@/composables/use-notifications'
import useUpload from '@/composables/use-upload'
import { UseCaseUpload } from '@/types/upload.types'
import { useVModel } from '@vueuse/core'

const emit = defineEmits(['update:modelValue', 'closeDialog', 'initiateContract'])

const props = defineProps<{
  modelValue: boolean
}>()

const dialogOpen = useVModel(props, 'modelValue', emit)
const closeDialog = () => {
  contractDraft.value = null
  dialogOpen.value = false
}

const { params } = useRoute()
const proposalId = computed(() => params.id as string)

const contractDraft = ref<UploadFile | null>()

const handleUploadFile = (file: UploadFile) => {
  contractDraft.value = file
}

const handleRemoveFile = () => {
  contractDraft.value = null
}

const { showErrorMessage } = useNotifications()
const { uploadsForType } = useUpload(proposalId, [UseCaseUpload.ContractDraft], showErrorMessage)

const initiateContract = () => {
  if (contractDraft.value) {
    emit('initiateContract', contractDraft.value)
  }
}
</script>
