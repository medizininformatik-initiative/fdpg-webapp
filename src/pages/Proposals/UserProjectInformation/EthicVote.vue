<template>
  <FdpgLabel
    required
    html-for="proposal.ethicsVote"
    size="medium"
    info="proposal.admitReputationOfAttachmentInformation"
  />
  <el-card class="form-group">
    <el-row :gutter="20">
      <el-col :sm="24">
        <el-radio-group
          v-model="ethicVoteForm.isExisting"
          :disabled="reviewMode || ethicVoteForm.isDone"
          data-testId="ethicVoteForm.isExisting"
        >
          <FdpgRadio :value="true" label="proposal.present" test-id-extension="__ethicVoteForm.isExisting" />
          <FdpgRadio :value="false" label="proposal.notRequired" test-id-extension="__ethicVoteForm.isExisting" />
        </el-radio-group>
      </el-col>
      <template v-if="ethicVoteForm.isExisting">
        <el-col :sm="24">
          <FdpgFormItem prop="userProject.ethicVote.ethicsCommittee">
            <FdpgLabel html-for="proposal.ethicsCommittee" />
            <FdpgInput
              v-model="ethicVoteForm.ethicsCommittee"
              data-testId="ethicVoteForm.ethicsCommittee"
              placeholder="proposal.ethicsCommitteePlaceholder"
              :disabled="reviewMode || ethicVoteForm.isDone"
            />
          </FdpgFormItem>
        </el-col>
        <el-col :sm="12">
          <FdpgFormItem prop="userProject.ethicVote.ethicsVoteNumber">
            <FdpgLabel html-for="proposal.ethicsVoteNumber" />
            <FdpgInput
              v-model="ethicVoteForm.ethicsVoteNumber"
              data-testId="ethicVoteForm.ethicsVoteNumber"
              placeholder="proposal.ethicsVoteNumberPlaceholder"
              :disabled="reviewMode || ethicVoteForm.isDone"
            />
          </FdpgFormItem>
        </el-col>
        <el-col :sm="12">
          <FdpgFormItem prop="userProject.ethicVote.voteFromDate" data-testId="ethicVoteForm.voteFromDate">
            <FdpgLabel html-for="proposal.voteFromDate" />
            <FdpgDatePicker
              v-model="ethicVoteForm.voteFromDate"
              placeholder="proposal.ethicVoteFromDatePlaceholder"
              :disabled="reviewMode || ethicVoteForm.isDone"
            />
          </FdpgFormItem>
        </el-col>
        <el-col :sm="24">
          <FdpgFormItem prop="userProject.ethicVote.ethicVoteUploads" data-testId="ethicVoteForm.ethicVoteUploads">
            <FdpgLabel html-for="proposal.appendix" class="form__item--width" />
            <p v-if="!reviewMode" class="form__item--width">
              {{
                proposalId
                  ? $t('proposal.pleaseAttachProofOfTheEthicsVoteToTheApplication')
                  : $t('proposal.attachmentsOnlyAfterSavingHint')
              }}
            </p>
            <FdpgUpload
              v-if="proposalId"
              data-testId="ethicVoteForm__upload"
              accept=".pdf, .doc, .docx"
              :file-list="uploadsForType"
              :is-loading="isAppendixLoading"
              :is-disabled="reviewMode || ethicVoteForm.isDone"
              :proposal-id="proposalId"
              empty-alert-text="proposal.noEthicVotesYet"
              class="form__item--width"
              @change="handleUploadFile"
              @remove="handleRemoveFile"
            >
              <el-button
                class="upload-button"
                data-testId="ethicVoteForm__upload__button"
                type="text"
                :disabled="isAppendixLoading || reviewMode || ethicVoteForm.isDone"
              >
                {{ $t('proposal.chooseAFile') }}
                <template #icon>
                  <el-icon class="bi-paperclip"></el-icon>
                </template>
              </el-button>
            </FdpgUpload>
          </FdpgFormItem>
        </el-col>
        <el-col :sm="24">
          <FdpgFormItem v-if="uploadsForType.length" prop="userProject.ethicVote.admitReputationOfAttachment">
            <el-checkbox
              v-model="ethicVoteForm.admitReputationOfAttachment"
              :size="FdpgInputSize.Small"
              :disabled="reviewMode || ethicVoteForm.isDone"
              data-testId="ethicVoteForm__admit__check"
              class="fdpg-checkbox"
              name="admitReputationOfAttachment"
            >
              {{ $t('proposal.admitReputationOfAttachment') }}</el-checkbox
            >
          </FdpgFormItem>
        </el-col>
      </template>
      <template v-else>
        <el-col :sm="24">
          <FdpgLabel html-for="proposal.appendix" />
          <p v-if="!reviewMode">
            {{
              proposalId
                ? $t('proposal.pleaseAttachProofOfTheEthicsVoteToTheApplication')
                : $t('proposal.attachmentsOnlyAfterSavingHint')
            }}
          </p>
          <FdpgUpload
            v-if="proposalId"
            data-testId="ethicVoteForm__upload__notRequired"
            accept=".pdf, .doc, .docx"
            :file-list="secondUploadFiles"
            :is-loading="secondUploadLoading"
            :is-disabled="reviewMode || ethicVoteForm.isDone"
            :proposal-id="proposalId"
            empty-alert-text="proposal.noEthicVotesYet"
            @change="secondUpload.handleUploadFile"
            @remove="secondUpload.handleRemoveFile"
          >
            <el-button
              class="upload-button"
              data-testId="ethicVoteForm__upload__notRequired__button"
              type="text"
              :disabled="secondUploadLoading || reviewMode || ethicVoteForm.isDone"
            >
              {{ $t('proposal.chooseAFile') }}
              <template #icon>
                <el-icon class="bi-paperclip"></el-icon>
              </template>
            </el-button>
          </FdpgUpload>
        </el-col>
      </template>
    </el-row>
  </el-card>

  <TaskViewer :object-id="ethicVoteForm._id" />
