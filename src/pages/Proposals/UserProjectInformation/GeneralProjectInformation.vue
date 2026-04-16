<template>
  <FdpgLabel size="medium" class="form-label-mt-4" html-for="proposal.generalProjectInformation" />
  <el-card class="form-group">
    <el-row :gutter="20">
      <el-col :sm="24">
        <FdpgFormItem prop="userProject.generalProjectInformation.projectTitle">
          <FdpgLabel required html-for="proposal.projectTitle" info="proposal.projectTitleInfo" />
          <FdpgInput
            v-model="generalProjectInformationForm.projectTitle"
            data-testId="generalProjectInformationForm.projectTitle"
            placeholder="proposal.pleaseEnterTheProjectTitle"
            :disabled="reviewMode || generalProjectInformationForm.isDone"
          />
        </FdpgFormItem>
      </el-col>
      <el-col :sm="24" :md="12" v-if="!isRegisteringForm">
        <FdpgFormItem
          prop="userProject.generalProjectInformation.desiredStartTimeType"
          data-testId="generalProjectInformationForm.desiredStartTimeType"
        >
          <FdpgLabel html-for="proposal.desiredStartTime" />
          <el-radio-group
            v-model="generalProjectInformationForm.desiredStartTimeType"
            data-testId="generalProjectInformationForm.desiredStartTimeType"
            :disabled="reviewMode || generalProjectInformationForm.isDone"
            @change="handleStartTimeTypeChange"
          >
            <FdpgRadio
              v-for="option in ['immediate', 'later']"
              :key="`checklist-option-${option}`"
              :value="option"
              :label="'proposal.desiredStartTime_' + option"
            />
          </el-radio-group>
        </FdpgFormItem>
      </el-col>
      <el-col :sm="24" :md="12" v-if="!isRegisteringForm">
        <FdpgFormItem
          v-if="generalProjectInformationForm.desiredStartTimeType === 'later'"
          prop="userProject.generalProjectInformation.desiredStartTime"
          data-testId="generalProjectInformationForm.desiredStartTime"
        >
          <FdpgLabel required html-for="proposal.desiredStartTime" />

          <FdpgDatePicker
            v-model="generalProjectInformationForm.desiredStartTime"
            data-testId="generalProjectInformationForm.desiredStartTime"
            placeholder="proposal.pleaseEnterTheStartTime"
            :min-date="limitedStartDate"
            :disabled="reviewMode || generalProjectInformationForm.isDone"
          />
        </FdpgFormItem>
      </el-col>

      <el-col :sm="24" :md="12" v-if="isRegisteringForm">
        <FdpgFormItem prop="registerInfo.startTime" data-testId="registerInfoForm.startTime">
          <FdpgLabel required html-for="registeringForm.startTime" />
          <FdpgDatePicker
            v-model="registerInfoForm.startTime"
            data-testId="registerInfoForm.startTime"
            placeholder="proposal.pleaseEnterTheStartTime"
            :disabled="reviewMode || registerInfoForm.isDone"
          />
        </FdpgFormItem>
      </el-col>
      <el-col :sm="24" :md="12">
        <FdpgFormItem prop="userProject.generalProjectInformation.keywords">
          <FdpgLabel html-for="proposal.keywords" :required="isRegisteringForm" />
          <el-input-tag
            v-model="generalProjectInformationForm.keywords"
            class="fdpg-input__tag"
            data-testId="generalProjectInformationForm.keywords"
            :disabled="reviewMode || generalProjectInformationForm.isDone"
            :placeholder="t('proposal.keywordsPlaceholder')"
            :validate-event="false"
            aria-label="Please click the Enter key after input"
          />
        </FdpgFormItem>
      </el-col>
      <el-col :sm="24" :md="12">
        <FdpgFormItem prop="userProject.generalProjectInformation.projectDuration">
          <FdpgLabel required info="proposal.projectDurationInfo" html-for="proposal.projectDuration" />
          <FdpgNumberInput
            v-model="generalProjectInformationForm.projectDuration"
            data-testId="generalProjectInformationForm.projectDuration"
            placeholder="proposal.pleaseEnterTheNumberOfMonths"
            :disabled="reviewMode || generalProjectInformationForm.isDone"
          />
        </FdpgFormItem>
      </el-col>
      <el-col :sm="24">
        <FdpgFormItem prop="userProject.generalProjectInformation.projectFunding">
          <FdpgLabel required html-for="proposal.projectFunding" />

          <FdpgTextEditor
            ref="projectFundingEditor"
            v-model="generalProjectInformationForm.projectFunding"
            :disabled="reviewMode || generalProjectInformationForm.isDone"
            data-testId="generalProjectInformation.projectFunding"
            :form-ref="formRef"
            field-path="userProject.generalProjectInformation.projectFunding"
            :maxLength="10_000"
          />
        </FdpgFormItem>
      </el-col>
      <el-col :sm="24">
        <FdpgFormItem prop="userProject.generalProjectInformation.fundingReferenceNumber">
          <FdpgLabel html-for="proposal.fundingReferenceNumber" />
          <FdpgInput
            v-model="generalProjectInformationForm.fundingReferenceNumber"
            data-testId="generalProjectInformationForm.fundingReferenceNumber"
            placeholder="proposal.pleaseEnterTheFundingReferenceNumber"
            :disabled="reviewMode || generalProjectInformationForm.isDone"
          />
        </FdpgFormItem>
      </el-col>

      <!-- Register-specific fields -->
      <template v-if="isRegisteringForm">
        <el-col :sm="24">
          <FdpgFormItem prop="registerInfo.projectCategory">
            <FdpgLabel required html-for="registeringForm.projectCategory" />
            <FdpgSelect
              v-model="registerInfoForm.projectCategory"
              data-testId="registerInfoForm.projectCategory"
              placeholder="registeringForm.pleaseSelectProjectCategory"
              :disabled="reviewMode || generalProjectInformationForm.isDone"
              :options="projectCategories"
              style="width: 100%"
            />
          </FdpgFormItem>
        </el-col>
        <el-col :sm="24">
          <FdpgFormItem prop="registerInfo.legalBasis">
            <div class="fdpg-checkbox-wrapper">
              <el-checkbox
                v-model="registerInfoForm.legalBasis"
                class="fdpg-checkbox"
                :disabled="isDisabled"
                name="legalBasis"
                data-testId="legalBasis"
                size="small"
              />
              {{ t('proposal.updateAdditionalLocationLegalBasis') }}
            </div>
          </FdpgFormItem>
        </el-col>
        <el-col :sm="24">
          <FdpgFormItem prop="registerInfo.projectUrl">
            <FdpgLabe html-for="proposal.projectUrl" />
            <FdpgInput
              v-model="registerInfoForm.projectUrl"
              data-testId="registerInfoForm.projectUrl"
              :disabled="reviewMode || registerInfoForm.isDone"
              placeholder="proposal.pleaseEnterTheProjectUrl"
            />
          </FdpgFormItem>
        </el-col>
        <el-col :lg="24">
          <FdpgLabel html-for="proposal.projectLogo" />
          <FdpgUpload
            v-if="proposalId"
            data-test-id="general-appendix__upload"
            :accept="SupportedMimeType"
            :file-list="uploadsForType"
            :is-loading="isAppendixLoading"
            :proposal-id="proposalId"
            @change="handleUploadFile"
            @remove="handleRemoveFile"
            :isDisabled="isReviewMode || isAppendixLoading"
          >
            <el-button
              class="upload-button"
              link
              :disabled="isAppendixLoading || isReviewMode"
              data-test-id="general-appendix__upload__button"
            >
              {{ t('proposal.chooseAFile') }}
              <template #icon>
                <el-icon class="bi-paperclip"></el-icon>
              </template>
            </el-button>
          </FdpgUpload>
        </el-col>
      </template>
    </el-row>
  </el-card>

  <TaskViewer :object-id="generalProjectInformationForm._id" />
