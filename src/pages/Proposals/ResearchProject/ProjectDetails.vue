<template>
  <FdpgLabel required html-for="proposal.projectDetails" size="medium" />
  <el-card class="form-group">
    <el-row>
      <el-col :sm="24">
        <FdpgFormItem prop="userProject.projectDetails.simpleProjectDescription" v-if="isMIISelected">
          <FdpgLabel html-for="proposal.simpleProjectDescription" />
          <FdpgtextEditor
            v-model="projectDetailsForm.simpleProjectDescription"
            data-testId="projectDetailsForm.simpleProjectDescription"
            :placeholder="t('proposal.describeTheProject')"
            :disabled="reviewMode || projectDetailsForm.isDone"
            :form-ref="formRef"
            field-path="userProject.projectDetails.simpleProjectDescription"
          />
        </FdpgFormItem>
        <FdpgFormItem prop="userProject.projectDetails.executiveSummaryUac" v-if="isMIISelected">
          <FdpgLabel html-for="proposal.executiveSummaryUac" />
          <FdpgtextEditor
            v-model="projectDetailsForm.executiveSummaryUac"
            data-testId="projectDetailsForm.executiveSummaryUac"
            :placeholder="t('proposal.describeTheProject')"
            :disabled="reviewMode || projectDetailsForm.isDone"
            :form-ref="formRef"
            field-path="userProject.projectDetails.executiveSummaryUac"
          />
        </FdpgFormItem>
      </el-col>
      <el-col :sm="24">
        <FdpgFormItem prop="userProject.projectDetails.department" v-if="isMIISelected">
          <FdpgLabel html-for="proposal.department" />
          <FdpgSelect
            v-model="projectDetailsForm.department"
            multiple
            filterable
            data-testId="projectDetailsForm.department"
            test-id-extension="__projectDetailsForm.department"
            placeholder="proposal.selectASubjectArea"
            :options="departments"
            :disabled="reviewMode || projectDetailsForm.isDone"
          />
        </FdpgFormItem>
      </el-col>
      <el-col :sm="24">
        <FdpgFormItem prop="userProject.projectDetails.hypothesisAndQuestionProjectGoals">
          <FdpgLabel
            html-for="proposal.hypothesisAndQuestionProjectGoals"
            info="proposal.hypothesisAndQuestionProjectGoalsInfo"
          />
          <FdpgtextEditor
            v-model="projectDetailsForm.hypothesisAndQuestionProjectGoals"
            data-testId="projectDetailsForm.hypothesisAndQuestionProjectGoals"
            :placeholder="t('proposal.indicationOrRepresentationOfAimsObjectives')"
            :disabled="reviewMode || projectDetailsForm.isDone"
            :form-ref="formRef"
            field-path="userProject.projectDetails.hypothesisAndQuestionProjectGoals"
          />
        </FdpgFormItem>
        <p class="example">{{ t('proposal.egAccordingToOrFromAbstract') }}</p>
      </el-col>
      <el-col :sm="24">
        <FdpgFormItem prop="userProject.projectDetails.scientificBackground">
          <FdpgLabel html-for="proposal.scientificBackground" />
          <FdpgtextEditor
            v-model="projectDetailsForm.scientificBackground"
            data-testId="projectDetailsForm.scientificBackground"
            :placeholder="t('proposal.publicationsOnTheSubject')"
            :disabled="reviewMode || projectDetailsForm.isDone"
            :form-ref="formRef"
            field-path="userProject.projectDetails.scientificBackground"
          />
        </FdpgFormItem>
      </el-col>
      <el-col :sm="24">
        <FdpgFormItem prop="userProject.projectDetails.materialAndMethods">
          <FdpgLabel html-for="proposal.materialAndMethods" />
          <FdpgtextEditor
            v-model="projectDetailsForm.materialAndMethods"
            data-testId="projectDetailsForm.materialAndMethods"
            :placeholder="t('proposal.describeTheMaterialsAndMethods')"
            :disabled="reviewMode || projectDetailsForm.isDone"
            :form-ref="formRef"
            field-path="userProject.projectDetails.materialAndMethods"
          />
        </FdpgFormItem>
      </el-col>
      <el-col :sm="24">
        <FdpgFormItem prop="userProject.projectDetails.literature">
          <FdpgLabel html-for="proposal.literature" />
          <FdpgtextEditor
            v-model="projectDetailsForm.literature"
            data-testId="projectDetailsForm.literature"
            :placeholder="t('proposal.literaturePlaceholder')"
            :disabled="reviewMode || projectDetailsForm.isDone"
            :form-ref="formRef"
            field-path="userProject.projectDetails.literature"
          />
        </FdpgFormItem>
      </el-col>
      <el-col :sm="24">
        <FdpgFormItem prop="userProject.projectDetails.biometric">
          <FdpgLabel html-for="proposal.biometric" />
          <FdpgtextEditor
            v-model="projectDetailsForm.biometric"
            data-testId="projectDetailsForm.biometric"
            :placeholder="t('proposal.biometricPlaceholder')"
            :disabled="reviewMode || projectDetailsForm.isDone"
            :form-ref="formRef"
            field-path="userProject.projectDetails.biometric"
          />
        </FdpgFormItem>
      </el-col>
      <el-col :sm="24">
        <FdpgFormItem prop="userProject.projectDetails.additionalDocument">
          <FdpgLabel html-for="" size="large" class="form__item--width">{{
            $t('proposal.additionalDocument') + (uploadsForType.length ? `(${uploadsForType.length})` : '')
          }}</FdpgLabel>

          <FdpgUpload
            v-if="proposalId"
            data-test-id="additional-document__upload"
            :accept="SupportedMimetype"
            :file-list="uploadsForType"
            :is-loading="isAdditionalLoading"
            :is-disabled="reviewMode"
            :proposal-id="proposalId"
            @change="handleUploadFile"
            @remove="handleRemoveFile"
            class="form__item--width"
          >
            <el-button
              class="upload-button"
              link
              :disabled="isAdditionalLoading || reviewMode || projectDetailsForm.isDone"
              data-test-id="additional-document__upload__button"
            >
              {{ $t('proposal.chooseAFile') }}
              <template #icon>
                <el-icon class="bi-paperclip"></el-icon>
              </template>
            </el-button>
          </FdpgUpload>
        </FdpgFormItem>
      </el-col>
    </el-row>
  </el-card>

  <TaskViewer :object-id="projectDetailsForm._id" />
