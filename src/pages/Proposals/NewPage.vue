<template>
  <el-container class="fdpg-new-proposal-page">
    <LeadHeader />
    <div class="lead align-right">
      <div>
        <el-button
          v-if="!proposalStore.currentProposal || !isReviewMode"
          @click="handleSaveDraft"
          data-test-id="saveDraft"
          type="primary"
          size="large"
          link
        >
          <img src="@/assets/img/proposal/save.svg" alt="save btn" />
        </el-button>
        <el-button type="primary" link @click="toggleShoppingList" data-test-id="shoppingList">
          <el-badge :value="proposalForm?.selectedDataSources.length" class="item">
            <i class="fa-solid fa-rectangle-list"></i>
          </el-badge>
        </el-button>
      </div>
    </div>

    <div class="form-container">
      <el-form v-if="proposalForm" ref="formRef" :model="proposalForm" :rules="rules" @validate="onValidate">
        <div v-show="activeStep === CreatPrposalSteps.DataSources">
          <div class="form-group">
            <el-row>
              <el-col :sm="18" :md="12" :lg="6">
                <FdpgFormItem prop="projectAbbreviation">
                  <FdpgLabel required info="proposal.projectAbbreviationInfo" html-for="proposal.projectAbbreviation" />
                  <FdpgInput
                    v-model="proposalForm.projectAbbreviation"
                    data-test-id="proposalForm.projectAbbreviation"
                    placeholder="proposal.egWestStorm"
                    :disabled="isReviewMode"
                  />
                </FdpgFormItem>
              </el-col>
              <el-col :sm="24">
                <DataSourceSelection
                  v-model="proposalForm.selectedDataSources"
                  :proposal-id="proposalForm._id"
                ></DataSourceSelection>
              </el-col>
            </el-row>
          </div>
        </div>

        <div v-show="activeStep === CreatPrposalSteps.Variables">
          <DIFEVariableSelection
            v-model="proposalForm.userProject.variableSelection"
            :platform="platform"
            :review-mode="isReviewMode"
            :form-ref="formRef"
            v-if="isDifeSelected"
          />
          <FdpgLabel html-for="proposal.MII" v-if="isMIISelected" size="large"></FdpgLabel>

          <RequestedData
            v-model="proposalForm.requestedData"
            :review-mode="isReviewMode"
            v-if="isMIISelected && !isRegisteringForm"
          />
          <MiiVariableSelection v-if="isMIISelected" />

          <TaskViewer :object-id="proposalForm.userProject?.variableSelection?._id" />

          <ProjectAddresses
            v-model="proposalForm.userProject.addressees"
            :review-mode="isReviewMode"
            v-if="isMIISelected"
          />

          <FdpgFormItem class="form-label-mb-3" v-if="isMIISelected">
            <FdpgLabel html-for="proposal.typeOfUse" size="medium" />

            <el-checkbox-group
              v-model="proposalForm.userProject.typeOfUse.usage"
              data-testId="typeOfUseForm.usage"
              :disabled="isReviewMode"
            >
              <FdpgCheckbox
                value="BIOSAMPLE"
                label="proposal.typeOfUse_BIOSAMPLE"
                info="proposal.typeOfUse_BIOSAMPLE_Info"
              />
            </el-checkbox-group>
          </FdpgFormItem>

          <InformationOnBioSample
            v-if="hasBiosamples && isMIISelected"
            v-model="proposalForm.userProject.informationOnRequestedBioSamples"
            :review-mode="isReviewMode"
            :form-ref="formRef"
          />
        </div>

        <div v-show="activeStep === CreatPrposalSteps.Casesohort">
          <DifeSelectionOfCases
            v-if="isDifeSelected"
            v-model="proposalForm.userProject.selectionOfCases.difeSelectionOfCases"
            :review-mode="isReviewMode"
          />
          <MiiCohortSelection
            v-if="isMIISelected"
            v-model="proposalForm.userProject.cohorts"
            :review-mode="isReviewMode"
            :form-ref="formRef"
            :uploads="proposalForm.uploads"
            :requestedDataForm="proposalForm.requestedData"
            @update:requestedDataForm="
              (value) => {
                if (proposalForm) {
                  proposalForm.requestedData = value
                }
              }
            "
          />

          <TaskViewer :object-id="proposalForm.userProject?.selectionOfCases?._id" />
        </div>

        <div v-show="activeStep === CreatPrposalSteps.DataUsage">
          <TypeOfUse
            v-model="proposalForm.userProject.typeOfUse"
            :review-mode="isReviewMode"
            :form-ref="formRef"
            :platform="platform"
          />
          <ProjectRecontact
            v-model="proposalForm.userProject.resourceAndRecontact"
            :review-mode="isReviewMode"
            v-if="isMIISelected"
          />

          <TargetFormat
            v-if="isMIISelected"
            :platform="platform"
            v-model="proposalForm.userProject.typeOfUse"
            :review-mode="isReviewMode"
            :form-ref="formRef"
          />
        </div>

        <div v-show="activeStep === CreatPrposalSteps.ProjectDetails">
          <FdpgLabel html-for="proposal.informationAboutTheUserProject" size="large" />
          <UserProjectInformation
            v-model="proposalForm.userProject"
            :form-ref="formRef"
            :file-list="fileList"
            :review-mode="isReviewMode"
            :platform="platform"
            :is-registering-form="isRegisteringForm"
          />
        </div>

        <div v-show="activeStep === CreatPrposalSteps.ProjectParticipants">
          <FdpgLabel size="large" html-for="proposal.applicant" />
          <ProjectApplicant v-model="proposalForm.applicant" :form-ref="formRef" :review-mode="isReviewMode" />

          <FdpgLabel
            required
            size="large"
            html-for="proposal.projectResponsible"
            info="proposal.projectResponsibleInfo"
          />
          <ProjectResponsibility
            v-model="proposalForm.projectResponsible"
            :form-ref="formRef"
            :review-mode="isReviewMode"
          />
          <ProjectUser v-model="proposalForm.projectUser" :form-ref="formRef" :review-mode="isReviewMode" />

          <FdpgLabel
            info="proposal.participatingScientistsInfo"
            size="large"
            html-for="proposal.participatingScientists"
          />
          <ParticipatingScientists
            v-model="proposalForm.participants"
            :form-ref="formRef"
            :review-mode="isReviewMode"
          />
        </div>

        <div v-show="activeStep === CreatPrposalSteps.ResearchProject">
          <ProjectDetails
            v-model="proposalForm.userProject.projectDetails"
            :requestedData="proposalForm.requestedData"
            :review-mode="isReviewMode"
            :form-ref="formRef"
            :proposalId="proposalId"
            :platform="platform"
          />
          <EthicVote
            v-model="proposalForm.userProject.ethicVote"
            :review-mode="isReviewMode"
            :form-ref="formRef"
            v-if="isMIISelected"
          />
          <FdpgLabel html-for="" size="large">{{
            t('proposal.attachmentsOptional') + (uploadsForType.length ? `(${uploadsForType.length})` : '')
          }}</FdpgLabel>
          <p class="desc">
            {{
              proposalId
                ? t('proposal.pleaseUploadAdditionalAttachmentsHere')
                : t('proposal.attachmentsOnlyAfterSavingHint')
            }}
          </p>

          <FdpgUpload
            v-if="proposalId"
            data-test-id="general-appendix__upload"
            :accept="SupportedMimetype"
            :file-list="uploadsForType"
            :is-loading="isAppendixLoading"
            :is-disabled="isReviewMode"
            :proposal-id="proposalId"
            @change="handleUploadFile"
            @remove="handleRemoveFile"
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
        </div>
        <ShoppingList v-model="proposalForm.selectedDataSources" />
      </el-form>
    </div>

    <el-row class="action-wrapper">
      <el-col :span="12">
        <el-button type="primary" plain data-test-id="prevStep" @click="prevStep">{{
          t('proposal.prevStep')
        }}</el-button>
      </el-col>
      <el-col :span="12" class="text-right">
        <el-button
          type="primary"
          data-test-id="nextStep"
          @click="nextStep"
          :disabled="!proposalForm?.selectedDataSources?.length || !proposalId"
          v-if="activeStep !== CreatPrposalSteps.ResearchProject"
          >{{ t('proposal.nextStep') }}</el-button
        >
        <el-button
          type="primary"
          data-test-id="handleSubmit"
          @click="handleSubmit"
          v-else-if="!proposalStore.currentProposal || !isReviewMode"
          >{{ t('proposal.submitApplication') }}</el-button
        >
      </el-col>
    </el-row>
  </el-container>

  <SubmissionDialog
    v-model="isSubmissionDialogOpen"
    @confirm="handleTermsConfirm"
    :isValidToSubmit="isValidToSubmit"
    :platform="platform"
    @saveDraft="handleSaveDraft"
    @exportPdf="handleExportProposalPdfClick"
  ></SubmissionDialog>