</template>

<script setup lang="ts">
import FdpgDatePicker from '@/components/FdpgDatePicker.vue'
import FdpgFormItem from '@/components/FdpgFormItem.vue'
import FdpgTextEditor from '@/components/FdpgTextEditor.vue'
import FdpgLabel from '@/components/FdpgLabel.vue'
import FdpgNumberInput from '@/components/FdpgNumberInput.vue'
import FdpgInput from '@/components/FdpgInput.vue'
import FdpgSelect from '@/components/FdpgSelect.vue'
import TaskViewer from '@/components/TaskViewer/TaskViewer.vue'
import type { IGeneralProjectInformation, IProposal } from '@/types/proposal.types'
import { useVModel } from '@vueuse/core'
import type { FormInstance } from 'element-plus'
import type { PropType } from 'vue'
import { ref, watch, computed, onMounted } from 'vue'
import useNotifications from '@/composables/use-notifications'
import { useI18n } from 'vue-i18n'
import useUpload from '@/composables/use-upload'
import { DirectUpload } from '@/types/upload.types'

const props = defineProps({
  modelValue: {
    type: Object as PropType<IGeneralProjectInformation>,
    required: true,
  },
  registerInfo: {
    type: Object as PropType<IProposal['registerInfo']>,
    required: false,
    default: () => ({}),
  },
  formRef: {
    type: Object as PropType<FormInstance>,
    required: false,
    default: () => undefined,
  },
  reviewMode: {
    type: Boolean,
    default: false,
  },
  isRegisteringForm: {
    type: Boolean,
    default: false,
  },
  proposalId: {
    type: String as PropType<string | undefined>,
    required: false,
    default: undefined,
  },
})

