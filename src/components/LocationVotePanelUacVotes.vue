<template>
  <section role="region" class="uac-votes">
    <el-collapse v-model="activeNames">
      <el-collapse-item v-for="(table, tableIdx) in tables" :key="'table' + tableIdx" :name="tableIdx">
        <template #title>
          <h3 tabindex="0" role="button">
            <span class="indicator" :class="table.indicator"></span
            >{{ $t(table.title, { count: table.content.length }) }}
          </h3>
        </template>

        <template v-if="table.content.length || table.conditionalApprovals">
          <section role="region" class="box-wrapper">
            <el-table
              v-if="table.content.length"
              ref="tab"
              :data="table.content.slice(0, fullViewTables[tableIdx] ? table.content.length : 3)"
              style="width: 100%"
              :cell-style="() => ({ 'border-bottom': 0 })"
            >
              <el-table-column v-if="table.tableId === TableId.Excluded" type="expand">
                <template #default="props">
                  <section role="region" class="decline-reason">
                    <h4>{{ $t('proposal.locationVoteExcludeReasonSectionTitle') }}</h4>
                    <dl v-if="props.row.declineReason" class="decline-reason__data">
                      <dt>{{ $t('proposal.locationVoteExcludeReasonTitleForType') }}</dt>
                      <dd>{{ $t(`proposal.locationVoteExcludeReasonType_${props.row.declineReason.type}`) }}</dd>

                      <dt>{{ $t('proposal.locationVoteExcludeReasonTitleForDate') }}</dt>
                      <dd>
                        {{
                          new Date(props.row.declineReason.createdAt).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit',
                          })
                        }}
                      </dd>
                      <dt>{{ $t('proposal.locationVoteExcludeReasonTitleForReason') }}</dt>
                      <dd>{{ props.row.declineReason?.reason || '-' }}</dd>
                    </dl>

                    <p v-else>--</p>
                  </section>
                </template>
              </el-table-column>

              <template v-for="(column, columnIdx) in tableColumns" :key="'column' + columnIdx">
                <el-table-column
                  v-if="(column.prop !== 'dataAmount' || !table.hideDataVolume) && column.prop !== 'revert'"
                  :prop="column.prop"
                  :label="$t(column.label)"
                  :width="column.width"
                  :min-width="column.minWidth"
                />
                <el-table-column
                  v-if="column.prop === 'revert' && !table.hideRevert"
                  :label="$t(column.label)"
                  :width="column.width"
                  :min-width="column.minWidth"
                >
                  <template
                    v-if="proposalStore.currentProposal?.status === ProposalStatus.LocationCheck"
                    #default="props"
                  >
                    <el-button
                      :data-testId="'button__revert__' + props.row.location"
                      @click="handleRevertLocation(props.row.location)"
                    >
                      <el-icon class="bi-arrow-counterclockwise"></el-icon>
                    </el-button>
                  </template>
                </el-table-column>
              </template>
              <el-table-column width="1" v-if="table.tableId === TableId.Excluded"
                ><span
                  class="rowsHiddenFocusable"
                  tabindex="0"
                  role="button"
                  @keydown.enter="triggerRowClick($event)"
                ></span
              ></el-table-column>
            </el-table>

            <div v-else class="box-wrapper no-location-placeholder">{{ $t('proposal.noLocationInCurrentState') }}</div>

            <div
              v-if="table.content.length > 3"
              class="show-more"
              role="button"
              @click="showMore(tableIdx)"
              @keyup.enter="showMore(tableIdx)"
            >
              <span>{{ fullViewTables[tableIdx] ? $t('dashboard.showLess') : $t('dashboard.showMore') }}</span>
              <span v-if="!fullViewTables[tableIdx]"> ({{ table.content.length - 3 }})</span>
              <i :class="fullViewTables[tableIdx] ? 'el-icon-arrow-up' : 'el-icon-arrow-down'" tabindex="0" />
            </div>
          </section>

          <section v-if="table.conditionalApprovals" role="region" class="box-wrapper contract-conditions">
            <h3>
              <i :class="'bi-file-earmark-check'" aria-hidden="true" />{{
                $t('proposal.locationConditions', { count: table.conditionalApprovals.length })
              }}
            </h3>
            <section
              v-for="(conditionalApproval, conditionIdx) in table.conditionalApprovals"
              :key="'conditional' + conditionIdx"
              role="row"
              class="contract-condition-row"
            >
              <div
                v-if="authStore.singleKnownRole === Role.FdpgMember"
                role="button"
                class="condition-text cursor-pointer"
                :data-testId="'button__condition-download__' + conditionalApproval.location"
                tabindex="0"
                @click="handleDownload(conditionalApproval.uploadId)"
                @keydown.enter="handleDownload(conditionalApproval.uploadId)"
              >
                {{ MII_LOCATIONS[conditionalApproval.location].display }}: {{ conditionalApproval.upload.fileName }}
              </div>
              <div
                v-else
                class="condition-text"
                :data-testId="'button__condition-download__' + conditionalApproval.location"
              >
                {{ MII_LOCATIONS[conditionalApproval.location].display }}
              </div>

              <div class="condition-interaction">
                <div class="condition-data-amount">
                  {{ $t('proposal.conditionApprovalDataVolume', { amount: conditionalApproval.dataAmount }) }}
                </div>
                <div class="condition-status" :class="conditionalApproval.statusTagStyle">
                  {{ $t(conditionalApproval.statusTagText) }}
                </div>

                <div v-if="authStore.singleKnownRole === Role.FdpgMember" class="condition-actions">
                  <el-button
                    class="negative"
                    :class="conditionalApproval.statusTagStyle"
                    :disabled="conditionalApproval.reviewedAt !== undefined"
                    :data-testId="'button__condition-decline__' + conditionalApproval.location"
                    @click="acceptCondition(conditionalApproval._id, false)"
                    ><i class="el-icon-close" role="button"
                  /></el-button>
                  <el-button
                    class="positive"
                    :class="conditionalApproval.statusTagStyle"
                    :disabled="conditionalApproval.reviewedAt !== undefined"
                    :data-testId="'button__condition-accept__' + conditionalApproval.location"
                    @click="acceptCondition(conditionalApproval._id, true)"
                  >
                    <i class="el-icon-check" role="button" />
                  </el-button>
                </div>
              </div>
            </section>
          </section>
        </template>

        <div v-else class="box-wrapper no-location-placeholder">{{ $t('proposal.noLocationInCurrentState') }}</div>
      </el-collapse-item>
    </el-collapse>
  </section>
