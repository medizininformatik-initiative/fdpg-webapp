<template>
  <FdpgDialog
    v-model="dialogOpen"
    :title="!publication._id ? $t('proposal.addPublication') : $t('proposal.editPublication')"
    class="create-modal"
    @close="closeDialog"
  >
    <el-form ref="publicationFormRef" :rules="rules" label-position="top" :model="publication" class="form-group">
      <el-row :gutter="20">
        <el-col :sm="24">
          <FdpgFormItem prop="title">
            <FdpgLabel required html-for="general.title" />
            <FdpgInput
              v-model="publication.title"
              data-testId="publication.title"
              placeholder="proposal.publicationTitlePlaceholder"
            />
          </FdpgFormItem>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :sm="12">
          <FdpgFormItem prop="doi">
            <FdpgLabel html-for="proposal.doi" />
            <FdpgInput
              v-model="publication.doi"
              data-testId="publication.doi"
              placeholder="proposal.publicationDoiPlaceholder"
            />
          </FdpgFormItem>
        </el-col>

        <el-col :sm="12">
          <FdpgFormItem prop="link">
            <FdpgLabel html-for="proposal.link" />
            <FdpgInput
              v-model="publication.link"
              data-testId="publication.link"
              placeholder="proposal.publicationLinkPlaceholder"
            />
          </FdpgFormItem>
        </el-col>
      </el-row>
    </el-form>
    <template #footer>
      <span>
        <el-button type="text" @click="closeDialog">{{ $t('general.cancel') }}</el-button>
        <el-button type="primary" @click="createOrUpdatePublication">
          {{ $t('general.save') }}
        </el-button>
      </span>
    </template>
  </FdpgDialog>
</template>
<script setup lang="ts">
import useNotifications from '@/composables/use-notifications'
import { useProposalStore } from '@/stores/proposal/proposal.store'
import type { IPublicationCreateAndUpdate, IPublicationGet } from '@/types/proposal.types'
import { requiredIfEmptyValidationFunc, requiredValidationFunc } from '@/validations'
import { useVModel } from '@vueuse/core'
import { ElForm, type FormInstance } from 'element-plus'
import type { PropType } from 'vue'
import { computed, ref } from 'vue'
import FdpgDialog from './FdpgDialog.vue'
import FdpgFormItem from './FdpgFormItem.vue'
import FdpgInput from './FdpgInput.vue'
import FdpgLabel from './FdpgLabel.vue'

const { showErrorMessage } = useNotifications()
const publicationFormRef = ref<FormInstance>()
const emit = defineEmits(['update:modelValue', 'reset'])
const props = defineProps({
  publication: {
    type: Object as PropType<IPublicationGet>,
    required: true,
  },
  proposalId: {
    type: String,
    required: true,
  },
  modelValue: {
    type: Boolean,
    required: true,
  },
})
const proposalStore = useProposalStore()
const publication = computed(() => props.publication)
const doi = computed(() => publication.value?.doi)
const link = computed(() => publication.value?.link)
const rules = ref<Record<string, any>>({
  title: [requiredValidationFunc('string')],
  doi: [requiredIfEmptyValidationFunc(link)],
  link: [requiredIfEmptyValidationFunc(doi)],
})
const dialogOpen = useVModel(props, 'modelValue', emit)
const closeDialog = () => {
  dialogOpen.value = false
  publicationFormRef.value?.clearValidate()
  emit('reset')
}
const createOrUpdatePublicationValues = ref<IPublicationCreateAndUpdate>()
const createOrUpdatePublication = async () => {
  let isValid = false

  await publicationFormRef.value?.validate((valid) => {
    isValid = valid

  })

  if (isValid) {
    createOrUpdatePublicationValues.value = {
      title: publication.value.title,
      doi: publication.value.doi,
      link: publication.value.link,
    }
    try {
      !publication.value._id
        ? await proposalStore.createProposalPublication(props.proposalId, createOrUpdatePublicationValues.value)
        : await proposalStore.updateProposalPublication(
          props.proposalId,
          publication.value._id,
          createOrUpdatePublicationValues.value,
        )
    } catch (error) {
      showErrorMessage()
    }
    closeDialog()
  }
}
</script>
<style lang="scss" scoped>
@import 'src/assets/sass/variable';

.form-element {
  margin-bottom: 0;

  &.is-error {
    .el-form-item__content {
      .fdpg-label {
        color: $red;
      }

      .fdpg-input,
      .fdpg-select,
      .fdpg-date-picker {
        &.is-focus {
          .el-input__inner {
            border-color: $red;
          }
        }

        .el-input__inner {
          &:hover {
            border-color: $red;
          }

          &:focus {
            box-shadow: 0 0 10px -5px $red;
          }
        }
      }

      .el-form-item__error {
        position: initial;
      }
    }
  }
}
</style>
