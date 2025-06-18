<template>
  <FdpgLabel html-for="proposal.MII" size="large" class="mt-22" />
  <el-card>
    <el-row>
      <el-col :sm="24">
        <FdpgFormItem prop="userProject.cohorts.selectedCohorts">
          <div class="cohort-selection">
            <FdpgLabel html-for="proposal.cohortSelection" size="medium" />

            <el-table
              v-if="cohort.selectedCohorts.length > 0"
              :data="cohort.selectedCohorts"
              class="cohort-table"
              fit
              :show-header="false"
              :border="false"
              :cell-style="{ border: 'none' }"
              :row-style="{ border: 'none' }"
            >
              <el-table-column prop="label" />

              <el-table-column :label="t('proposal.numberOfPatients')">
                <template #default="scope">
                  <span v-if="scope.row.numberOfPatients"
                    >{{ t('proposal.numberOfPatients') }}: {{ scope.row.numberOfPatients }}</span
                  >
                </template>
              </el-table-column>

              <el-table-column :label="t('proposal.viewQuery')">
                <template #default="scope">
                  <el-button
                    v-if="scope.row.feasibilityQueryId"
                    type="primary"
                    link
                    @click="downloadCsv(scope.row.feasibilityQueryId, scope.row.label)"
                    data-test-id="downloadCsv"
                  >
                    {{ t('proposal.viewQuery') }}
                  </el-button>
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

            <div v-if="cohort.selectedCohorts.length < 49" class="cohort-actions">
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

            <!-- Automatic Cohort Dialog -->
            <AutomaticCohortDialog
              v-model="isAutomaticDialogOpen"
              @close="closeAutomaticDialog"
              @add="handleAutomaticAdd"
              @remove="handleAutomaticRemove"
              :form-ref="formRef"
              :already-selected="modelValue.selectedCohorts"
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
        <FdpgFormItem prop="userProject.cohorts.details">
          <FdpgLabel html-for="proposal.assessmentOfFeasibilityDetails" />
          <FdpgTextEditor
            v-model="cohort.details"
            data-testId="cohorts.details"
            :placeholder="t('proposal.pleaseEnterAssessmentOfFeasibilityDetails')"
            :disabled="reviewMode || cohort.isDone"
            :form-ref="formRef"
            field-path="userProject.cohorts.details"
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
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import type { FormInstance, UploadFile } from 'element-plus'
import type { ICohort, ISelectedCohort, IUpload } from '@/types/proposal.types'
import { useVModel } from '@vueuse/core'
import AutomaticCohortDialog from './AutomaticCohortDialog.vue'
import ManualCohortDialog from './ManualCohortDialog.vue'
import useNotifications from '@/composables/use-notifications'
import { useProposalStore } from '@/stores/proposal/proposal.store'
import { UseCaseUpload } from '@/types/upload.types'
import { useFeasibilityStore } from '@/stores/feasibility.store'

const { t } = useI18n()
const { showErrorMessage } = useNotifications()

const props = defineProps({
  modelValue: {
    type: Object as () => ICohort,
    required: true,
    default: () => {},
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

const feasibilityStore = useFeasibilityStore()

const proposalStore = useProposalStore()
const proposalId = computed(() => proposalStore.currentProposal?._id)

const emit = defineEmits(['update:modelValue', 'update:requestedDataForm', 'update:uploads'])

const cohort = useVModel(props, 'modelValue', emit)
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
  if (cohort.value.selectedCohorts.length >= 49) {
    showErrorMessage(t('proposal.maxCohortsReached'))
    return
  }

  cohort.value.selectedCohorts = [...cohort.value.selectedCohorts, newCohort]
}

const updateFiles = (file: IUpload, mode: 'add' | 'remove') => {
  if (mode === 'add') {
    uploads.value.push(file)
  } else {
    uploads.value = uploads.value.filter((f) => f._id !== file._id)
  }
}

const handleAutomaticAdd = (newCohorts: ISelectedCohort[]) => {
  newCohorts.forEach(addCohort)
  closeAutomaticDialog()
}

const handleAutomaticRemove = (removedCohorts: ISelectedCohort[]) => {
  removedCohorts.forEach(handleDelete)
  closeAutomaticDialog()
}

const handleManualAdd = async (newCohort: ISelectedCohort, { raw }: UploadFile) => {
  const _proposalId = proposalId.value

  if (!raw) {
    showErrorMessage()
  }

  try {
    if (_proposalId) {
      const { insertedCohort, uploadedFile } = await proposalStore.uploadManualCohort(
        _proposalId,
        newCohort,
        raw as File,
      )

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

const downloadCsv = async (id?: number, label?: string) => {
  if (!id || !label) {
    showErrorMessage()
    return
  }
  try {
    await feasibilityStore.getCsvByQueryId(id, label)
  } catch (e) {
    showErrorMessage()
  }
}

const handleDelete = async (deletedCohort: ISelectedCohort) => {
  const _proposalId = proposalId.value

  try {
    if (_proposalId && deletedCohort._id && deletedCohort.uploadId) {
      await proposalStore.deleteCohort(_proposalId, deletedCohort._id)
      updateFiles(
        { _id: deletedCohort.uploadId, fileName: '', fileSize: 0, type: UseCaseUpload.FeasibilityQuery, createdAt: '' },
        'remove',
      )
    }
  } catch (e) {
    showErrorMessage()
    return
  }

  if (!!deletedCohort._id) {
    cohort.value.selectedCohorts = cohort.value.selectedCohorts.filter((c) => c._id !== deletedCohort._id)
  } else if (!!deletedCohort.feasibilityQueryId) {
    cohort.value.selectedCohorts = cohort.value.selectedCohorts.filter(
      (c) => c.feasibilityQueryId !== deletedCohort.feasibilityQueryId,
    )
  } else {
    showErrorMessage()
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