</template>

<script setup lang="ts">
import FdpgFormItem from '@/components/FdpgFormItem.vue'
import FdpgLabel from '@/components/FdpgLabel.vue'
import FdpgSelect from '@/components/FdpgSelect.vue'
import TaskViewer from '@/components/TaskViewer/TaskViewer.vue'
import { Department } from '@/types/department.enum'
import type { IProjectDetails } from '@/types/proposal.types'
import { useVModel } from '@vueuse/core'
import type { PropType } from 'vue'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import FdpgtextEditor from '@/components/FdpgTextEditor.vue'
import type { FormInstance } from 'element-plus'
import ESupportedMimetype from '@/types/supported-mimetype.enum'
import useUpload from '@/composables/use-upload'
import { DirectUpload } from '@/types/upload.types'
import useNotifications from '@/composables/use-notifications'
import { pl } from 'element-plus/es/locale'
import { platform } from 'os'
import { PlatformIdentifier } from '@/types/platform-identifier.enum'

const props = defineProps({
  modelValue: {
    type: Object as PropType<IProjectDetails>,
    required: true,
  },
  reviewMode: {
    type: Boolean,
    default: false,
  },
  formRef: {
    type: Object as PropType<FormInstance>,
    required: false,
    default: () => undefined,
  },
  proposalId: {
    type: String,
  },
  platform: {
    type: Array as PropType<PlatformIdentifier[]>,
    required: true,
  },
})

const emit = defineEmits(['update:modelValue'])

const { t } = useI18n()
const { showErrorMessage } = useNotifications()

const departments = computed(() =>
  Object.values(Department).map((value) => ({ label: t(`departments.${value}`), value })),
)
const SupportedMimetype = computed(() => {
  return Object.values(ESupportedMimetype).join(',')
})

const proposalIdRef = computed(() => props.proposalId || '')

const isMIISelected = computed(() => {
  return props.platform.includes(PlatformIdentifier.Mii)
})

const {
  uploadsForType,
  handleUploadFile,
  handleRemoveFile,
  isAppendixLoading: isAdditionalLoading,
} = useUpload(proposalIdRef, [DirectUpload.AdditionalDocument], showErrorMessage)

const projectDetailsForm = useVModel(props, 'modelValue', emit)
</script>
<style scoped lang="scss">
.form__item--width {
  width: 100%;
}
</style>
