<template>
  <FdpgLabel html-for="proposal.MII" size="large" class="mt-22" />
  <el-card>
    <el-row>
      <el-col :sm="24">
        <FdpgFormItem prop="userProject.cohorts.selectedCohorts">
          <div class="cohort-selection">
            <FdpgLabel html-for="proposal.cohortSelection" size="medium" />

            <div v-if="cohorts.length < 49" class="cohort-actions">
              <el-button type="primary" @click="openAutomaticDialog" data-test-id="addCohortAutomatic">
                {{ t('proposal.addCohortAutomatic') }}
              </el-button>
              <el-button type="primary" @click="openManualDialog" data-test-id="addCohortManual">
                {{ t('proposal.addCohortManual') }}
              </el-button>
            </div>
            <div v-else class="cohort-limit-warning">
              <el-alert type="warning" :closable="false" show-icon>
                {{ t('proposal.maxCohortsReached') }}
              </el-alert>
            </div>

            <el-table
              v-if="cohorts.length > 0"
              :data="cohorts"
              class="cohort-table"
              fit
              :show-header="false"
              :border="false"
              :cell-style="{ border: 'none' }"
              :row-style="{ border: 'none' }"
            >
              <el-table-column prop="label" />
              <el-table-column :label="t('proposal.viewQuery')">
                <template #default="scope">
                  <span>{{ t('proposal.viewQuery') }}</span>
                </template>
              </el-table-column>
              <el-table-column width="100">
                <template #default="scope">
                  <el-button type="primary" link @click="handleDelete(scope.row)" data-test-id="deleteCohort">
                    <i class="fa-solid fa-trash"></i>
                  </el-button>
                </template>
              </el-table-column>
            </el-table>

            <!-- Automatic Cohort Dialog -->
            <AutomaticCohortDialog
              v-model="isAutomaticDialogOpen"
              @close="closeAutomaticDialog"
              @add="handleAutomaticAdd"
              :form-ref="formRef"
            />

            <!-- Manual Cohort Dialog -->
            <ManualCohortDialog
              v-model="isManualDialogOpen"
              @close="closeManualDialog"
              @add="handleManualAdd"
              :form-ref="formRef"
            />
          </div>
        </FdpgFormItem>
      </el-col>
      <el-col :sm="24">
        <FdpgFormItem prop="userProject.feasibility.details">
          <FdpgLabel html-for="proposal.assessmentOfFeasibilityDetails" />
          <FdpgTextEditor
            v-model="feasibilityForm.details"
            data-testId="feasibilityForm.details"
            :placeholder="t('proposal.pleaseEnterAssessmentOfFeasibilityDetails')"
            :disabled="reviewMode || feasibilityForm.isDone"
            :form-ref="formRef"
            field-path="userProject.feasibility.details"
          />
        </FdpgFormItem>
      </el-col>
      <el-col :sm="24">
        <FdpgFormItem prop="requestedData.patientInfo">
          <FdpgLabel html-for="proposal.patientInfo" required />
          <FdpgInput
            v-model="requestedDataForm.patientInfo"
            data-testId="requestedData.patientInfo"
            placeholder="proposal.pleaseEnterYourDetailsForPatientSelectionHere"
            :disabled="reviewMode || requestedDataForm.isDone"
          />
        </FdpgFormItem>
      </el-col>
    </el-row>
  </el-card>
</template>

<script setup lang="ts">
import { computed, ref, type PropType } from 'vue'
import { useI18n } from 'vue-i18n'
import type { FormInstance } from 'element-plus'
import type { IFeasibility, ICohort, ISelectedCohort, IUpload } from '@/types/proposal.types'
import { useVModel } from '@vueuse/core'
import AutomaticCohortDialog from './AutomaticCohortDialog.vue'
import ManualCohortDialog from './ManualCohortDialog.vue'
import useNotifications from '@/composables/use-notifications'
import { useProposalStore } from '@/stores/proposal/proposal.store'
import { UseCaseUpload } from '@/types/upload.types'

const { t } = useI18n()
const { showErrorMessage } = useNotifications()

const props = defineProps({
  modelValue: {
    type: Array as () => ISelectedCohort[],
    required: true,
    default: () => [],
  },
  feasibilityForm: {
    type: Object as () => IFeasibility,
    required: true,
  },
  requestedDataForm: {
    type: Object as () => { patientInfo: string; isDone?: boolean },
    required: true,
  },
  formRef: {
    type: Object as () => FormInstance | undefined,
    required: false,
    default: () => undefined,
  },
  uploads: {
    type: Array as () => IUpload[],
    default: () => [],
  },
  reviewMode: {
    type: Boolean,
    default: false,
  },
})

