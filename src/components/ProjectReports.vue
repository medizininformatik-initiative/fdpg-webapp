<template>
  <div class="section reports--container">
    <div class="reports--table--title">
      <h2>{{ $t('proposal.reports') }} {{ `(${reports?.length})` }}</h2>
      <el-button
        v-if="accessForMaintenance"
        type="text"
        :disabled="isDisabled"
        @click="isCreateOrEditModalVisible = true"
      >
        {{ $t('proposal.addReport') }}
      </el-button>
    </div>
    <div v-if="reports?.length" class="reports--table--border">
      <el-table :data="reports" style="width: 100%">
        <el-table-column prop="createdAt" :label="$t('general.date')">
          <template #default="scope">
            {{ getLocaleDateString(scope.row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column prop="title" :label="$t('proposal.researcherTitle')">
          <template #default="scope">
            <span class="report-title">{{ scope.row.title }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="uploads" :label="$t('proposal.album')">
          <template #default="scope">
            <ReportGallery :uploads="scope.row.uploads" />
          </template>
        </el-table-column>
        <el-table-column v-if="!isDisabled" prop="text" :label="$t('proposal.text')">
          <template #default="scope">
            <span
              tabindex="0"
              role="button"
              class="reports--actions__cursor"
              @keyup.enter="editReport($event, scope.row)"
              @click="editReport($event, scope.row)"
            >
              <span class="fa fa-newspaper"></span> &nbsp;
              {{ !accessForMaintenance ? $t('proposal.viewReport') : $t('proposal.editReport') }}</span
            >
          </template>
        </el-table-column>
        <el-table-column v-if="accessForMaintenance" width="65px">
          <template #default="scope">
            <div class="reports--actions__display">
              <span
                tabindex="0"
                class="fa fa-trash reports--actions__cursor"
                :class="{ 'reports--icon__disable': isDisabled }"
                @keyup.enter="handleDeleteReport($event, scope.row._id)"
                @click="handleDeleteReport($event, scope.row._id)"
              ></span>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div v-else class="reports--table--empty">
      <img src="@/assets/img/proposal/empty-reports.svg" alt="" />
      <h5>{{ $t('proposal.noReport') }}</h5>
    </div>
  </div>
  <ReportDialog
    v-if="accessForMaintenance"
    v-model="isCreateOrEditModalVisible"
    v-model:report="currentReport"
    :proposal-id="proposalId"
    @reset="resetForm"
  >
  </ReportDialog>
  <ViewReportDialog
    v-if="!accessForMaintenance"
    v-model="isCreateOrEditModalVisible"
    v-model:report="currentReport"
    :proposal-id="proposalId"
    @reset="resetForm"
  >
  </ViewReportDialog>
</template>

<script setup lang="ts">
import type { IReportGet } from '@/types/proposal.types'
import { computed, ref, defineAsyncComponent, onMounted } from 'vue'
import { useProposalStore } from '@/stores/proposal/proposal.store'
import { useMessageBoxStore } from '@/stores/messageBox.store'
import { getLocaleDateString } from '@/utils/date.util'
import ReportGallery from '@/components/ReportGallery.vue'
import useNotifications from '@/composables/use-notifications'

const proposalId = computed(() => proposalStore.currentProposal?._id ?? '')
const ReportDialog = defineAsyncComponent(() => import('./ReportDialog.vue'))
const ViewReportDialog = defineAsyncComponent(() => import('./ViewReportDialog.vue'))

const messageBoxStore = useMessageBoxStore()
const { showErrorMessage } = useNotifications()

const proposalStore = useProposalStore()
const isCreateOrEditModalVisible = ref(false)
const reports = computed<IReportGet[] | undefined>(() => {
  return proposalStore.currentProposal?.reports
})
onMounted(async () => {
  try {
    await proposalStore.getReports(proposalId.value)
  } catch {
    showErrorMessage()
  }
})
const props = defineProps({
  accessForMaintenance: {
    type: Boolean,
    default: false,
  },
  isDisabled: {
    type: Boolean,
    default: false,
  },
})
const currentReport = ref<IReportGet>({
  title: '',
  _id: '',
  createdAt: '',
  updatedAt: '',
  uploads: [],
  content: '',
})
const editReport = (event: Event, report: IReportGet) => {
  if (props.isDisabled) {
    event.preventDefault()
    return
  }
  currentReport.value = { ...report }
  isCreateOrEditModalVisible.value = true
}
const handleDeleteReport = (event: Event, proposalId: string) => {
  if (props.isDisabled) {
    event.preventDefault()
    return
  }
  messageBoxStore.setMessageBoxInfo({
    cancelButtonText: 'general.cancel',
    cancelButtonClass: 'el-button--text',
    showCancelButton: true,
    title: 'proposal.deleteReport',
    message: 'proposal.deleteReportModalDescription',
    confirmButtonText: 'proposal.acceptContractDizModalAction',
    callback: (decision: 'confirm' | 'cancel' | 'close') =>
      decision === 'confirm' ? deleteReport(proposalId) : undefined,
  })
}
const deleteReport = async (reportId) => {
  try {
    await proposalStore.deleteReport(proposalId.value, reportId)
  } catch (error) {
    showErrorMessage()
  }
}
const resetForm = () => {
  currentReport.value = {
    title: '',
    _id: '',
    createdAt: '',
    updatedAt: '',
    uploads: [],
    content: '',
  }
}
</script>

<style lang="scss" scoped>
@import 'src/assets/sass/variable';
.reports--container {
  .reports--table--border {
    border-radius: 3px;
    border: 1px solid $gray-700;
  }
  .reports--table--title {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .reports--table--empty {
    display: flex;
    align-items: center;
    flex-direction: column;
    border-radius: 3px;
    border: 1px solid $gray-700;

    i {
      color: $green;
      font-size: 40px;
      margin-top: 11px;
      line-height: 58px;
    }

    h5 {
      font-size: 18px;
      margin: 0 0 19px;
    }
  }
  .reports--actions__cursor {
    cursor: pointer;
  }
  .reports--actions__display {
    display: flex;
    align-items: center;
    justify-content: space-between;
    .fa-trash:hover {
      color: $red;
    }
    .fa-edit:hover {
      color: $blue;
    }
    .reports--icon__disable {
      color: $gray-700;
      cursor: not-allowed;
    }
    .reports--icon__disable:hover {
      color: $gray-700;
    }
  }
}
.highligh-tabindex:focus {
  text-decoration-line: underline;
  color: rgb(64, 158, 255);
}
.report-title {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