const { showInfoMessage } = useNotifications()
const { t } = useI18n()

const emit = defineEmits(['update:modelValue', 'update:registerInfo'])

const generalProjectInformationForm = useVModel(props, 'modelValue', emit)
const registerInfoForm = useVModel(props, 'registerInfo', emit, { eventName: 'update:registerInfo' })
const projectFundingEditor = ref()

const projectCategories = computed(() => [
  { value: 'category1', label: t('registeringForm.registerForm_projectCategory1') },
  { value: 'category2', label: t('registeringForm.registerForm_projectCategory2') },
  { value: 'category3', label: t('registeringForm.registerForm_projectCategory3') },
  { value: 'category4', label: t('registeringForm.registerForm_projectCategory4') },
  { value: 'category5', label: t('registeringForm.registerForm_projectCategory5') },
  { value: 'category6', label: t('registeringForm.registerForm_projectCategory6') },
  { value: 'category7', label: t('registeringForm.registerForm_projectCategory7') },
  { value: 'category8', label: t('registeringForm.registerForm_projectCategory8') },
  { value: 'category9', label: t('registeringForm.registerForm_projectCategory9') },
  { value: 'category10', label: t('registeringForm.registerForm_projectCategory10') },
])

const limitedStartDate = computed(() => {
  return new Date()
})
const proposalId = computed(() => props.proposalId as string)
const isDisabled = computed(() => props.reviewMode || generalProjectInformationForm.value.isDone)
const isReviewMode = computed(() => props.reviewMode || generalProjectInformationForm.value.isDone)
const { showErrorMessage } = useNotifications()
const SupportedMimeType = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp'].toString()

const { uploadsForType, handleUploadFile, handleRemoveFile, isAppendixLoading } = useUpload(
  proposalId,
  [DirectUpload.ProjectLogo],
  showErrorMessage,
)

watch(
  () => [generalProjectInformationForm.value.desiredStartTime, props.reviewMode],
  ([desiredStartTime, reviewMode]) => {
    if (!desiredStartTime || reviewMode || props.isRegisteringForm) {
      return
    }
    const startTimestamp = new Date(desiredStartTime as unknown as string).getTime()
    const isValidDate = !Number.isNaN(startTimestamp)
    const now = Date.now()

    if (!reviewMode && isValidDate && startTimestamp < now) {
      generalProjectInformationForm.value.desiredStartTime = ''
      generalProjectInformationForm.value.desiredStartTimeType = 'immediate'
      showInfoMessage(t('proposal.autoDesiredStartDateAdjustment'))
    }
  },
  { immediate: true },
)

const handleStartTimeTypeChange = (newValue: string) => {
  if (newValue === 'immediate') {
    generalProjectInformationForm.value.desiredStartTime = ''
    setTimeout(() => {
      if (props.formRef) {
        props.formRef.validateField('userProject.generalProjectInformation.desiredStartTime')
      }
    }, 0)
  }
}
</script>
<style lang="scss" scoped>
@use '@/assets/sass/variable' as *;
.fdpg-input__tag {
  height: 59px;
  color: $black;
  padding: 0 11px;
  font-size: 18px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  font-family: 'Titillium Web', serif;
  border: 0.5px solid $gray-700;
}
</style>
