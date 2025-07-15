<template>
  <section class="section diz-details">
    <h2 class="section-title">
      {{ t('proposal.DizDetail') }}
    </h2>

    <section class="diz-details__container">
      <div v-if="allDizDetails.length === 0" class="empty-state">
        <el-icon class="empty-icon">
          <Document />
        </el-icon>
        <p>{{ t('general.noData') }}</p>
        <el-button v-if="editable" type="primary" @click="toggleCreateMode" :disabled="isSubmitting">
          {{ t('general.create') }}
        </el-button>
      </div>
      <el-collapse v-else v-model="activeCollapse" class="diz-collapse">
        <el-collapse-item :title="t('proposal.dizDetailsTitle')" name="diz-details">
          <template #title>
            <h3 tabindex="0" role="button">
              <span>{{ t('proposal.dizDetailsTitle') }}</span>
            </h3>
          </template>

          <div class="table-container">
            <el-table :data="allDizDetails" stripe style="width: 100%" class="diz-table">
              <el-table-column
                prop="localProjectIdentifier"
                :label="t('proposal.localProjectIdentifier')"
                min-width="200"
              >
                <template #default="{ row }">
                  <span v-if="row.localProjectIdentifier" class="project-identifier">
                    {{ row.localProjectIdentifier }}
                  </span>
                  <span v-else class="empty-value">—</span>
                </template>
              </el-table-column>

              <el-table-column prop="documentationLinks" :label="t('proposal.documentationLinks')" min-width="300">
                <template #default="{ row }">
                  <div v-if="row.documentationLinks" class="documentation-links" v-html="row.documentationLinks"></div>
                  <span v-else class="empty-value">—</span>
                </template>
              </el-table-column>

              <el-table-column v-if="editable" width="120" fixed="right">
                <template #default="{ row }">
                  <el-button v-if="row.location === userLocation" type="primary" size="small" @click="startEdit(row)">
                    {{ t('general.edit') }}
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-collapse-item>
      </el-collapse>
    </section>
    <!-- Create/Edit Modal -->
    <el-dialog
      v-model="showFormModal"
      :title="isEditing ? t('general.edit') : t('general.create')"
      width="600px"
      :before-close="handleModalClose"
      v-if="isEditing || canCreateForCurrentLocation"
    >
      <el-form :model="formData" :rules="rules" ref="formRef" label-width="200px">
        <div class="form-group">
          <FdpgFormItem :label="t('proposal.localProjectIdentifier')" prop="localProjectIdentifier">
            <FdpgInput v-model="formData.localProjectIdentifier" placeholder="proposal.localProjectIdentifier" />
          </FdpgFormItem>
        </div>
        <div class="form-group">
          <FdpgFormItem :label="t('proposal.documentationLinks')" prop="documentationLinks">
            <FdpgTextEditor
              v-model="formData.documentationLinks"
              type="textarea"
              :rows="6"
              :placeholder="t('proposal.documentationLinks')"
            />
          </FdpgFormItem>
        </div>
      </el-form>

      <template #footer>
        <el-button @click="handleModalClose">
          {{ t('general.cancel') }}
        </el-button>
        <el-button type="primary" @click="handleSave">
          {{ t('general.save') }}
        </el-button>
      </template>
    </el-dialog>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { Document } from '@element-plus/icons-vue'
import { useAuthStore } from '@/stores/auth/auth.store'
import { useProposalStore } from '@/stores/proposal/proposal.store'
import useNotifications from '@/composables/use-notifications'
import type { IDizDetails } from '@/types/proposal.types'
import FdpgFormItem from '@/components/FdpgFormItem.vue'
import FdpgInput from './FdpgInput.vue'
import FdpgTextEditor from './FdpgTextEditor.vue'
import type { FormInstance, FormRules } from 'element-plus'

const props = defineProps({
  editable: { type: Boolean, default: false },
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

// Form validation rules
const rules: FormRules = {
  documentationLinks: [
    { required: true, message: t('general.requiredField'), trigger: 'blur' },
    { max: 5000, message: t('general.maxCharacters', { max: 5000 }), trigger: 'blur' },
  ],
  localProjectIdentifier: [{ max: 500, message: t('general.maxCharacters', { max: 500 }), trigger: 'blur' }],
}

// Computed properties
const proposalId = computed(() => route.params.id as string)
const userLocation = computed(() => {
  const profile = authStore.profile
  if (profile && 'MII_LOCATION' in profile) {
    return (profile as any).MII_LOCATION
  }
  return null
})

const allDizDetails = computed(() => proposalStore.currentProposal?.dizDetails || [])

const canCreateForCurrentLocation = computed(() => {
  return !allDizDetails.value.some((diz) => diz.location === userLocation.value)
})

const isEditing = computed(() => editingItem.value !== null)

const toggleCreateMode = () => {
  editingItem.value = null
  resetForm()
  showFormModal.value = true
}

const startEdit = (item: IDizDetails) => {
  editingItem.value = item
  formData.localProjectIdentifier = item.localProjectIdentifier || ''
  formData.documentationLinks = item.documentationLinks || ''
  showFormModal.value = true
}

const handleModalClose = () => {
  showFormModal.value = false
  resetForm()
  editingItem.value = null
}

const resetForm = () => {
  formData.localProjectIdentifier = ''
  formData.documentationLinks = ''
}

const handleSave = async () => {
  if (!formRef.value) return

  const isValid = await formRef.value.validate()
  if (!isValid) return

  isSubmitting.value = true
  try {
    if (editingItem.value) {
      // Update existing DIZ details
      if (!editingItem.value._id) {
        throw new Error('Missing DIZ details ID for update.')
      }
      await proposalStore.updateDizDetails(proposalId.value, editingItem.value._id as string, {
        _id: editingItem.value._id as string,
        localProjectIdentifier: formData.localProjectIdentifier || undefined,
        documentationLinks: formData.documentationLinks,
        location: editingItem.value.location,
      })
      showSuccessMessage(t('proposal.dizDetailsUpdated'))
    } else {
      // Create new DIZ details
      await proposalStore.createDizDetails(proposalId.value, {
        localProjectIdentifier: formData.localProjectIdentifier || undefined,
        documentationLinks: formData.documentationLinks,
        location: userLocation.value,
      })
      showSuccessMessage(t('proposal.dizDetailsCreated'))
    }

    handleModalClose()
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
}

.empty-state {
  text-align: center;
  padding: 40px;

  .empty-icon {
    font-size: 48px;
    color: $gray-800;
    margin-bottom: 16px;
  }

  p {
    color: $gray-900;
    margin-bottom: 20px;
  }
}

.table-container {
  .table-header {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    margin-bottom: 16px;
    padding: 0 4px;

    .table-info {
      color: $gray-800;
      font-size: 0.9rem;
    }
  }

  .diz-table {
    .project-identifier {
      font-weight: 500;
      color: $blue;
    }

    .documentation-links {
      line-height: 1.4;
      max-height: 80px;
      overflow-y: auto;

      :deep(a) {
        color: $blue;
        text-decoration: none;
        word-break: break-all;

        &:hover {
          text-decoration: underline;
        }
      }
    }

    .empty-value {
      color: $gray-800;
      font-style: italic;
    }

    .update-date {
      color: $gray-900;
      font-size: 0.9rem;
    }
  }
}

:deep(.el-dialog__body) {
  padding: 20px;
}

:deep(.el-collapse-item__header) {
  padding-left: 20px;
  padding-right: 20px;
}

:deep(.el-collapse-item__content) {
  padding: 20px;
}
</style>