</template>

<script setup lang="ts">
import useDownload from '@/composables/use-download'
import useNotifications from '@/composables/use-notifications'
import useUpload from '@/composables/use-upload'
import { MII_LOCATIONS } from '@/constants'
import type { TranslationSchema } from '@/plugins/i18n'
import { useProposalStore } from '@/stores/proposal/proposal.store'
import type { MiiLocation } from '@/types/location.enum'
import { ElTable } from 'element-plus'
import type { IConditionalApproval, IDeclineReason, IUacApproval, IUpload } from '@/types/proposal.types'
import { ProposalStatus } from '@/types/proposal.types'
import { UseCaseUpload } from '@/types/upload.types'
import { ref, computed, nextTick, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth/auth.store'
import { Role } from '@/types/oidc.types'
import { useMessageBoxStore, type DecisionType } from '@/stores/messageBox.store'
import { useI18n } from 'vue-i18n'

const proposalStore = useProposalStore()
const proposalId = computed(() => proposalStore.currentProposal?._id ?? '')
const authStore = useAuthStore()
const messageBoxStore = useMessageBoxStore()
const { t } = useI18n()
interface IPanelInputConfig<T extends MiiLocation | IConditionalApproval | IUacApproval> {
  data: T[]
  title: TranslationSchema
  indicator: 'green' | 'blue' | 'red' | 'grey'
  isConditional?: boolean
}

interface IPanelVoteConfig {
  title: TranslationSchema
  hideDataVolume: boolean
  tableId: TableId
  content: ITableData[]
  indicator: string
  conditionalApprovals?: IConditionalPanel[]
  hideRevert: boolean
}

enum TableId {
  Pending = 'PENDING',
  WithDataAmount = 'WITH_DATA_AMOUNT',
  Excluded = 'EXCLUDED',
}
interface ITableData {
  rowId?: number
  fullName: string
  city: string
  dataAmount?: number
  declineReason?: IDeclineReason
  revert?: boolean
  location?: MiiLocation
}

type StatusTagStyle = 'pending' | 'accepted' | 'rejected'
interface IConditionalPanel extends IConditionalApproval {
  statusTagText: TranslationSchema
  statusTagStyle: StatusTagStyle
  upload: IUpload
}

interface IColumnOption {
  prop: keyof ITableData
  label: TranslationSchema
  width?: number | string
  minWidth?: number | string
}
const tableColumns: IColumnOption[] = [
  { prop: 'fullName', label: 'proposal.detailsOfTheInstitutionFacility', width: 450 },
  { prop: 'city', label: 'proposal.city' },
  { prop: 'dataAmount', label: 'proposal.dataVolume' },
  { prop: 'revert', label: 'proposal.revert', minWidth: 50 },
]
const { showErrorMessage, showSuccessMessage } = useNotifications()

const { uploadsForType: contractConditions } = useUpload(proposalId, [UseCaseUpload.ContractCondition])
const uploadsMap = computed<Record<string, IUpload>>(() => {
  return contractConditions.value.reduce((acc, upload) => {
    acc[upload._id] = upload
    return acc
  }, {} as Record<string, IUpload>)
})
const { downloadFile } = useDownload(proposalId, showErrorMessage)
const handleDownload = async (id: string) => {
  if (proposalId.value) {
    await downloadFile(id)
  }
}

const mapTableData = (
  rowId: number,
  location: MiiLocation,
  dataAmount?: number,
  declineReason?: IDeclineReason,
): ITableData => {
  return {
    rowId,
    fullName: MII_LOCATIONS[location].display,
    city: MII_LOCATIONS[location].city,
    dataAmount,
    declineReason,
    location,
  }
}

const mapConditionalApproval = (conditionalApproval: IConditionalApproval): IConditionalPanel => {
  let status: { text: TranslationSchema; style: StatusTagStyle }

  if (conditionalApproval.isAccepted) {
    status = { text: 'proposal.conditionAccepted', style: 'accepted' }
  } else if (conditionalApproval.reviewedAt) {
    status = { text: 'proposal.conditionRejected', style: 'rejected' }
  } else {
    status = { text: 'proposal.conditionPending', style: 'pending' }
  }

  const upload = uploadsMap.value[conditionalApproval.uploadId]

  return {
    ...conditionalApproval,
    statusTagText: status.text,
    statusTagStyle: status.style,
    upload,
  }
}

const tables = computed<IPanelVoteConfig[]>(() => {
  const panels: IPanelVoteConfig[] = []

  if (proposalStore.currentProposal?.status === ProposalStatus.LocationCheck) {
    const pendingLocations: IPanelInputConfig<MiiLocation> = {
      data: [
        ...(proposalStore.currentProposal?.openDizChecks ?? []),
        ...(proposalStore.currentProposal?.dizApprovedLocations ?? []),
      ],
      title: 'proposal.pendingVotes',
      indicator: 'grey',
    }

    const pendingTable: IPanelVoteConfig = {
      tableId: TableId.Pending,
      title: pendingLocations.title,
      hideDataVolume: true,
      hideRevert: true,
      indicator: `indicator--${pendingLocations.indicator}`,
      content: pendingLocations.data.map((location, index) => mapTableData(index, location)),
    }

    panels.push(pendingTable)
  }

  const approvedLocations: IPanelInputConfig<IUacApproval> = {
    data:
      proposalStore.currentProposal?.uacApprovals.filter(
        (location) => !proposalStore.currentProposal?.requestedButExcludedLocations.includes(location.location),
      ) ?? [],
    title: 'proposal.uacAcceptedLocations',
    indicator: 'green',
  }

  const approvedWithCondition: IPanelInputConfig<IConditionalApproval> = {
    data:
      proposalStore.currentProposal?.conditionalApprovals.filter(
        (location) => !proposalStore.currentProposal?.requestedButExcludedLocations.includes(location.location),
      ) ?? [],
    title: 'proposal.uacAcceptedUnderConditions',
    indicator: 'blue',
    isConditional: true,
  }

  const tablesWithDataAmount = [approvedLocations, approvedWithCondition].map(
    ({ data, title, indicator, isConditional }) => {
      const filteredData = isConditional
        ? (data as IConditionalApproval[]).filter(
            (condition) =>
              condition.isAccepted === true &&
              !proposalStore.currentProposal?.requestedButExcludedLocations.includes(condition.location),
          )
        : (data as IUacApproval[]).filter(
            (approval) => !proposalStore.currentProposal?.requestedButExcludedLocations.includes(approval.location),
          )
      return {
        title,
        tableId: TableId.WithDataAmount,
        hideDataVolume: false,
        hideRevert: proposalStore.currentProposal?.status === ProposalStatus.LocationCheck ? false : true,
        indicator: `indicator--${indicator}`,
        content: filteredData.map(({ location, dataAmount }, index) => mapTableData(index, location, dataAmount)),
        conditionalApprovals: isConditional
          ? proposalStore.currentProposal?.conditionalApprovals
              ?.filter(
                (condition) =>
                  !proposalStore.currentProposal?.requestedButExcludedLocations.includes(condition.location),
              )
              .map((condition) => mapConditionalApproval(condition)) ?? []
          : undefined,
      } as IPanelVoteConfig
    },
  )

  panels.push(...tablesWithDataAmount)

  const excludedLocations: IPanelInputConfig<MiiLocation> = {
    data: proposalStore.currentProposal?.requestedButExcludedLocations ?? [],
    title: 'proposal.uacRejected',
    indicator: 'red',
  }
  const rejectedTable: IPanelVoteConfig = {
    title: excludedLocations.title,
    tableId: TableId.Excluded,
    hideDataVolume: true,
    hideRevert: proposalStore.currentProposal?.status === ProposalStatus.LocationCheck ? false : true,
    indicator: `indicator--${excludedLocations.indicator}`,
    content: excludedLocations.data.map((location, index) => {
      const declineReason = proposalStore.currentProposal?.declineReasons.find(
        (reasonItem) => reasonItem.location === location,
      )
      return mapTableData(index, location, undefined, declineReason)
    }),
  }
  panels.push(rejectedTable)
  return panels
})

const activeNames = ref([...Array.from(Array(tables.value.length)).map((_, idx) => idx)])
const fullViewTables = ref([...Array.from(Array(tables.value.length)).map((_) => false)])

const acceptCondition = async (conditionId: string, decision: boolean) => {
  try {
    await proposalStore.markUacConditionAsAccepted(proposalId.value, conditionId, decision)
  } catch (error) {
    showErrorMessage()
  }
}

const showMore = (tableIdx: number) => {
  fullViewTables.value[tableIdx] = !fullViewTables.value[tableIdx]
}

const triggerRowClick = async (event: Event) => {
  const target = event.target as HTMLElement
  const row = target.closest('tr') as HTMLElement
  const tbody = row.closest('tbody') as HTMLElement

  const rowIndex = Number(target?.closest('tr')?.rowIndex)
  const svg = row?.getElementsByClassName('el-icon')[0] as HTMLElement
  svg?.click()

  await nextTick()
  const currentRow = tbody?.querySelectorAll('tr')[rowIndex]
  const currentRowsFocusable = currentRow?.getElementsByClassName('rowsHiddenFocusable')[0] as HTMLElement
  currentRowsFocusable?.focus()
}

const revertLocation = async (location: MiiLocation) => {
  try {
    await proposalStore.revertLocationVote(proposalId.value, location)
    showSuccessMessage(t('general.submitted'))
  } catch (error: any) {
    showErrorMessage(t('general.failedSubmit'))
  }
}

const handleRevertLocation = (location: MiiLocation) => {
  messageBoxStore.setMessageBoxInfo({
    cancelButtonText: 'general.cancel',
    confirmButtonText: 'proposal.revertVote',
    cancelButtonClass: 'el-button--text',
    showCancelButton: true,
    title: 'proposal.revertLocationModalTitle',
    message: 'proposal.revertLocationModalDescription',

    callback: async (decision: DecisionType) => (decision === 'confirm' ? await revertLocation(location) : undefined),
  })
}

onMounted(() => {
  const collapseItemHeaders = document.querySelectorAll('.el-collapse-item__header')
  collapseItemHeaders.forEach(function (el) {
    el.removeAttribute('tabindex')
    el.removeAttribute('rol')
  })
})
</script>

<style lang="scss" scoped>
@import 'src/assets/sass/variable';

.uac-votes {
  h3 {
    font-size: 20px;

    .indicator {
      width: 8px;
      height: 8px;
      background-color: $gray-900;
      display: inline-block;
      border-radius: 50%;
      margin: 0 0.5rem 0.2rem 0;

      &--green {
        background-color: $green;
      }
      &--blue {
        background-color: $blue;
      }
      &--red {
        background-color: $red-100;
      }
      &--gray {
        background-color: $gray-900;
      }
    }
  }

  .box-wrapper {
    box-shadow: 0px 2px 10px rgba(106, 116, 132, 0.2);
    background: $white;
  }
  :deep(.el-collapse) {
    .el-collapse-item__header {
      background-color: transparent;
      color: inherit;
      margin-bottom: 2px;
      padding-left: 6px;

      &:focus-within {
        outline: $blue auto 1px;
      }

      h3 {
        outline: none;
      }
    }

    .el-collapse-item:not(:last-child) {
      margin-bottom: 1rem;
    }
    .el-collapse-item__wrap {
      background: transparent;
    }

    .el-collapse-item__content {
      color: inherit;

      tr:has(> td.el-table__expand-column) {
        &:focus-within {
          outline: $blue auto 1px;
        }
      }
    }

    .el-table__inner-wrapper::after,
    .el-table__inner-wrapper::before,
    .el-table::before {
      display: none;
    }
  }

  .no-location-placeholder {
    color: $blue;
    font-weight: 600;
    text-align: center;
    padding: 0.5rem 0;
  }

  .show-more {
    color: $blue;
    font-weight: 800;
    text-align: center;
    padding-top: 0.5rem;
    font-size: 16px;
    cursor: pointer;

    i {
      margin-left: 0.5rem;
      &:focus {
        outline: $blue auto 1px;
      }
    }
  }

  .contract-conditions {
    margin-top: 1rem;
    padding: 0 0 1rem 0;

    h3 {
      padding: 1rem 0 0 1rem;
      display: flex;
      align-items: center;
      i {
        background-color: $gray-800;
        color: $white;
        border-radius: 50%;
        width: 2.2rem;
        height: 2.2rem;
        display: inline-flex;
        justify-content: center;
        align-items: center;
        margin-right: 1rem;
      }
    }

    .contract-condition-row {
      display: flex;
      justify-content: space-between;

      padding: 0 12px;
      line-height: 24px;

      &:not(:last-child) {
        margin-bottom: 1rem;
      }

      .condition-text {
        font-size: 16px;
        color: $blue;
        font-weight: 600;
      }

      .cursor-pointer {
        cursor: pointer;
      }
      .condition-interaction {
        display: flex;
        align-items: center;
        gap: 2rem;
      }

      .condition-data-amount {
        display: flex;
        align-items: center;
        gap: 2rem;
        color: $green;
      }
      .condition-status {
        border-radius: 5px;
        padding: 1px 12px;
        border: 1px solid;
        height: 24px;

        &.pending {
          background-color: lighten($gray-900, 50%);
          border-color: $gray-900;
        }

        &.accepted {
          background-color: lighten($green, 50%);
          border-color: $green;
        }

        &.rejected {
          background-color: lighten($red-100, 40%);
          border-color: $red-100;
          color: $black;
        }
      }
    }

    .condition-actions {
      .el-button {
        padding: 0;
        width: 2rem;
        min-height: 1rem;
        background-color: $gray-200;
        border: none;
        color: $blue;

        i {
          font-size: 1.2rem;
        }

        &:last-child {
          margin-left: 10px;
        }

        &.pending:hover {
          &.positive {
            background-color: $green;
          }
          &.negative {
            background-color: $red-100;
          }

          i {
            color: $white;
          }
        }

        &.accepted {
          background-color: transparent;
          i {
            color: $green;
          }

          &.negative {
            visibility: hidden;
          }
        }

        &.rejected {
          background-color: transparent;
          i {
            color: $red-100;
          }

          &.positive {
            visibility: hidden;
          }
        }
      }
    }
  }

  .decline-reason {
    padding: 0 2rem;

    &__data {
      padding: 0 1rem;
      dt {
        font-weight: bold;
      }
    }
  }

  :deep(.el-table__expand-icon--expanded) {
    outline-offset: -3px;
  }
}
</style>
