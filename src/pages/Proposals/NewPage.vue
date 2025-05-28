<template>
  <el-container class="fdpg-new-proposal-page">
    <div class="lead">
      <h1 class="title">{{ $t('proposal.mIIUsageApplicationForm') }}</h1>
      <div>
        <el-button
          type="primary"
          size="large"
          data-test-id="projectDetails"
          link
          @click="openDetails"
          v-if="proposalId"
        >
          <i class="bi bi-info-square"></i>
        </el-button>
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
      </div>
    </div>
    <div class="lead align-right">
      <div>
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
                <DataSourceSelection v-model="proposalForm.selectedDataSources"></DataSourceSelection>
              </el-col>
            </el-row>
          </div>
        </div>

        <div v-show="activeStep === CreatPrposalSteps.Variables">
          <VariableSelection
            v-model="proposalForm.userProject.variableSelection"
            :platform="platform"
            :review-mode="isReviewMode"
            :form-ref="formRef"
          />

          <FdpgLabel
            required
            info="proposal.informationOnTheRequestedDataInfo"
            size="large"
            html-for="proposal.informationOnTheRequestedData"
          />
          <RequestedData v-model="proposalForm.requestedData" :review-mode="isReviewMode" />
          <ProjectAddresses v-model="proposalForm.userProject.addressees" :review-mode="isReviewMode" />

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
            v-if="hasBiosamples"
            v-model="proposalForm.userProject.informationOnRequestedBioSamples"
            :review-mode="isReviewMode"
            :form-ref="formRef"
          />
        </div>

        <div v-show="activeStep === CreatPrposalSteps.Casesohort"></div>

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
            $t('proposal.attachmentsOptional') + (uploadsForType.length ? `(${uploadsForType.length})` : '')
          }}</FdpgLabel>
          <p class="desc">
            {{
              proposalId
                ? $t('proposal.pleaseUploadAdditionalAttachmentsHere')
                : $t('proposal.attachmentsOnlyAfterSavingHint')
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
              {{ $t('proposal.chooseAFile') }}
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
          $t('proposal.prevStep')
        }}</el-button>
      </el-col>
      <el-col :span="12" class="text-right">
        <el-button
          type="primary"
          data-test-id="nextStep"
          @click="nextStep"
          :disabled="!proposalForm?.selectedDataSources?.length"
          v-if="activeStep !== CreatPrposalSteps.ResearchProject"
          >{{ $t('proposal.nextStep') }}</el-button
        >
        <el-button
          type="primary"
          data-test-id="handleSubmit"
          @click="handleSubmit"
          v-else-if="!proposalStore.currentProposal || !isReviewMode"
          >{{ $t('proposal.submitApplication') }}</el-button
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
import VariableSelection from './Variables/VariableSelection.vue'
import DataSourceSelection from './DataSources/DataSourceSelection.vue'
import ShoppingList from './DataSources/ShoppingList.vue'
import TargetFormat from './DataUsage/TargetFormat.vue'
import ProjectRecontact from './DataUsage/ProjectRecontact.vue'
import SubmissionDialog from '@/components/SubmissionDialog.vue'
import useDraftDownload from '@/composables/use-draft-download'

