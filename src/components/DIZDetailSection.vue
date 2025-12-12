<template>
  <section class="section diz-details">
    <h2 class="section-title">
      {{ t('proposal.DizDetail') }}
    </h2>

    <section class="diz-details__container">
      <el-collapse v-model="activeCollapse">
        <el-collapse-item :title="t('proposal.dizDetailsTitle')" name="diz-details">
          <template #title>
            <h3 tabindex="0" role="button">
              <span>{{ t('proposal.dizDetailsTitle') }}</span>
            </h3>
          </template>

          <div class="table-container">
            <el-table :data="tableData" stripe>
              <el-table-column
                prop="localProjectIdentifier"
                :label="t('proposal.localProjectIdentifier')"
                min-width="200"
              >
                <template #default="{ row }">
                  <FdpgFormItem prop="localProjectIdentifier">
                    <FdpgInput
                      v-model="row.localProjectIdentifier"
                      placeholder="proposal.localProjectIdentifier"
                      :is-disabled="!editable"
                      class="border-0"
                    />
                  </FdpgFormItem>
                </template>
              </el-table-column>

              <el-table-column prop="documentationLinks" :label="t('proposal.documentationLinks')" min-width="300">
                <template #default="{ row }">
                  <FdpgFormItem prop="documentationLinks">
                    <FdpgTextEditor
                      v-model="row.documentationLinks"
                      type="textarea"
                      :placeholder="t('proposal.documentationLinks')"
                      :disabled="!editable"
                    />
                  </FdpgFormItem>
                </template>
              </el-table-column>

              <el-table-column v-if="editable" width="120" fixed="right">
                <template #default="{ row }">
                  <div class="edit-actions">
                    <el-button type="primary" size="small" @click="handleSave">
                      {{ t('general.save') }}
                    </el-button>
                  </div>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-collapse-item>
      </el-collapse>
    </section>
    <template v-for="(projectTodo, index) in projectTodos" :key="`todo-${index}`">
      <ProjectTodoLargeItem
        :is-disabled="isDisabled || projectTodo.readonly"
        :has-actions="projectTodo.type === 'decision' || projectTodo.type === 'condition-check'"
        :project-todo="projectTodo"
      ></ProjectTodoLargeItem>
    </template>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, reactive, type PropType } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth/auth.store'
import { useProposalStore } from '@/stores/proposal/proposal.store'
import useNotifications from '@/composables/use-notifications'
import type { IDizDetails } from '@/types/proposal.types'
import FdpgFormItem from '@/components/FdpgFormItem.vue'
import FdpgInput from './FdpgInput.vue'
import FdpgTextEditor from './FdpgTextEditor.vue'
import type { FormInstance } from 'element-plus'
import ProjectTodoLargeItem from '@/components/ProjectTodoLargeItem.vue'
import type { IProjectTodo } from '@/types/project-todo.interface'

const props = defineProps({
  editable: { type: Boolean, default: false },
  projectTodos: { type: Array as PropType<IProjectTodo[]> },
  isDisabled: { type: Boolean, default: false },
})

const { t } = useI18n()
const route = useRoute()
const authStore = useAuthStore()
const proposalStore = useProposalStore()
const { showSuccessMessage, showErrorMessage } = useNotifications()

const activeCollapse = ref(['diz-details'])
const showFormModal = ref(false)
const isSubmitting = ref(false)
const formRef = ref<FormInstance>()
const editingItem = ref<IDizDetails | null>(null)
const formData = reactive({
  localProjectIdentifier: '',
  documentationLinks: '',
})

const proposalId = computed(() => route.params.id as string)
const userLocation = computed(() => {
  const profile = authStore.profile
  if (profile && 'MII_LOCATION' in profile) {
    return (profile as any).MII_LOCATION
  }
  return null
})

const dizDetails = computed<IDizDetails[]>(() => proposalStore.currentProposal?.dizDetails || [])
// Replace the allDizDetails computed property with tableData
const tableData = computed<IDizDetails[]>(() => {
  const userLocationDetails = dizDetails.value.find((diz) => diz.location === userLocation.value)
  if (userLocationDetails) {
    return [userLocationDetails]
  } else
    return [
      {
        localProjectIdentifier: '',
        documentationLinks: '',
        location: userLocation.value,
      },
    ]
})

// Update handleSave method
const handleSave = async () => {
  isSubmitting.value = true
  try {
    if (!tableData.value[0]._id) {
      // Create new DIZ details
      await proposalStore.createDizDetails(proposalId.value, {
        localProjectIdentifier: tableData.value[0].localProjectIdentifier,
        documentationLinks: tableData.value[0].documentationLinks,
        location: userLocation.value,
      })
      showSuccessMessage(t('proposal.dizDetailsCreated'))
    } else {
      // Update existing DIZ details
      await proposalStore.updateDizDetails(proposalId.value, tableData.value[0]._id as string, {
        _id: tableData.value[0]._id as string,
        localProjectIdentifier: tableData.value[0].localProjectIdentifier,
        documentationLinks: tableData.value[0].documentationLinks,
        location: userLocation.value,
      })
      showSuccessMessage(t('proposal.dizDetailsUpdated'))
    }

    editingItem.value = null
  } catch (error) {
    showErrorMessage()
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped lang="scss">
@use '@/assets/sass/variable' as *;

.diz-details {
  background-color: $gray-200;
  padding: 20px;
  border-radius: 10px;
  margin-bottom: 52px;

  h3 {
    font-size: 20px;
    .indicator {
      width: 8px;
      height: 8px;
      display: inline-block;
      border-radius: 50%;
      margin: 0 0.5rem 0.2rem 0;
      background-color: $green;
    }
  }
  &__container :deep(.el-collapse) {
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
  :deep(.check-proposal-card) {
    background-color: white;
  }
}
.border-0 {
  :deep(.el-input__inner) {
    border: none !important;
  }
}
</style>
