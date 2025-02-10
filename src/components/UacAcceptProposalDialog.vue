<template>
  <FdpgDialog
    v-model="dialogOpen"
    class="uac-approval-modal"
    width="50%"
    :title="$t('proposal.uacApprovalModalTitle')"
    :before-close="closeDialog"
  >
    <div>
      <p>{{ $t('proposal.uacApprovalModalDescription') }}</p>
      <el-steps direction="vertical">
        <FdpgStep step-icon-color="blue" :title="$t('proposal.addConditionsOptional')">
          <p>{{ $t('proposal.yourConditionWillBeCheckedByFdpg') }}</p>
          <div v-if="conditionFile" class="fdpg-upload-list-item">
            <p class="fdpg-upload-file__name">{{ conditionFile.name }}</p>
            <span>({{ (conditionFile.size / 1024).toFixed(1) }}KB)</span>
            <el-icon
              class="el-icon-close"
              tabindex="0"
              @click="() => handleRemoveFile()"
              @keydown.enter="handleRemoveFile()"
            />
          </div>
          <FdpgUpload
            accept=".pdf, .doc, .docx"
            :hide-file-list="true"
            :is-loading="false"
            :is-disabled="false"
            @change="handleChangeFileList"
          >
            <el-button v-if="!conditionFile" class="upload-button" link>
              {{ $t('proposal.chooseAFile') }}
              <template #icon>
                <el-icon class="bi-paperclip"></el-icon>
              </template>
            </el-button>
          </FdpgUpload>

          <FdpgLabel html-for="proposal.acceptReasonLabel" />
          <FdpgTextEditor
            v-model="conditionReasoning"
            data-testId="reasoning"
            :placeholder="$t('proposal.acceptReasonPlaceholder')"
            type="textarea"
            :rows="2"
            autosize
          />
        </FdpgStep>

        <FdpgStep
          step-icon-color="blue-green"
          :title="$t('proposal.furtherProcessingByDicTitle')"
          :description="$t('proposal.furtherProcessingByDicDescription')"
        />

        <FdpgStep
          step-icon-color="medium-green"
          :title="$t('proposal.preperationOfContractTitle')"
          :description="$t('proposal.preperationOfContractDescription')"
        />
      </el-steps>
    </div>

    <template #footer>
      <span>
        <el-button link data-testId="button__closeApprovalDialog" @click="closeDialog">
          {{ $t('general.cancel') }}
        </el-button>
        <el-button type="primary" data-testId="button__uacApproval-accept" @click="acceptContract">
          {{ $t('proposal.uacApprovalModalAgreeButton') }}
        </el-button>
      </span>
    </template>
  </FdpgDialog>
</template>

<script setup lang="ts">
import type { UploadFile } from 'element-plus'
import { ref } from 'vue'

import FdpgLabel from '@/components/FdpgLabel.vue'
import FdpgStep from '@/components/FdpgStep.vue'
import FdpgUpload from '@/components/FdpgUpload.vue'
import FdpgDialog from '@/components/FdpgDialog.vue'
import { useVModel } from '@vueuse/core'
import FdpgTextEditor from './FdpgTextEditor.vue'

const emit = defineEmits(['update:modelValue', 'closeDialog', 'acceptContract'])

const props = defineProps<{
  modelValue: boolean
}>()

const dialogOpen = useVModel(props, 'modelValue', emit)

const closeDialog = () => {
  conditionFile.value = null
  dialogOpen.value = false
  conditionReasoning.value = undefined
}

const conditionFile = ref<UploadFile | null>()
const conditionReasoning = ref<string | undefined>(undefined)

const handleChangeFileList = (file: UploadFile) => {
  conditionFile.value = file
}

const handleRemoveFile = () => {
  conditionFile.value = null
}

const acceptContract = () => {
  emit(
    'acceptContract',
    conditionFile.value,
    (conditionReasoning.value?.trim?.()?.length ?? 0) > 0 ? conditionReasoning.value?.trim() : undefined,
  )
}
</script>