// Map each step to its corresponding form fields
const stepFieldsMap = {
  [CreatPrposalSteps.DataSources]: ['projectAbbreviation'],
  [CreatPrposalSteps.ProjectParticipants]: ['applicant', 'projectResponsible', 'projectUser', 'participants'],
  [CreatPrposalSteps.ProjectDetails]: [
    'userProject.generalProjectInformation',
    'userProject.feasibility',
    'userProject.plannedPublication',
  ],
  [CreatPrposalSteps.DataUsage]: ['userProject.typeOfUse'],
  [CreatPrposalSteps.Variables]: ['requestedData', 'userProject.variableSelection.DIFE'],
  [CreatPrposalSteps.ResearchProject]: [
    'userProject.projectDetails',
    'userProject.ethicVote',
    'requestedData.desiredControlDataAmount',
    'requestedData.desiredDataAmount',
  ],
  [CreatPrposalSteps.Casesohort]: [],
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
const router = useRouter()
const { params, query } = useRoute()
const commentStore = useCommentStore()

const proposalForm = ref<IProposal>()
const platform = computed(() => {
  return proposalForm.value?.selectedDataSources ?? [PlatformIdentifier.Mii]
})

const proposalId = computed(() => proposalForm.value?._id as string)
const ethicVoteUploads = computed(() =>
  proposalForm.value?.uploads?.filter((upload) => upload.type === DirectUpload.EthicVote),
)
const feasibilityId = computed(() => proposalForm.value?.userProject.feasibility.id)
const desiredStartTimeType = computed(
  () => proposalForm.value?.userProject.generalProjectInformation.desiredStartTimeType === 'later',
)

const SupportedMimetype = computed(() => {
  return Object.values(ESupportedMimetype).join(',')
})
const proposalStore = useProposalStore()

const formRef = ref<FormInstance>()

const fileList = ref([])

const bypassDebounce = ref(false)

const isValidToSubmit = ref<boolean>(false)
const allFieldsValid = ref<boolean>(false)
const isSubmissionDialogOpen = ref(false)

const activeStep = computed(() => {
  return layoutStore.activeStep
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
      variableSelection: {
        /*
          handled in component
        */
      },
    },
    feasibility: {
      details: [requiredIfEmptyValidationFunc(feasibilityId), maxLengthValidationFunc(10000)],
    },
    projectDetails: {
      simpleProjectDescription: [requiredValidationFunc('string'), maxLengthValidationFunc(10000)],
      department: requiredValidationFunc('array'),
      scientificBackground: [requiredValidationFunc('string'), maxLengthValidationFunc(10000)],
      hypothesisAndQuestionProjectGoals: [requiredValidationFunc('string'), maxLengthValidationFunc(10000)],
      materialAndMethods: [requiredValidationFunc('string'), maxLengthValidationFunc(10000)],
      executiveSummaryUac: [requiredValidationFunc('string'), maxLengthValidationFunc(3000)],
    },
    ethicVote: {
      ethicsCommittee: [requiredValidationFunc('string'), maxLengthValidationFunc(10000)],
      ethicsVoteNumber: [requiredValidationFunc('string'), maxLengthValidationFunc(100)],
      voteFromDate: requiredValidationFunc(),
      ethicVoteUploads: requiredUploadFunc(ethicVoteUploads),
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
      // Handled in component
    },
    variableSelection: {
      DIFE: {
        typeOfUse: requiredValidationFunc('string'),
        typeOfUseExplanation: [requiredValidationFunc('string'), maxLengthValidationFunc(10000)],
      },
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

const isReviewMode = computed(() => {
  return (
    !(
      proposalForm.value?.status === undefined ||
      proposalForm.value?.status === ProposalStatus.Draft ||
      proposalForm.value?.status === ProposalStatus.Rework
    ) || isParticipatingScientist.value
  )
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
const openDetails = () => {
  if (proposalId.value) {
    router.push({
      name: RouteName.ProposalDetails,
      params: { id: proposalId.value },
    })
  }
}
const getFormValues = () => {
  return transformForm(proposalForm.value, true)
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
const prevStep = () => {
  layoutStore.prevStep()
}
const nextStep = () => {
  layoutStore.nextStep()
}
const handleSubmit = async () => {
  isSubmissionDialogOpen.value = true
}

const updateStepStatus = async () => {
  if (!formRef.value) return

  // Get all form fields
  const allFields = formRef.value.fields || []

  // Check each step's fields
  Object.entries(stepFieldsMap).forEach(([step, fields]) => {
    // Get all fields that belong to this step
    const stepFields = allFields.filter((field) =>
      fields.some((fieldPath) => field.prop?.toString().startsWith(fieldPath)),
    )

    // Check if all fields in this step are valid
    const isStepValid = stepFields.length > 0 && stepFields.every((field) => field.validateState === 'success')
    const stepEnum = CreatPrposalSteps[step as keyof typeof CreatPrposalSteps]

    // Update the step status in layout store
    layoutStore.updateStepStatus(stepEnum as unknown as keyof typeof CreatPrposalSteps, isStepValid)
  })
}

// Add validation on form validate event
const onValidate = async (prop: FormItemProp, isValid: boolean) => {
  await waitForValidation()

  // Check which step the validated field belongs to
  Object.entries(stepFieldsMap).forEach(([step, fields]) => {
    if (fields.some((fieldPath) => prop.toString().startsWith(fieldPath))) {
      const stepEnum = CreatPrposalSteps[step as keyof typeof CreatPrposalSteps]

      // Get all fields that belong to this step
      const stepFields =
        formRef.value?.fields.filter((field) =>
          fields.some((fieldPath) => field.prop?.toString().startsWith(fieldPath)),
        ) || []

      const isStepValid =
        stepFields.length > 0 &&
        stepFields.every((field) => {
          let validity
          if (field.rules) validity = field.validateState == 'success'
          else validity = field.validateState !== 'error'
          return validity
        })

      layoutStore.updateStepStatus(stepEnum as unknown as keyof typeof CreatPrposalSteps, isStepValid)
    }
  })
}

// Update handleSaveDraft to check all fields
const handleSaveDraft = async () => {
  if (
    proposalForm.value?.status !== undefined &&
    proposalForm.value.status !== ProposalStatus.Draft &&
    proposalForm.value.status !== ProposalStatus.Rework
  ) {
    return
  }
  bypassDebounce.value = true

  // Validate all fields to update step statuses
  await formRef.value?.validate(() => {})
  await waitForValidation()
  await updateStepStatus()

  // First validate projectAbbreviation
  let invalidFields: ValidateFieldsError | undefined
  await formRef.value?.validateField(
    ['projectAbbreviation'],
    (_isValid: boolean, invalidFieldsResult?: ValidateFieldsError) => {
      invalidFields = invalidFieldsResult
    },
  )

  if (invalidFields && Object.keys(invalidFields).length > 0) {
    raiseErrors(invalidFields)
    return
  }

  // Only proceed with saving if projectAbbreviation is valid
  if (proposalId.value) {
    try {
      const saveResult = await proposalStore.updateProposal(proposalId.value, {
        ...getFormValues(),
      })
      proposalStore.currentProposal = transformForm(saveResult) as IProposal
      showSuccessMessage(t('general.savedAsDraft'))
    } catch (error: any) {
      showErrorMessage(error.message)
    }
  } else {
    try {
      const saveResult = await proposalStore.createProposal({ ...getFormValues(), status: ProposalStatus.Draft })
      proposalStore.currentProposal = transformForm(saveResult) as IProposal
      showSuccessMessage(t('general.savedAsDraft'))
    } catch (error: any) {
      showErrorMessage(error.message)
    }
  }

  await setUpPage()
  bypassDebounce.value = false
  isSubmissionDialogOpen.value = false
}

const authStore = useAuthStore()
const setUpPage = async () => {
  proposalForm.value = transformForm(proposalStore.currentProposal, false, authStore.profile) as IProposal
  const lastDashboard = layoutStore.lastDashboard
  layoutStore.setBreadcrumbs([
    {
      name: lastDashboard,
      displayName: getLastDashboardTitle(lastDashboard),
    },
    {
      name: RouteName.ProposalDetails,
      params: proposalForm.value._id ? { id: proposalForm.value._id } : undefined,
      displayName: proposalForm.value.projectAbbreviation
        ? proposalForm.value.projectAbbreviation
        : 'proposal.mIIUsageApplicationForm',
    },
  ])

  const isEditable =
    proposalStore.currentProposal?.status === ProposalStatus.Draft ||
    proposalStore.currentProposal?.status === ProposalStatus.Rework
  if (proposalForm.value._id && isEditable) {
    formRef.value?.validate(() => {})
  }

  await nextTick()
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
const setValidationStatus = () => {
  const hasOpenTasks = OpenProposalTasks.value.length > 0 && proposalForm.value?.status === ProposalStatus.Rework
  isValidToSubmit.value = allFieldsValid.value && !!proposalId.value && !hasOpenTasks
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

    const requiredFields = allFields.filter((field) => {
      const appliedRules = {
        componentRules: getRulesArray(field.rules),
        formRules: getFormRuleArrayFromPath(formRules, field.prop as string),
      }

      return [...appliedRules.formRules, ...appliedRules.componentRules].filter((rule) => rule.required).length > 0
    })

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

    allFieldsValid.value =
      requiredFields.every((field) => field.validateState === 'success') &&
      allFields.every((field) => field.validateState !== 'error')
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
  // Scroll the main content container to the top
  const mainElement = document.querySelector('.el-main')
  if (mainElement) {
    mainElement.scrollTo({ top: 0, behavior: 'smooth' })
  } else {
    // Fallback if main element not found
    const formContainer = document.querySelector('.form-container')
    if (formContainer) {
      formContainer.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }
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

onMounted(async () => {
  try {
    await proposalStore.setCurrentProposal(params.id as string)
    await setUpPage()
  } catch (error) {
    console.log(error)
    showErrorMessage()
    router.push({ name: RouteName.Dashboard })
  }

  if (params.id) {
    try {
      await commentStore.fetchAll({ proposalId: params.id as string })
      await setUpPage()
      await scrollToAnchor()
    } catch (error) {
      console.log(error)
      showErrorMessage()
    }
  }
  layoutStore.resetSteps()

  const isDateDefined =
    proposalForm.value?.userProject.generalProjectInformation.desiredStartTimeType === 'later'
      ? proposalForm.value?.userProject.generalProjectInformation.desiredStartTime
      : true
  const isEditable =
    proposalStore.currentProposal?.status === ProposalStatus.Draft ||
    proposalStore.currentProposal?.status === ProposalStatus.Rework
  if (params.id && isDateDefined && isEditable) {
    let invalidFields: ValidateFieldsError | undefined
    await formRef.value?.validateField(
      ['userProject.generalProjectInformation.desiredStartTime'],
      (_isValid: boolean, invalidFieldsResult?: ValidateFieldsError) => {
        invalidFields = invalidFieldsResult
      },
    )

    if (invalidFields && Object.keys(invalidFields).length > 0) {
      raiseErrors(invalidFields)
      return
    }
  }

  watch(() => proposalForm.value, waitForValidation, { deep: true })
  await waitForValidation()

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

  .lead {
    margin-bottom: 37px;
    display: flex;
    justify-content: space-between;
    align-items: center;

    .title {
      margin: 0;
      font-size: 32px;
    }
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
.align-right {
  justify-content: end !important;
}
</style>
