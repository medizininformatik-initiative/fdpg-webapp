<template>
  <el-container class="fdpg-new-proposal-page">
    <div class="lead">
      <h1 class="title">{{ $t('proposal.mIIUsageApplicationForm') }}</h1>
      <div>
        <el-button
          v-if="proposalId"
          type="primary"
          size="large"
          @click="openDetails"
        >{{ $t('proposal.projectDetails') }}</el-button>
      </div>
    </div>

    <el-form
      v-if="proposalForm"
      ref="formRef"
      :model="proposalForm"
      :rules="rules"
      @valid–ate="onValidate"
    >
      <el-row class="abbreviation">
        <el-col :sm="18" :md="12" :lg="6">
          <FdpgFormItem prop="projectAbbreviation">
            <FdpgLabel
              required
              info="proposal.projectAbbreviationInfo"
              html-for="proposal.projectAbbreviation"
            />
            <FdpgInput
              v-model="proposalForm.projectAbbreviation"
              data-test-id="proposalForm.projectAbbreviation"
              placeholder="proposal.egWestStorm"
              :disabled="isReviewMode"
            />
          </FdpgFormItem>
        </el-col>
      </el-row>

      <FdpgLabel size="large" html-for="proposal.applicant" />
      <ProjectApplicant
        v-model="proposalForm.applicant"
        :form-ref="formRef"
        :review-mode="isReviewMode"
      />

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

      <FdpgLabel
        required
        size="large"
        html-for="proposal.projectUser"
        info="proposal.projectUserInfo"
      />
      <ProjectUser
        v-model="proposalForm.projectUser"
        :form-ref="formRef"
        :review-mode="isReviewMode"
      />

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

      <FdpgLabel html-for="proposal.informationAboutTheUserProject" size="large" />
      <UserProjectInformation
        v-model="proposalForm.userProject"
        :form-ref="formRef"
        :file-list="fileList"
        :review-mode="isReviewMode"
        :platform="platform"
      />

      <FdpgLabel
        required
        info="proposal.informationOnTheRequestedDataInfo"
        size="large"
        html-for="proposal.informationOnTheRequestedData"
      />
      <RequestedData v-model="proposalForm.requestedData" :review-mode="isReviewMode" />

      <FdpgLabel html-for="proposal.attachmentsOptional" size="large" />
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
          type="text"
          :disabled="isAppendixLoading || isReviewMode"
          data-test-id="general-appendix__upload__button"
        >
          {{ $t('proposal.chooseAFile') }}
          <template #icon>
            <el-icon class="bi-paperclip"></el-icon>
          </template>
        </el-button>
      </FdpgUpload>
    </el-form>

    <el-row
      v-if="
        !proposalStore.currentProposal ||
        proposalStore.currentProposal.status === ProposalStatus.Draft ||
        proposalStore.currentProposal.status === ProposalStatus.Rework ||
        proposalStore.currentProposal.status === undefined
      "
      type="flex"
      justify="end"
      class="action-wrapper"
    >
      <el-button
        type="primary"
        plain
        data-test-id="handleSaveDraft"
        @click="handleSaveDraft"
      >{{ $t('proposal.saveDraft') }}</el-button>
      <el-button
        :disabled="!isValidToSubmit"
        type="primary"
        data-test-id="handleSubmit"
        @click="handleSubmit"
      >{{ $t('proposal.submitApplication') }}</el-button>
    </el-row>
  </el-container>

  <TermsDialog v-model="isTermsDialogOpen" :platform="platform" @confirm="handleTermsConfirm" />
</template>

<script setup lang="ts">
import FdpgFormItem from '@/components/FdpgFormItem.vue'
import FdpgInput from '@/components/FdpgInput.vue'
import FdpgLabel from '@/components/FdpgLabel.vue'
import FdpgUpload from '@/components/FdpgUpload.vue'
import TermsDialog from '@/components/TermsDialog.vue'
import useNotifications from '@/composables/use-notifications'
import useUpload from '@/composables/use-upload'
import ParticipatingScientists from '@/pages/Proposals/ParticipatingScientists/ParticipatingScientists.vue'
import RequestedData from '@/pages/Proposals/RequestedData.vue'
import UserProjectInformation from '@/pages/Proposals/UserProjectInformation/UserProjectInformation.vue'
import { useAuthStore } from '@/stores/auth/auth.store'
import { useCommentStore } from '@/stores/comment/comment.store'
import { useLayoutStore } from '@/stores/layout.store'
import { useProposalStore } from '@/stores/proposal/proposal.store'
import type { Role } from '@/types/oidc.types'
import { PlatformIdentifier } from '@/types/platform-identifier.enum'
import type { IProposal } from '@/types/proposal.types'
import { ProposalStatus } from '@/types/proposal.types'
import { RouteName } from '@/types/route-name.enum'
import { DirectUpload } from '@/types/upload.types'
import { getLastDashboardTitle } from '@/utils/breadcrumbs.util'
import { transformForm } from '@/utils/form-transform'
import {
  checkValueShouldBeTrue,
  maxLengthValidationFunc,
  numberValidationFunc,
  projectAbbreviationValidationFunc,
  requiredIfEmptyValidationFunc,
  requiredUploadFunc,
  requiredValidationFunc,
  specialCharactersValidationFunc,
} from '@/validations'
import type { ValidateFieldsError } from 'async-validator'
import { ElForm, type FormInstance, type FormItemProp } from 'element-plus'
import type { PropType } from 'vue'
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import ProjectApplicant from './ProjectApplicant.vue'
import ProjectResponsibility from './ProjectResponsibility.vue'
import ProjectUser from './ProjectUser.vue'
import ESupportedMimetype from '@/types/supported-mimetype.enum'
defineProps({
  userRole: {
    type: String as PropType<Role>,
    required: true,
  },
})