</template>

<script setup lang="ts">
import FdpgFormItem from '@/components/FdpgFormItem.vue'
import FdpgInput from '@/components/FdpgInput.vue'
import FdpgLabel from '@/components/FdpgLabel.vue'
import FdpgUpload from '@/components/FdpgUpload.vue'
import useNotifications from '@/composables/use-notifications'
import useUpload from '@/composables/use-upload'
import ParticipatingScientists from '@/pages/Proposals/ParticipatingScientists/ParticipatingScientists.vue'
import RequestedData from '@/pages/Proposals/RequestedData.vue'
import UserProjectInformation from '@/pages/Proposals/UserProjectInformation/UserProjectInformation.vue'
import { useAuthStore } from '@/stores/auth/auth.store'
import { useCommentStore } from '@/stores/comment/comment.store'
import { useLayoutStore } from '@/stores/layout.store'
import { useProposalStore } from '@/stores/proposal/proposal.store'
import { Role } from '@/types/oidc.types'
import { PlatformIdentifier } from '@/types/platform-identifier.enum'
import type { IProposal } from '@/types/proposal.types'
import { ProposalStatus, ProposalTypeOfUse } from '@/types/proposal.types'
import { RouteName } from '@/types/route-name.enum'
import { DirectUpload } from '@/types/upload.types'
import { getLastDashboardTitle } from '@/utils/breadcrumbs.util'
import { transformForm } from '@/utils/form-transform'
import * as ProposalPermissions from '@/utils/proposal-permissions.util'
import {
  maxLengthValidationFunc,
  numberValidationFunc,
  projectAbbreviationValidationFunc,
  requiredIfEmptyValidationFunc,
  requiredUploadFunc,
  requiredValidationFunc,
  specialCharactersValidationFunc,
} from '@/validations'
import type { ValidateFieldsError } from 'async-validator'
import { ElButton, ElCol, ElForm, type FormInstance, type FormItemProp } from 'element-plus'
import type { PropType } from 'vue'
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import ProjectApplicant from './ProjectApplicant.vue'
import ProjectResponsibility from './ProjectResponsibility.vue'
import ProjectUser from './ParticipatingScientists/ProjectUser.vue'
import ESupportedMimetype from '@/types/supported-mimetype.enum'
import { CommentType, type ICommentDetail } from '@/types/comment.interface'
import { CreatPrposalSteps } from '@/types/create-proposal-steps.enum'
import TypeOfUse from './DataUsage/TypeOfUse.vue'
import ProjectDetails from './ResearchProject/ProjectDetails.vue'
import EthicVote from './ResearchProject/EthicVote.vue'
import ProjectAddresses from './Variables/ProjectAddresses.vue'
import InformationOnBioSample from './Variables/InformationOnBioSample/InformationOnBioSample.vue'
import DIFEVariableSelection from './Variables/DIFEVariableSelection.vue'
import DataSourceSelection from './DataSources/DataSourceSelection.vue'
import ShoppingList from './DataSources/ShoppingList.vue'
import TargetFormat from './DataUsage/TargetFormat.vue'
import ProjectRecontact from './DataUsage/ProjectRecontact.vue'
import SubmissionDialog from '@/components/SubmissionDialog.vue'
import TaskViewer from '@/components/TaskViewer/TaskViewer.vue'
import useDraftDownload from '@/composables/use-draft-download'

import MiiCohortSelection from './Casesohort/MiiCohortSelection.vue'
import DifeSelectionOfCases from './Casesohort/DifeSelectionOfCases.vue'
import MiiVariableSelection from './Variables/MiiVariableSelection.vue'
import { debounce } from 'lodash-es'