const proposalStore = useProposalStore()
const proposalId = computed(() => proposalStore.currentProposal?._id)

const emit = defineEmits(['update:modelValue', 'update:feasibilityForm', 'update:requestedDataForm', 'update:uploads'])

const cohorts = useVModel(props, 'modelValue', emit)
const feasibilityForm = useVModel(props, 'feasibilityForm', emit)
const requestedDataForm = useVModel(props, 'requestedDataForm', emit)
const uploads = useVModel(props, 'uploads', emit)
// Automatic cohort dialog
const isAutomaticDialogOpen = ref(false)
const formRef = ref<FormInstance>()

const openAutomaticDialog = () => {
  isAutomaticDialogOpen.value = true
}

const closeAutomaticDialog = () => {
  isAutomaticDialogOpen.value = false
}

const addCohort = (newCohort: ISelectedCohort) => {
  if (cohorts.value.length >= 49) {
    showErrorMessage(t('proposal.maxCohortsReached'))
    return
  }
  cohorts.value = [...cohorts.value, newCohort]
}

const updateFiles = (file: IUpload, mode: 'add' | 'remove') => {
  if (mode === 'add') {
    uploads.value.push(file)
  } else {
    uploads.value = uploads.value.filter((f) => f._id !== file._id)
  }
}

const handleAutomaticAdd = (newCohort: ISelectedCohort) => {
  addCohort(newCohort)
  closeAutomaticDialog()
}

const handleManualAdd = async (newCohort: ICohort, file: File) => {
  try {
    if (proposalId.value) {
      const { insertedCohort, uploadedFile } = await proposalStore.uploadManualCohort(proposalId.value, newCohort, file)
      if (insertedCohort) {
        addCohort(insertedCohort)
      }

      if (uploadedFile) {
        updateFiles(uploadedFile, 'add')
      }

      closeManualDialog()
    }
  } catch (e) {
    showErrorMessage()
  }
}

// Manual cohort dialog
const isManualDialogOpen = ref(false)

const openManualDialog = () => {
  isManualDialogOpen.value = true
}

const closeManualDialog = () => {
  isManualDialogOpen.value = false
}

const handleDelete = async (cohort: ISelectedCohort) => {
  if (!!cohort._id) {
    cohorts.value = cohorts.value.filter((c) => c._id !== cohort._id)
  } else if (!!cohort.feasibilityQueryId) {
    cohorts.value = cohorts.value.filter((c) => c.feasibilityQueryId !== cohort.feasibilityQueryId)
  } else {
    showErrorMessage()
  }

  if (cohort.isManualUpload && proposalId.value && cohort._id) {
    await proposalStore.deleteCohort(proposalId.value, cohort._id)
    if (cohort.uploadId) {
      updateFiles(
        { _id: cohort.uploadId, fileName: '', fileSize: 0, type: UseCaseUpload.FeasibilityQuery, createdAt: '' },
        'remove',
      )
    }
  }
}
</script>

<style lang="scss" scoped>
.mt-22 {
  margin-top: 22px;
}
.cohort-selection {
  margin-bottom: 2rem;

  .cohort-actions {
    display: flex;
    gap: 1rem;
    margin: 1rem 0;
  }

  .cohort-table {
    margin: 1rem 0;
    width: 100%;

    :deep(.el-table__body-wrapper) {
      width: 100%;
    }

    :deep(.el-table__header-wrapper) {
      display: none;
    }

    :deep(.el-table__body),
    :deep(.el-table__header) {
      width: 100% !important;
    }

    :deep(.el-table__cell) {
      border: none !important;
    }

    :deep(.el-table__row) {
      border-bottom: none !important;
    }

    :deep(.el-table__inner-wrapper::before) {
      display: none !important;
    }

    :deep(.el-table) {
      border: none !important;
    }

    :deep(.el-table--border) {
      border: none !important;
    }

    :deep(.el-table__border-left-patch) {
      display: none !important;
    }
  }

  .cohort-limit-warning {
    margin: 1rem 0;
  }

  .upload-button {
    i::before {
      transform: rotate(90deg);
    }
  }
}
</style>
