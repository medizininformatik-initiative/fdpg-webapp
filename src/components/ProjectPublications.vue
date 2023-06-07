<template>
  <div class="section publications">
    <div class="table-title">
      <h2>{{ $t('proposal.publications') }} {{ `(${publications?.length})` }}</h2>
      <el-button
        v-if="accessForMaintenance"
        type="text"
        :disabled="isDisabled"
        @click="isCreateOrEditModalVisible = true"
      >
        {{ $t('proposal.addPublication') }}
      </el-button>
    </div>
    <div v-if="publications?.length" class="table-border">
      <el-table :data="publications" style="width: 100%">
        <el-table-column prop="createdAt" :label="$t('general.date')">
          <template #default="scope">
            {{ getLocaleDateString(scope.row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column prop="title" :label="$t('proposal.researcherTitle')" />
        <el-table-column prop="doi" :label="$t('proposal.doi')" />
        <el-table-column prop="link" :label="$t('proposal.link')">
          <template #default="scope">
            <el-link :href="scope.row.link" target="_blank" class="highligh-tabindex">{{
              $t('proposal.publicationLinkItemInTable')
            }}</el-link>
          </template>
        </el-table-column>
        <el-table-column v-if="accessForMaintenance" width="65px">
          <template #default="scope">
            <div class="action-wrapper">
              <span
                tabindex="0"
                class="fa fa-trash button-style"
                :class="{ 'disable-icon': isDisabled }"
                @keyup.enter="handleDeletePublication($event, scope.row._id)"
                @click="handleDeletePublication($event, scope.row._id)"
              ></span>
              <span
                tabindex="0"
                class="fa fa-edit button-style"
                :class="{ 'disable-icon': isDisabled }"
                @keyup.enter="editPublication($event, scope.row)"
                @click="editPublication($event, scope.row)"
              ></span>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div v-else class="table--empty">
      <img src="@/assets/img/proposal/emty-publications.svg" alt="" />
      <h5>{{ $t('proposal.noPublications') }}</h5>
    </div>
  </div>
  <PublicationDialog
    v-if="accessForMaintenance"
    v-model="isCreateOrEditModalVisible"
    :publication="currentPublication"
    :proposal-id="proposalId"
    @reset="resetForm"
  >
  </PublicationDialog>
</template>

<script setup lang="ts">
import useNotifications from '@/composables/use-notifications'
import { useMessageBoxStore } from '@/stores/messageBox.store'
import { useProposalStore } from '@/stores/proposal/proposal.store'
import type { IPublicationGet } from '@/types/proposal.types'
import { getLocaleDateString } from '@/utils/date.util'
import { computed, defineAsyncComponent, ref } from 'vue'
const PublicationDialog = defineAsyncComponent(() => import('./PublicationDialog.vue'))

const messageBoxStore = useMessageBoxStore()
const { showErrorMessage } = useNotifications()

const proposalId = computed(() => proposalStore.currentProposal?._id ?? '')
const proposalStore = useProposalStore()
const isCreateOrEditModalVisible = ref(false)
const publications = computed(() => {
  return proposalStore.currentProposal?.publications
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
const currentPublication = ref<IPublicationGet>({
  title: '',
  doi: '',
  link: '',
  _id: '',
  createdAt: '',
  updatedAt: '',
})
const editPublication = (event: Event, publication: IPublicationGet) => {
  if (props.isDisabled) {
    event.preventDefault()
    return
  }
  currentPublication.value = { ...publication }
  isCreateOrEditModalVisible.value = true
}
const handleDeletePublication = (event: Event, proposalId: string) => {
  if (props.isDisabled) {
    event.preventDefault()
    return
  }
  messageBoxStore.setMessageBoxInfo({
    cancelButtonText: 'general.cancel',
    cancelButtonClass: 'el-button--text',
    showCancelButton: true,
    title: 'proposal.deletePublication',
    message: 'proposal.deletePublicationModalDescription',
    confirmButtonText: 'proposal.acceptContractDizModalAction',
    callback: (decision: 'confirm' | 'cancel' | 'close') =>
      decision === 'confirm' ? deletePublication(proposalId) : undefined,
  })
}
const deletePublication = (publicationId) => {
  try {
    proposalStore.deletePublication(proposalId.value, publicationId)
  } catch (error) {
    showErrorMessage()
  }
}
const resetForm = () => {
  currentPublication.value = {
    title: '',
    doi: '',
    link: '',
    _id: '',
    createdAt: '',
    updatedAt: '',
  }
}
</script>

<style lang="scss" scoped>
@import 'src/assets/sass/variable';
.publications {
  .table-border {
    border-radius: 3px;
    border: 1px solid $gray-700;
  }
  .table-title {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .table--empty {
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
  .action-wrapper {
    display: flex;
    align-items: center;
    justify-content: space-between;
    .button-style {
      cursor: pointer;
    }
    .fa-trash:hover {
      color: $red;
    }
    .fa-edit:hover {
      color: $blue;
    }
    .disable-icon {
      color: $gray-700;
      cursor: not-allowed;
    }
    .disable-icon:hover {
      color: $gray-700;
    }
  }
}
.highligh-tabindex:focus {
  text-decoration-line: underline;
  color: rgb(64, 158, 255);
}
</style>