import LeadHeader from '@/components/Shared/LeadHeader.vue'
// Map each step to its corresponding form fields
const stepFieldsMap: Record<number, string[]> = {
  [CreatPrposalSteps.DataSources]: ['projectAbbreviation'],
  [CreatPrposalSteps.Variables]: [
    'requestedData.dataInfo',
    'userProject.variableSelection.DIFE.typeOfUse',
    'userProject.variableSelection.DIFE.typeOfUseExplanation',
    'userProject.informationOnRequestedBioSamples.laboratoryResources',
    'userProject.informationOnRequestedBioSamples.biosamples',
  ],
  [CreatPrposalSteps.Casesohort]: [
    'userProject.cohorts',
    'userProject.selectionOfCases.difeSelectionOfCases',
    'requestedData.patientInfo',
    'userProject.selectionOfCases.difeSelectionOfCases.selectedCases',
    'userProject.selectionOfCases.difeSelectionOfCases.otherExplanation',
  ],
  [CreatPrposalSteps.DataUsage]: [
    'userProject.typeOfUse.usage',
    'userProject.typeOfUse.dataPrivacyExtra',
    'userProject.resourceAndRecontact',
    'userProject.typeOfUse.difeUsage',
    'userProject.typeOfUse.PseudonymizationInfo',
  ],
  [CreatPrposalSteps.ProjectDetails]: [
    'userProject.generalProjectInformation.projectTitle',
    'userProject.generalProjectInformation.desiredStartTime',
    'userProject.generalProjectInformation.desiredStartTimeType',
    'userProject.generalProjectInformation.projectDuration',
    'userProject.generalProjectInformation.projectFunding',
    'userProject.generalProjectInformation.fundingReferenceNumber',
    'userProject.plannedPublication.publications',
  ],
  [CreatPrposalSteps.ProjectParticipants]: ['applicant', 'projectResponsible', 'projectUser', 'participants'],

  [CreatPrposalSteps.ResearchProject]: [
    'userProject.projectDetails.simpleProjectDescription',
    'userProject.projectDetails.department',
    'userProject.projectDetails.scientificBackground',
    'userProject.projectDetails.hypothesisAndQuestionProjectGoals',
    'userProject.projectDetails.materialAndMethods',
    'userProject.projectDetails.executiveSummaryUac',
    'userProject.ethicVote.ethicsCommittee',
    'userProject.ethicVote.ethicsVoteNumber',
    'userProject.ethicVote.voteFromDate',
    'userProject.ethicVote.ethicVoteUploads',
    'requestedData.desiredControlDataAmount',
    'requestedData.desiredDataAmount',
  ],
}

defineProps({
  userRole: {
    type: String as PropType<Role>,
    required: true,
  },
})

// Currently only one platform supported

const { t } = useI18n()

const layoutStore = useLayoutStore()
const commentStore = useCommentStore()
const router = useRouter()
const { params, query } = useRoute()

const proposalForm = ref<IProposal>()
const platform = computed(() => {
  return proposalForm.value?.selectedDataSources ?? [PlatformIdentifier.Mii]
})

const proposalId = computed(() => proposalForm.value?._id as string)
const ethicVoteUploads = computed(() =>
  proposalForm.value?.uploads?.filter((upload) => upload.type === DirectUpload.EthicVote),
)
const SupportedMimetype = computed(() => {
  return Object.values(ESupportedMimetype).join(',')
})
const proposalStore = useProposalStore()

const formRef = ref<FormInstance>()

const fileList = ref([])

const bypassDebounce = ref(false)
const isAutoSaving = ref(false)
const hasFormChanged = ref(false)

const isValidToSubmit = ref<boolean>(false)
const allFieldsValid = ref<boolean>(false)
const isSubmissionDialogOpen = ref(false)

const activeStep = computed(() => {
  return layoutStore.activeStep
})
const isRegisteringForm = computed(() => {
  return (
    router.currentRoute.value.name === RouteName.RegisterNewProject ||
    router.currentRoute.value.name === RouteName.RegisterProject
  )
})
const { showErrorMessage, showSuccessMessage } = useNotifications()
const { downloadFile, isDownloadLoading } = useDraftDownload(proposalId, showErrorMessage)

const { uploadsForType, handleUploadFile, handleRemoveFile, isAppendixLoading } = useUpload(
  proposalId,
  [DirectUpload.GeneralAppendix],
  showErrorMessage,
)
const rules = ref<Record<string, any>>({
  projectAbbreviation: [
    requiredValidationFunc('string'),
    specialCharactersValidationFunc(),
    projectAbbreviationValidationFunc(proposalId, bypassDebounce),
    maxLengthValidationFunc(25),
  ],
  participants: [
    /** Handled in component */
  ],
  projectUser: {
    projectUserType: [requiredValidationFunc('string')],
  },
  userProject: {
    generalProjectInformation: {
      projectTitle: [requiredValidationFunc('string'), maxLengthValidationFunc(10000)],
      desiredStartTime: [
        {
          validator: (_rule: any, value: string | undefined, callback: (error?: Error) => void) => {
            const isLater = proposalForm.value?.userProject.generalProjectInformation.desiredStartTimeType === 'later'
            if (isLater) {
              if (!value) {
                callback(new Error(t('general.requiredField')))
              } else {
                // Check if date is in the past
                const selectedDate = new Date(value)
                const today = new Date()
                today.setHours(0, 0, 0, 0)
                if (selectedDate < today) {
                  callback(new Error(t('general.startDateInPast')))
                } else {
                  callback()
                }
              }
            } else {
              callback()
            }
          },
          trigger: ['blur', 'change'],
        },
      ],
      projectDuration: [requiredValidationFunc('number'), numberValidationFunc()],
      projectFunding: [requiredValidationFunc('string'), maxLengthValidationFunc(10000)],
      fundingReferenceNumber: maxLengthValidationFunc(100),
      desiredStartTimeType: [requiredValidationFunc('string')],
      // Register-specific fields
      projectStart: isRegisteringForm.value ? [maxLengthValidationFunc(1000)] : [],
      projectCategory: isRegisteringForm.value ? [requiredValidationFunc('string')] : [],
      projectCatchphrases: isRegisteringForm.value ? [] : [],
      diagnoses: isRegisteringForm.value ? [] : [],
      procedures: isRegisteringForm.value ? [] : [],
    },
    feasibility: {
      details: [maxLengthValidationFunc(10000)],
    },
    projectDetails: {
      simpleProjectDescription: [requiredValidationFunc('string'), maxLengthValidationFunc(10000)],
      department: requiredValidationFunc('array'),
      scientificBackground: [requiredValidationFunc('string'), maxLengthValidationFunc(10000)],
      hypothesisAndQuestionProjectGoals: [requiredValidationFunc('string'), maxLengthValidationFunc(10000)],
      materialAndMethods: [requiredValidationFunc('string'), maxLengthValidationFunc(10000)],
      executiveSummaryUac: [requiredValidationFunc('string'), maxLengthValidationFunc(3000)],
      // Register-specific field - literature is already in the component
      literature: isRegisteringForm.value ? [maxLengthValidationFunc(10000)] : [],
    },
    ethicVote: {
      ethicsCommittee: [requiredValidationFunc('string'), maxLengthValidationFunc(10000)],
      ethicsVoteNumber: [requiredValidationFunc('string'), maxLengthValidationFunc(100)],
      voteFromDate: requiredValidationFunc(),
    },
    resourceAndRecontact: {
      hasEnoughResources: null,
      isRecontactingIntended: null,
    },
    propertyRights: {
      options: [maxLengthValidationFunc(10000)],
    },
    plannedPublication: {
      noPublicationPlanned: null,
      publications: [
        /** Handled in component */
      ],
    },
    addressees: {
      desiredLocations: requiredValidationFunc(),
    },
    typeOfUse: {
      usage: requiredValidationFunc('array'),
      dataPrivacyExtra: [maxLengthValidationFunc(10000)],
      difeUsage: requiredValidationFunc('array'),
    },
    informationOnRequestedBioSamples: {
      laboratoryResources: [requiredValidationFunc('string'), maxLengthValidationFunc(1000)],
      //rest Handled in component
    },
    variableSelection: {
      DIFE: {
        typeOfUse: requiredValidationFunc('string'),
        typeOfUseExplanation: [requiredValidationFunc('string'), maxLengthValidationFunc(10000)],
      },
    },
    selectionOfCases: {
      difeSelectionOfCases: {
        selectedCases: requiredValidationFunc('array'),
        otherExplanation: [requiredValidationFunc('string'), maxLengthValidationFunc(10000)],
      },
    },
    cohorts: {
      selectedCohorts: [],
    },
  },
  requestedData: {
    patientInfo: [requiredValidationFunc('string'), maxLengthValidationFunc(10000)],
    dataInfo: [requiredValidationFunc('string'), maxLengthValidationFunc(10000)],
    desiredDataAmount: requiredValidationFunc('number'),
    desiredControlDataAmount: [requiredValidationFunc('number')],
  },
  status: null,
})

