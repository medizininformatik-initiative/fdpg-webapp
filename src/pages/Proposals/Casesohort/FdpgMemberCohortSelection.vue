<template>
  <el-card>
    <el-row>
      <el-col :sm="24">
        <div class="cohort-selection">
          <FdpgLabel html-for="proposal.cohortSelection" size="medium" />

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

            <el-table-column :label="t('proposal.numberOfPatients')">
              <template #default="scope">
                <span v-if="scope.row.numberOfPatients"
                  >{{ t('proposal.numberOfPatients') }}: {{ scope.row.numberOfPatients }}</span
                >
              </template>
            </el-table-column>

            <el-table-column :label="t('proposal.viewQuery')">
              <template #default="scope">
                <span>{{ t('proposal.viewQuery') }}</span>
              </template>
            </el-table-column>

            <el-table-column width="100">
              <template #default="scope">
                <el-button
                  v-if="enableEdit"
                  type="primary"
                  link
                  @click="handleDelete(scope.row)"
                  data-test-id="deleteCohort"
                >
                  <i class="fa-solid fa-trash"></i>
                </el-button>
              </template>
            </el-table-column>
          </el-table>

          <div v-if="cohorts.length < 49 && enableEdit" class="cohort-actions">
            <el-button type="primary" @click="openManualDialog" data-test-id="addCohortManual">
              {{ t('proposal.addCohortManual') }}
            </el-button>
          </div>
          <div v-else class="cohort-limit-warning">
            <el-alert type="warning" :closable="false" show-icon>
              {{ t('proposal.maxCohortsReached') }}
            </el-alert>
          </div>

          <!-- Manual Cohort Dialog -->
          <ManualCohortDialog
            v-model="isManualDialogOpen"
            @close="closeManualDialog"
            @add="handleManualAdd"
            :form-ref="formRef"
          />
        </div>
      </el-col>
    </el-row>
  </el-card>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import type { FormInstance, UploadFile } from 'element-plus'
import type { ISelectedCohort } from '@/types/proposal.types'
import { useVModel } from '@vueuse/core'
import ManualCohortDialog from './ManualCohortDialog.vue'
import useNotifications from '@/composables/use-notifications'
import { useProposalStore } from '@/stores/proposal/proposal.store'

const { t } = useI18n()
const { showErrorMessage } = useNotifications()

const props = defineProps({
  modelValue: {
    type: Array as () => ISelectedCohort[],
    required: true,
    default: () => [],
  },
  enableEdit: {
    type: Boolean,
    default: false,
  },
})

const proposalStore = useProposalStore()
const proposalId = computed(() => proposalStore.currentProposal?._id)

const emit = defineEmits(['update:modelValue', 'update:uploads', 'change'])

const cohorts = useVModel(props, 'modelValue', emit)
const formRef = ref<FormInstance>()

const addCohort = (newCohort: ISelectedCohort) => {
  if (cohorts.value.length >= 49) {
    showErrorMessage(t('proposal.maxCohortsReached'))
    return
  }
  cohorts.value = [...cohorts.value, newCohort]
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

      closeManualDialog()
    }
  } catch (e) {
    showErrorMessage()
  }

  emit('change')
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
  const _proposalId = proposalId.value

  try {
    if (_proposalId && cohort._id && cohort.uploadId) {
      await proposalStore.deleteCohort(_proposalId, cohort._id)
    }
  } catch (e) {
    showErrorMessage()
    return
  }

  if (!!cohort._id) {
    cohorts.value = cohorts.value.filter((c) => c._id !== cohort._id)
  } else {
    showErrorMessage()
  }
  emit('change')
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