// Currently only one platform supported
const platform = PlatformIdentifier.Mii

const { t } = useI18n()

const layoutStore = useLayoutStore()
const router = useRouter()
const { params, query } = useRoute()

const proposalForm = ref<IProposal>()
const proposalId = computed(() => proposalForm.value?._id as string)
const ethicVoteUploads = computed(() =>
  proposalForm.value?.uploads?.filter((upload) => upload.type === DirectUpload.EthicVote),
)
const isReviewMode = computed(() => {
  return !(
    proposalForm.value?.status === undefined ||
    proposalForm.value?.status === ProposalStatus.Draft ||
    proposalForm.value?.status === ProposalStatus.Rework
  )
})

const openDetails = () => {
  if (proposalId.value) {
    router.push({
      name: RouteName.ProposalDetails,
      params: { id: proposalId.value },
    })
  }
}

const feasibilityId = computed(() => proposalForm.value?.userProject.feasibility.id)
const SupportedMimetype = computed(() => {
  return Object.values(ESupportedMimetype)
})
const proposalStore = useProposalStore()
const commentStore = useCommentStore()

const formRef = ref<FormInstance>()

const fileList = ref([])

const bypassDebounce = ref(false)

const isValidToSubmit = ref<boolean>(false)

const { showErrorMessage, showSuccessMessage } = useNotifications()

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
  userProject: {
    generalProjectInformation: {
      projectTitle: [requiredValidationFunc('string'), maxLengthValidationFunc(10000)],
      desiredStartTime: requiredValidationFunc(),
      projectDuration: [requiredValidationFunc('number'), numberValidationFunc()],
      projectFunding: [requiredValidationFunc('string'), maxLengthValidationFunc(10000)],
      fundingReferenceNumber: maxLengthValidationFunc(100),
    },
    feasibility: {
      id: null,
      details: [requiredIfEmptyValidationFunc(feasibilityId), maxLengthValidationFunc(10000)],
    },
    projectDetails: {
      simpleProjectDescription: [requiredValidationFunc('string'), maxLengthValidationFunc(10000)],
      department: requiredValidationFunc('array'),
      scientificBackground: [requiredValidationFunc('string'), maxLengthValidationFunc(10000)],
      hypothesisAndQuestionProjectGoals: [requiredValidationFunc('string'), maxLengthValidationFunc(10000)],
      materialAndMethods: [requiredValidationFunc('string'), maxLengthValidationFunc(10000)],
    },
    ethicVote: {
      ethicsCommittee: [requiredValidationFunc('string'), maxLengthValidationFunc(10000)],
      ethicsVoteNumber: [requiredValidationFunc('string'), maxLengthValidationFunc(100)],
      voteFromDate: requiredValidationFunc(),
      admitReputationOfAttachment: checkValueShouldBeTrue(),
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
      usage: requiredValidationFunc(),
      dataPrivacyExtra: [maxLengthValidationFunc(10000)],
    },
    informationOnRequestedBioSamples: {
      // Handled in component
    },
  },
  requestedData: {
    patientInfo: [requiredValidationFunc('string'), maxLengthValidationFunc(10000)],
    dataInfo: [requiredValidationFunc('string'), maxLengthValidationFunc(10000)],
    desiredDataAmount: requiredValidationFunc('number'),
  },
  status: null,
})

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

const isTermsDialogOpen = ref(false)
const handleTermsConfirm = async () => {
  isTermsDialogOpen.value = false
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

const handleSubmit = async () => {
  if (
    proposalForm.value?.status !== undefined &&
    proposalForm.value.status !== ProposalStatus.Draft &&
    proposalForm.value.status !== ProposalStatus.Rework
  ) {
    return
  }
  formRef.value?.validate((isValid: boolean, invalidFields?: ValidateFieldsError) => {
    if (!isValid && invalidFields) {
      raiseErrors(invalidFields)
      return
    }
    isTermsDialogOpen.value = true
  })
}

const handleSaveDraft = async () => {
  if (
    proposalForm.value?.status !== undefined &&
    proposalForm.value.status !== ProposalStatus.Draft &&
    proposalForm.value.status !== ProposalStatus.Rework
  ) {
    return
  }
  bypassDebounce.value = true

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
}

const onValidate = (_field: FormItemProp, isValid: boolean) => {
  isValidToSubmit.value = isValid
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

  await nextTick()
  isValidToSubmit.value = true
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
})
</script>

<style lang="scss">
@import 'src/assets/sass/variable';

.fdpg-new-proposal-page {
  counter-reset: large-label;

  .fdpg-label--large span::before {
    counter-increment: large-label;
    content: counter(large-label) '. ';
  }

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
    margin-top: 25px;
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

  @media (max-width: $sm) {
    .action-wrapper {
      .el-button {
        width: 100%;
        margin: 0 0 20px 0;
      }
    }
  }
}
</style>