// Helper function to check if proposal is in editable status
const isProposalEditable = () => {
  return ProposalPermissions.isProposalEditable(proposalForm.value)
}

// Comprehensive permission checks using utility functions
const proposalPermissions = computed(() => {
  if (!proposalForm.value) {
    return {
      isOwner: false,
      isParticipating: false,
      isResponsible: false,
      isEditor: false,
      hasEditingRights: false,
      canEdit: false,
      canSubmit: false,
      isReviewMode: true,
    }
  }

  return ProposalPermissions.getProposalPermissions(
    proposalForm.value,
    authStore.profile,
    proposalStore.currentProposal?.isParticipatingScientist,
  )
})

const isReviewMode = computed(() => {
  return proposalPermissions.value.isReviewMode
})
const isParticipatingScientist = computed(() => {
  return proposalStore.currentProposal?.isParticipatingScientist !== undefined
    ? proposalStore.currentProposal.isParticipatingScientist
    : false
})
const OpenProposalTasks = computed(() => {
  return commentStore.comments
    .filter((comment: ICommentDetail) => comment.type === CommentType.PROPOSAL_TASK)
    .filter((task: ICommentDetail) => !task.isDone)
})
const hasBiosamples = computed(() => {
  return proposalForm.value?.userProject.typeOfUse.usage?.includes(ProposalTypeOfUse.Biosample)
})
const isMIISelected = computed(() => {
  return platform?.value?.includes(PlatformIdentifier.Mii)
})
const isDifeSelected = computed(() => {
  return platform?.value?.includes(PlatformIdentifier.DIFE)
})

const getFormValues = () => {
  const formData = transformForm(proposalForm.value, true)

  // If MII is not selected, remove MII-specific fields
  if (!isMIISelected.value) {
    // Remove MII-specific fields
    delete formData.requestedData
    delete formData.userProject?.addressees
    delete formData.userProject?.resourceAndRecontact
    delete formData.userProject?.ethicVote
    delete formData.userProject?.informationOnRequestedBioSamples
    delete formData.userProject?.cohorts
    delete formData.userProject?.feasibility
    delete formData.userProject?.typeOfUse?.usage
    delete formData.userProject?.typeOfUse?.pseudonymizationInfo
    delete formData.userProject?.typeOfUse?.pseudonymizationInfoTexts
    delete formData.userProject?.propertyRights
    delete formData.userProject?.projectDetails?.simpleProjectDescription
    delete formData.userProject?.projectDetails?.department
    delete formData.userProject?.projectDetails?.executiveSummaryUac
  }

  // If DIFE is not selected, remove DIFE-specific fields
  if (!isDifeSelected.value) {
    // Remove DIFE-specific fields
    if (formData.userProject?.variableSelection) {
      delete formData.userProject.variableSelection.DIFE
    }
    if (formData.userProject?.selectionOfCases) {
      delete formData.userProject.selectionOfCases.difeSelectionOfCases
    }
  }

  return formData
}

const raiseErrors = (invalidFields: ValidateFieldsError) => {
  const errors: string[] = []
  Object.entries(invalidFields).forEach((value) => {
    value[1].forEach(({ field, message }) => {
      const rawFields = field?.split('.')
      if (rawFields) {
        const translatedField = t(`proposal.${rawFields[rawFields.length - 1]}`)
        errors.push(`${translatedField}: ${message}`)
      }
    })
  })
  showErrorMessage(errors)
}

const handleExportProposalPdfClick = async () => {
  if (proposalId.value && !isDownloadLoading.value) {
    await downloadFile()
  }
}
const handleTermsConfirm = async () => {
  isSubmissionDialogOpen.value = false
  try {
    if (proposalId.value) {
      await proposalStore.updateProposal(proposalId.value, {
        ...getFormValues(),
        status: ProposalStatus.FdpgCheck,
      })
    } else {
      await proposalStore.createProposal({ ...getFormValues(), status: ProposalStatus.FdpgCheck })
    }
    showSuccessMessage(t('general.submitted'))
    router.push({ name: RouteName.Dashboard })
  } catch (error: any) {
    showErrorMessage(error.message)
  }
}