</template>

<script setup lang="ts">
import FdpgDatePicker from '@/components/FdpgDatePicker.vue'
import FdpgFormItem from '@/components/FdpgFormItem.vue'
import FdpgInput from '@/components/FdpgInput.vue'
import FdpgLabel from '@/components/FdpgLabel.vue'
import FdpgRadio from '@/components/FdpgRadio.vue'
import FdpgUpload from '@/components/FdpgUpload.vue'
import TaskViewer from '@/components/TaskViewer/TaskViewer.vue'
import useNotifications from '@/composables/use-notifications'
import useUpload from '@/composables/use-upload'
import { FdpgInputSize } from '@/types/component.types'
import { useProposalStore } from '@/stores/proposal/proposal.store'
import type { IEthicVote, IReportFile, IUpload } from '@/types/proposal.types'
import { DirectUpload } from '@/types/upload.types'
import { transformEthicVote } from '@/utils/form-transform/transform-user-project.util'
import { useVModel } from '@vueuse/core'
import { computed, watch, type PropType } from 'vue'

const props = defineProps({
  modelValue: {
    type: Object as PropType<IEthicVote>,
    required: true,
  },

  reviewMode: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:modelValue'])
const proposalStore = useProposalStore()
const proposalId = computed(() => proposalStore.currentProposal?._id as string)

const ethicVoteForm = useVModel(props, 'modelValue', emit)

const { showErrorMessage } = useNotifications()

const { uploadsForType, handleUploadFile, handleRemoveFile, handleRemoveAllOfType, isAppendixLoading } = useUpload(
  proposalId,
  [DirectUpload.EthicVote],
  showErrorMessage,
)

const secondUpload = useUpload(proposalId, [DirectUpload.EthicVoteDeclarationOfNonResponsibility], showErrorMessage)
const secondUploadLoading = secondUpload.isAppendixLoading
const secondUploadFiles = secondUpload.uploadsForType
watch(
  () => ethicVoteForm.value.isExisting,
  async (isExisting) => {
    ethicVoteForm.value = transformEthicVote({
      _id: ethicVoteForm.value._id,
      isDone: ethicVoteForm.value.isDone,
      isExisting,
    }) as IEthicVote
    if (isExisting) {
      await secondUpload.handleRemoveAllOfType()
    } else {
      await handleRemoveAllOfType()
    }
  },
)
</script>
<style lang="scss" scoped>
.form__item--width {
  width: 100%;
}
</style>
