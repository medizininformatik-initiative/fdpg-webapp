<template>
  <FdpgLabel html-for="proposal.MII" size="large" class="mt-22" />
  <el-card>
    <el-row>
      <el-col :sm="24">
        <FdpgFormItem prop="userProject.cohorts.selectedCohorts">
          <div class="cohort-selection">
            <FdpgLabel html-for="proposal.cohortSelection" size="medium" />

            <div v-if="cohorts.selectedCohorts.length < 49" class="cohort-actions">
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
              v-if="cohorts.selectedCohorts.length > 0"
              :data="cohorts.selectedCohorts"
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
            <ManualCohortDialog v-model="isManualDialogOpen" @close="closeManualDialog" />
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
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import type { FormInstance } from 'element-plus'
import type { IFeasibility, ICohort, ICohorts } from '@/types/proposal.types'
import { useVModel } from '@vueuse/core'
import AutomaticCohortDialog from './AutomaticCohortDialog.vue'
import ManualCohortDialog from './ManualCohortDialog.vue'
import useNotifications from '@/composables/use-notifications'

const { t } = useI18n()
const { showErrorMessage } = useNotifications()

const props = defineProps({
  modelValue: {
    type: Array as () => ICohorts,
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
  reviewMode: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:modelValue', 'update:feasibilityForm', 'update:requestedDataForm'])

const cohorts = useVModel(props, 'modelValue', emit)
const feasibilityForm = useVModel(props, 'feasibilityForm', emit)
const requestedDataForm = useVModel(props, 'requestedDataForm', emit)
// Automatic cohort dialog
const isAutomaticDialogOpen = ref(false)
const formRef = ref<FormInstance>()

const openAutomaticDialog = () => {
  isAutomaticDialogOpen.value = true
}

const closeAutomaticDialog = () => {
  isAutomaticDialogOpen.value = false
}

const handleAutomaticAdd = async (newCohort: ICohort) => {
  if (cohorts.value.length >= 49) {
    showErrorMessage(t('proposal.maxCohortsReached'))
    return
  }
  cohorts.value.selectedCohorts = [...cohorts.value.selectedCohorts, newCohort]
  closeAutomaticDialog()
}

// Manual cohort dialog
const isManualDialogOpen = ref(false)

const openManualDialog = () => {
  isManualDialogOpen.value = true
}

const closeManualDialog = () => {
  isManualDialogOpen.value = false
}

const handleDelete = (cohort: ICohort) => {
  cohorts.value.selectedCohorts = cohorts.value.selectedCohorts.filter(
    (c) => c.feasibilityQueryId !== cohort.feasibilityQueryId,
  )
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