// Helper function to get applied rules for a field
const getAppliedRules = (field: any) => {
  return {
    componentRules: getRulesArray(field.rules),
    formRules: getFormRuleArrayFromPath(rules.value, field.prop as string),
  }
}

// Helper function to check if field has validation rules
const fieldHasRules = (field: any) => {
  const appliedRules = getAppliedRules(field)
  return [...appliedRules.formRules, ...appliedRules.componentRules].length > 0
}

// Helper function to get fields belonging to a step
const getStepFields = (allFields: any[], stepFieldPaths: string[]) => {
  return allFields.filter((field) => stepFieldPaths.some((fieldPath) => field.prop?.toString().startsWith(fieldPath)))
}

// Helper function to validate a single field
const validateSingleField = async (field: any): Promise<boolean> => {
  if (!field.prop) return true
  if (!isProposalEditable()) return true

  try {
    let hasErrors = false
    await formRef.value?.validateField([field.prop], (valid, invalidFields) => {
      if (invalidFields && Object.keys(invalidFields).length > 0) {
        hasErrors = true
      }
    })
    return !hasErrors
  } catch (error) {
    return false
  }
}

// Helper function to validate step fields
const validateStepFields = async (stepFields: any[]): Promise<boolean> => {
  // Skip validation for non-editable proposals
  if (!isProposalEditable()) return true
  const validationResults = await Promise.all(stepFields.map((field) => validateSingleField(field)))
  return validationResults.every((result) => result)
}

// Helper function to get step progression order
const getStepProgressionOrder = () => {
  return Object.keys(CreatPrposalSteps).map((key) => CreatPrposalSteps[key as keyof typeof CreatPrposalSteps])
}

const prevStep = () => {
  layoutStore.prevStep()
}

const nextStep = async () => {
  const stepProgressionOrder = getStepProgressionOrder()
  const currentStepIndex = stepProgressionOrder.indexOf(activeStep.value)
  const stepsToValidate = stepProgressionOrder.slice(0, currentStepIndex + 1)

  const allFields = formRef.value?.fields || []

  // Validate all steps up to current step
  const hasValidationErrors = await validateSteps(stepsToValidate, allFields)

  // Ensure validation states have settled before computing step status
  await waitForValidation()

  // Update step statuses
  await updateValidatedStepsStatus(stepsToValidate)

  // Don't proceed if there are validation errors
  if (hasValidationErrors) {
    return
  }

  layoutStore.nextStep()
}

// Helper function to validate multiple steps
const validateSteps = async (stepsToValidate: number[], allFields: any[]): Promise<boolean> => {
  // For non-editable proposals, treat as having no validation errors
  if (!isProposalEditable()) return false
  for (const stepValue of stepsToValidate) {
    const stepFieldPaths = stepFieldsMap[stepValue] || []

    if (stepFieldPaths.length === 0) continue

    const stepFields = getStepFields(allFields, stepFieldPaths)
    const isStepValid = await validateStepFields(stepFields)

    if (!isStepValid) {
      return true // has errors
    }
  }
  return false // no errors
}
const handleSubmit = async () => {
  // Skip validation flow if proposal is not editable
  if (!isProposalEditable()) {
    await updateStepStatus()
    return
  }
  // Validate all fields before submission
  await formRef.value?.validate(() => {})
  await waitForValidation()
  await updateStepStatus()
  isSubmissionDialogOpen.value = true
}

// Helper function to check if step is valid based on field states and values
const isStepValidByFieldStates = (stepFields: any[]) => {
  const fieldsWithRules = stepFields.filter(fieldHasRules)

  if (fieldsWithRules.length === 0) return true

  for (const field of fieldsWithRules) {
    // Hard failure if any field is explicitly in error
    if (field.validateState === 'error') return false

    // If field has succeeded, continue
    if (field.validateState === 'success') continue

    // If field hasn't been validated yet, fall back to value-based check
    if (!isFieldValidByValue(field)) return false
  }

  return true
}

// Helper function to get step key from step value
const getStepKey = (stepValue: number) => {
  return CreatPrposalSteps[stepValue] as keyof typeof CreatPrposalSteps
}

// Helper function to update a single step status
const updateSingleStepStatus = (stepValue: number, allFields: any[]) => {
  const stepFieldPaths = stepFieldsMap[stepValue] || []
  const stepFields = getStepFields(allFields, stepFieldPaths)
  const isStepValid = isStepValidByFieldStates(stepFields)
  const stepKey = getStepKey(stepValue)

  layoutStore.updateStepStatus(stepKey, isStepValid)
}

const updateStepStatus = async () => {
  if (!formRef.value) return

  const allFields = formRef.value.fields || []

  // Update status for all steps
  Object.keys(stepFieldsMap).forEach((step) => {
    updateSingleStepStatus(parseInt(step), allFields)
  })
}

const updateCurrentStepStatus = async () => {
  if (!formRef.value) return

  const allFields = formRef.value.fields || []
  updateSingleStepStatus(activeStep.value, allFields)
}

const updateValidatedStepsStatus = async (stepsToUpdate: number[]) => {
  if (!formRef.value) return

  const allFields = formRef.value.fields || []

  // Update status for specified steps only
  stepsToUpdate.forEach((stepValue) => {
    updateSingleStepStatus(stepValue, allFields)
  })
}

let initialLoad = true

// Add a flag to prevent watchers from interfering with initial validation
let isInitialValidationComplete = false

const onValidate = async (prop: FormItemProp, isValid: boolean) => {
  // No validation here - only update progress
  if (initialLoad) return
  // Skip any validation-triggered progress updates when not editable
  if (!isProposalEditable()) return
  await updateProgressOnly()
}

// Helper function to check if auto-save should be skipped
const shouldSkipAutoSave = () => {
  // Skip if proposal is not in editable state
  if (!isProposalEditable()) {
    return true
  }

  // Skip if in the middle of a manual save
  if (bypassDebounce.value) {
    return true
  }

  // Skip if form hasn't changed
  if (!hasFormChanged.value) {
    return true
  }

  // Skip for new proposals without project abbreviation
  if (!proposalId.value && !proposalForm.value?.projectAbbreviation?.trim()) {
    return true
  }

  return false
}

// Helper function to validate project abbreviation
const validateProjectAbbreviation = async (): Promise<boolean> => {
  let invalidFields: ValidateFieldsError | undefined
  await formRef.value?.validateField(
    ['projectAbbreviation'],
    (_isValid: boolean, invalidFieldsResult?: ValidateFieldsError) => {
      invalidFields = invalidFieldsResult
    },
  )

  if (invalidFields && Object.keys(invalidFields).length > 0) {
    raiseErrors(invalidFields)
    return false
  }
  return true
}

// Helper function to save existing proposal
const saveExistingProposal = async () => {
  const saveResult = await proposalStore.updateProposal(proposalId.value, {
    ...getFormValues(),
  })
  proposalStore.currentProposal = transformForm(saveResult) as IProposal
}

// Helper function to create new proposal
const createNewProposal = async () => {
  if (!proposalForm.value?.projectAbbreviation?.trim()) {
    return
  }

  const isValid = await validateProjectAbbreviation()
  if (!isValid) {
    bypassDebounce.value = false
    return
  }

  const saveResult = await proposalStore.createProposal({
    ...getFormValues(),
    status: ProposalStatus.Draft,
  })
  proposalStore.currentProposal = transformForm(saveResult) as IProposal
  await setUpPage()
}

// Auto-save function without validation
const autoSaveDraft = async () => {
  if (shouldSkipAutoSave()) {
    return
  }

  isAutoSaving.value = true

  try {
    if (proposalId.value) {
      await saveExistingProposal()
    } else {
      await createNewProposal()
    }
    hasFormChanged.value = false
  } catch (error: any) {
    // Silently fail for auto-save to avoid disrupting user experience
  } finally {
    isAutoSaving.value = false
  }
}

// Helper function to check if manual save should be skipped
const shouldSkipManualSave = () => {
  return !isProposalEditable()
}

// Helper function to perform form validation
const performFormValidation = async (): Promise<boolean> => {
  // Skip validation for non-editable proposals
  if (!isProposalEditable()) return true
  await formRef.value?.validate(() => {})
  await waitForValidation()
  await updateStepStatus()

  const isValid = await validateProjectAbbreviation()
  if (!isValid) {
    bypassDebounce.value = false
    return false
  }
  return true
}

// Helper function to save proposal with success message
const saveProposalWithMessage = async () => {
  try {
    let saveResult
    if (proposalId.value) {
      saveResult = await proposalStore.updateProposal(proposalId.value, {
        ...getFormValues(),
      })
    } else {
      saveResult = await proposalStore.createProposal({
        ...getFormValues(),
        status: ProposalStatus.Draft,
      })
    }

    proposalStore.currentProposal = transformForm(saveResult) as IProposal
    showSuccessMessage(t('general.savedAsDraft'))
  } catch (error: any) {
    showErrorMessage(error.message)
  }
}

// Update handleSaveDraft to validate all fields
const handleSaveDraft = async () => {
  if (shouldSkipManualSave()) {
    return
  }

  bypassDebounce.value = true

  const stepProgressionOrder = getStepProgressionOrder()
  const currentStepIndex = stepProgressionOrder.indexOf(activeStep.value)
  const stepsToValidate = stepProgressionOrder.slice(0, currentStepIndex + 1)
  const allFields = formRef.value?.fields || []
  const hasValidationErrors = await validateSteps(stepsToValidate, allFields)
  // Ensure all field validateStates are updated before updating step status
  await waitForValidation()
  await updateValidatedStepsStatus(stepsToValidate)
  if (hasValidationErrors) {
    bypassDebounce.value = false
  }
  await saveProposalWithMessage()
  await setUpPage()

  bypassDebounce.value = false
  isSubmissionDialogOpen.value = false
}

const authStore = useAuthStore()

// Debounced auto-save function
const debouncedAutoSave = debounce(autoSaveDraft, 2000) // 2 second delay

// Auto-save watcher - MODIFY TO NOT INTERFERE WITH INITIAL VALIDATION
watch(
  () => proposalForm.value,
  () => {
    if (initialLoad) return
    layoutStore.setFormTouched(true)

    if (proposalForm.value) {
      hasFormChanged.value = true
      debouncedAutoSave()

      // Only call updateProgressOnly after initial validation is complete
      if (isInitialValidationComplete) {
        updateProgressOnly()
      }
    }
  },
  { deep: true },
)

// Helper function to check if field is valid by value
const isFieldValidByValue = (field: any): boolean => {
  const fieldPath = field.prop as string
  const fieldValue = getFieldValue(fieldPath)
  const isFilled = isFieldMeaningfullyFilled(fieldValue)

  const appliedRules = getAppliedRules(field)
  const isRequired = [...appliedRules.formRules, ...appliedRules.componentRules].some((rule) => rule.required)

  // Required fields must be filled
  if (isRequired && !isFilled) {
    return false
  }

  // Optional fields are valid if empty or filled
  return true
}

// Helper function to validate step silently
const validateStepSilently = (stepNumber: number, allFields: any[]): boolean => {
  const stepFieldPaths = stepFieldsMap[stepNumber] || []
  const stepFields = getStepFields(allFields, stepFieldPaths)
  const fieldsWithRules = stepFields.filter(fieldHasRules)

  if (fieldsWithRules.length === 0) {
    return true
  }

  return fieldsWithRules.every(isFieldValidByValue)
}

// Helper function to get step key from step number
const getStepKeyFromNumber = (stepNumber: number) => {
  return Object.keys(CreatPrposalSteps).find(
    (key) => CreatPrposalSteps[key as keyof typeof CreatPrposalSteps] === stepNumber && isNaN(Number(key)),
  ) as keyof typeof CreatPrposalSteps
}

const validateFormSilently = async () => {
  if (!formRef.value) {
    return
  }
  // Do not run silent validation when proposal is not editable
  if (!isProposalEditable()) return

  const allFields = formRef.value.fields || []

  // Validate each step silently
  Object.keys(stepFieldsMap).forEach((step) => {
    const stepNumber = parseInt(step)
    const isStepValid = validateStepSilently(stepNumber, allFields)
    if (isStepValid) {
      const stepKey = getStepKeyFromNumber(stepNumber)
      layoutStore.updateStepStatus(stepKey, isStepValid)
    }
  })
}

// Helper function to set up breadcrumbs
const setupBreadcrumbs = () => {
  const lastDashboard = layoutStore.lastDashboard
  layoutStore.setBreadcrumbs([
    {
      name: lastDashboard,
      displayName: getLastDashboardTitle(lastDashboard),
    },
    {
      name: RouteName.ProposalDetails,
      params: proposalForm.value?._id ? { id: proposalForm.value._id } : undefined,
      displayName: proposalForm.value?.projectAbbreviation
        ? proposalForm.value.projectAbbreviation
        : 'proposal.mIIUsageApplicationForm',
    },
  ])
}

// Helper function to handle validation for existing proposals
const handleExistingProposalValidation = async () => {
  const isEditable = isProposalEditable()

  if (isEditable) {
    await nextTick()
    await validateFormSilently()
  }

  isInitialValidationComplete = true
}

const setUpPage = async () => {
  proposalForm.value = transformForm(proposalStore.currentProposal, false, authStore.profile) as IProposal
  setupBreadcrumbs()

  await nextTick()

  // Handle validation based on proposal type
  if (params.id) {
    // For existing proposals, perform initial validation
    await handleExistingProposalValidation()
  } else {
    // For new proposals, mark validation as complete immediately
    isInitialValidationComplete = true
  }

  initialLoad = false
}

const scrollToAnchor = async () => {
  if (query.anchor) {
    await nextTick()
    const element = document.getElementById(query.anchor as string)
    if (element) {
      element.scrollIntoView({ block: 'start', behavior: 'smooth' })
    }
  }
}
// Helper function to check if there are open tasks for rework
const hasOpenReworkTasks = () => {
  return OpenProposalTasks.value.length > 0 && proposalForm.value?.status === ProposalStatus.Rework
}

const setValidationStatus = () => {
  const hasOpenTasks = hasOpenReworkTasks()
  isValidToSubmit.value = allFieldsValid.value && !!proposalId.value && !hasOpenTasks
}

// Helper function to check if field is required
const isFieldRequired = (field: any): boolean => {
  const appliedRules = getAppliedRules(field)
  return [...appliedRules.formRules, ...appliedRules.componentRules].filter((rule) => rule.required).length > 0
}

// Helper function to check if field is valid and filled
const isFieldValidAndFilled = (field: any): boolean => {
  const fieldPath = field.prop as string
  const fieldValue = getFieldValue(fieldPath)
  const isFilled = isFieldMeaningfullyFilled(fieldValue)
  return isFilled && field.validateState !== 'error'
}

// Helper function to check if all fields are valid
const areAllFieldsValid = (requiredFields: any[], allFields: any[]): boolean => {
  const requiredFieldsValid = requiredFields.every((field) => {
    const fieldPath = field.prop as string
    const fieldValue = getFieldValue(fieldPath)
    return isFieldMeaningfullyFilled(fieldValue) && field.validateState !== 'error'
  })

  const allFieldsNoErrors = allFields.every((field) => field.validateState !== 'error')

  return requiredFieldsValid && allFieldsNoErrors
}

// Function to track progress without showing validation errors
const updateProgressOnly = async () => {
  await nextTick()

  if (!formRef.value) {
    return
  }

  const allFields = formRef.value.fields
  if (!allFields) {
    allFieldsValid.value = false
    return
  }

  // Get required fields and update totals
  const requiredFields = allFields.filter(isFieldRequired)
  layoutStore.setTotalRequiredFields(requiredFields.length)

  // Count valid fields
  const validatedFields = requiredFields.filter(isFieldValidAndFilled).length
  layoutStore.setValidatedFields(validatedFields)

  // Update overall validity status
  allFieldsValid.value = areAllFieldsValid(requiredFields, allFields)
}

// Function to get field value by path
const getFieldValue = (path: string) => {
  if (!proposalForm.value) return undefined

  const keys = path.split('.')
  let current: any = proposalForm.value

  for (const key of keys) {
    if (current[key] === undefined) {
      return undefined
    }
    current = current[key]
  }

  return current
}

// Function to check if a field has meaningful content
const isFieldMeaningfullyFilled = (value: any): boolean => {
  if (value === undefined || value === null) return false

  // Handle strings
  if (typeof value === 'string') {
    return value.trim() !== ''
  }

  // Handle arrays
  if (Array.isArray(value)) {
    return value.length > 0
  }

  // Handle objects
  if (typeof value === 'object') {
    // Check if object has any non-empty properties
    return Object.keys(value).some((key) => {
      const propValue = value[key]
      if (propValue === undefined || propValue === null) return false
      if (typeof propValue === 'string') return propValue.trim() !== ''
      if (Array.isArray(propValue)) return propValue.length > 0
      if (typeof propValue === 'object') return isFieldMeaningfullyFilled(propValue)
      return true
    })
  }

  // Handle numbers, booleans, etc.
  return true
}

const waitForValidation = async () => {
  await nextTick()

  if (formRef.value) {
    const formRules = rules.value
    const allFields = formRef.value.fields

    if (!allFields) {
      allFieldsValid.value = false
      return
    }

    // Get fields with any validation rules (for progress tracking, we still use required fields)
    const requiredFields = allFields.filter((field) => {
      const appliedRules = {
        componentRules: getRulesArray(field.rules),
        formRules: getFormRuleArrayFromPath(formRules, field.prop as string),
      }

      return [...appliedRules.formRules, ...appliedRules.componentRules].filter((rule) => rule.required).length > 0
    })

    layoutStore.setTotalRequiredFields(requiredFields.length)

    await Promise.all(
      allFields.map(
        (field) =>
          new Promise<void>((resolve) => {
            if (field.validateState !== 'validating') {
              resolve()
            } else {
              const unwatch = watch(
                () => field.validateState,
                (newState) => {
                  if (newState === 'success' || newState === 'error') {
                    unwatch()
                    resolve()
                  }
                },
              )
            }
          }),
      ),
    )

    const validatedFields = requiredFields.filter((field) => field.validateState === 'success').length
    layoutStore.setValidatedFields(validatedFields)

    // Form is valid when ALL fields (required and non-required) have no errors
    allFieldsValid.value = allFields.every((field) => field.validateState !== 'error')
  }
}

const getRulesArray = (rules: any): any[] => {
  if (!rules) return []
  return Array.isArray(rules) ? rules.map((rule) => rule) : [rules]
}

const getFormRuleArrayFromPath = (obj: Record<string, any>, path?: string) => {
  if (!obj || !path) return []

  // Split the path into keys
  const keys = path.split('.')

  let current = obj

  for (const key of keys) {
    if (current[key] === undefined) {
      // Path not fully matched
      return []
    }
    current = current[key]
  }

  // If the final value is an array, return it
  if (Array.isArray(current)) {
    return current
  }

  if (!current) {
    return []
  }

  return [current]
}

const toggleShoppingList = () => {
  layoutStore.toggleShoppingList()
}

watch(
  ethicVoteUploads,
  (newEthicVoteUploads) => {
    if (newEthicVoteUploads?.length) {
      formRef.value?.validateField(['userProject.ethicVote.ethicVoteUploads'], () => {})
    }
  },
  {
    deep: true,
  },
)
watch(
  OpenProposalTasks,
  () => {
    setValidationStatus()
  },
  { deep: true, immediate: true },
)
watch(
  () => proposalForm.value?.selectedDataSources,
  (newSelectedDataSources) => {
    layoutStore.setDatasourceSelected(!!newSelectedDataSources?.length)
  },
  { immediate: true, deep: true },
)

watch(
  () => activeStep.value,
  async (newStep, oldStep) => {
    if (newStep !== oldStep) {
      const allFields = formRef.value?.fields || []
      // Validate old step fields
      const stepFieldPaths = stepFieldsMap[oldStep] || []
      const oldStepFields = getStepFields(allFields, stepFieldPaths)
      await validateStepFields(oldStepFields)
      // Wait for validation to settle before updating status
      await waitForValidation()
      // Update step statuses
      await updateValidatedStepsStatus([oldStep])
    }
  },
)

onMounted(async () => {
  // Reset progress on mount
  layoutStore.setTotalRequiredFields(0)
  layoutStore.setValidatedFields(0)
  layoutStore.setFormTouched(false)

  // MOVE resetSteps() HERE - before any validation
  layoutStore.resetSteps()

  try {
    await proposalStore.setCurrentProposal(params.id as string)
    await setUpPage()
  } catch (error) {
    showErrorMessage()
    router.push({ name: RouteName.Dashboard })
  }

  if (params.id) {
    try {
      await commentStore.fetchAll({ proposalId: params.id as string })

      // After comments are loaded, ensure validation and progress are updated
      const isEditable =
        proposalStore.currentProposal?.status === ProposalStatus.Draft ||
        proposalStore.currentProposal?.status === ProposalStatus.Rework

      if (isEditable) {
        await nextTick()
        await validateFormSilently()
        await updateProgressOnly()
      }

      await scrollToAnchor()
    } catch (error) {
      showErrorMessage()
    }
  }

  // REMOVE layoutStore.resetSteps() from here

  const isDateDefined =
    proposalForm.value?.userProject.generalProjectInformation.desiredStartTimeType === 'later'
      ? proposalForm.value?.userProject.generalProjectInformation.desiredStartTime
      : true
  const isEditable =
    proposalStore.currentProposal?.status === ProposalStatus.Draft ||
    proposalStore.currentProposal?.status === ProposalStatus.Rework
  if (params.id && isDateDefined && isEditable && formRef.value) {
    let invalidFields: ValidateFieldsError | undefined
    try {
      await formRef.value.validateField(
        'userProject.generalProjectInformation.desiredStartTime',
        (_isValid: boolean, invalidFieldsResult?: ValidateFieldsError) => {
          invalidFields = invalidFieldsResult
        },
      )

      if (invalidFields && Object.keys(invalidFields).length > 0) {
        raiseErrors(invalidFields)
        return
      }
    } catch (error) {
      // Error validating desiredStartTime field
    }
  }

  // Update progress and set up watchers after silent validation is complete
  await updateProgressOnly()

  watch(() => proposalForm.value, updateProgressOnly, { deep: true })
  watch(() => [allFieldsValid.value, proposalId.value], setValidationStatus, { deep: true })
  setValidationStatus()
})
</script>

<style lang="scss">
@use '@/assets/sass/variable' as *;

.fdpg-new-proposal-page {
  counter-reset: large-label;

  flex-direction: column;
  padding-bottom: 100px;
  position: relative;

  .lead {
    margin-bottom: 37px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .abbreviation {
    margin-bottom: 53px;
  }
  .form-label-mb-3 {
    margin-bottom: 3rem;
  }
  .form-group-wrapper {
    padding: 20px;
    border-radius: 10px;
    margin-bottom: 52px;
    background-color: $gray-200;

    .form-label-mt-4 {
      margin-top: 4px;
    }

    .form-label-mb-9 {
      margin-bottom: 9px;
    }

    & + .form-group-wrapper {
      margin-top: -32px;
    }

    &.form-group-wrapper--collapsed {
      display: flex;
      padding: 14px 20px;
      align-items: center;
      justify-content: space-between;

      h6 {
        text-overflow: ellipsis;
        overflow: hidden;
        white-space: nowrap;
        padding-right: 2.5em;

        &.invalid-form {
          color: $red-100;
        }

        margin: 0;
        font-size: 20px;
        color: $gray-900;
      }

      .form-group-wrapper--collapsed__actions {
        min-width: fit-content;
      }
    }
  }

  .add-more-button {
    display: block;

    .add-text {
      margin-left: 13px;
    }

    &.add-more-button--another-person {
      margin-bottom: 49px;
    }

    &.add-more-button--publication {
      margin-bottom: 41px;
    }

    &.add-more-button--biosample {
      margin-top: -29px;
      margin-bottom: -3px;
    }
  }

  .action-wrapper {
    display: flex;
    justify-content: space-between;
    margin-top: 25px;

    .text-right {
      text-align: right;
    }

    @media (max-width: $sm) {
      .el-button {
        width: 100%;
        margin: 0 0 20px 0;
      }
    }
  }

  p {
    &.desc {
      color: $black;
      font-size: 16px;
      margin-top: 2px;
    }

    &.description {
      color: $black;
      font-size: 16px;
      margin: 22px 0 28px;
    }

    &.example {
      font-size: 12px;
      color: $gray-900;
      margin-top: 7px;
      margin-bottom: -6px;
    }
  }

  .upload-button {
    i::before {
      transform: rotate(90deg);
    }
  }
}
.shopping-list-open {
  position: unset;
}
.align-right {
  justify-content: end !important;
}

.auto-save-indicator {
  display: flex;
  justify-content: center;
  margin-bottom: 1rem;

  .auto-save-status {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.875rem;
    padding: 0.5rem 1rem;
    border-radius: 0.375rem;

    &.saving {
      color: #409eff;
      background-color: #ecf5ff;

      i {
        animation: spin 1s linear infinite;
      }
    }

    &.pending {
      color: #e6a23c;
      background-color: #fdf6ec;
    }

    &.saved {
      color: #67c23a;
      background-color: #f0f9ff;
    }
  }
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
