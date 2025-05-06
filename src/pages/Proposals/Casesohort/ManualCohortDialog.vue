<template>
  <FdpgDialog v-model="isManualDialogOpen" :title="t('proposal.addCohortManual')" width="50%">
    <el-form :model="manualForm" ref="manualFormRef">
      <FdpgFormItem prop="name">
        <FdpgLabel html-for="proposal.cohortName" required />
        <FdpgInput v-model="manualForm.name" />
      </FdpgFormItem>
      <FdpgFormItem prop="file">
        <FdpgLabel html-for="proposal.cohortFile" required />
        <FdpgUpload :accept="'.json'" :is-loading="false" :is-disabled="false">
          <el-button class="upload-button" link>
            {{ t('proposal.chooseAFile') }}
            <template #icon>
              <el-icon class="bi-paperclip"></el-icon>
            </template>
          </el-button>
        </FdpgUpload>
      </FdpgFormItem>
    </el-form>
    <template #footer>
      <span>
        <el-button link @click="close">
          {{ t('general.cancel') }}
        </el-button>
        <el-button type="primary" @click="add">
          {{ t('general.save') }}
        </el-button>
      </span>
    </template>
  </FdpgDialog>
</template>
<script setup lang="ts">
import { ref, computed, reactive } from 'vue'
import { useI18n } from 'vue-i18n'
import FdpgDialog from '@/components/FdpgDialog.vue'
import FdpgFormItem from '@/components/FdpgFormItem.vue'
import FdpgInput from '@/components/FdpgInput.vue'
import FdpgLabel from '@/components/FdpgLabel.vue'
import FdpgUpload from '@/components/FdpgUpload.vue'
import { useVModel } from '@vueuse/core'
import type { FormInstance } from 'element-plus'
const { t } = useI18n()
const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true,
  },
})
const manualFormRef = ref<FormInstance | null>(null)
const manualForm = reactive({
  name: '',
  file: null as File | null,
})
const emit = defineEmits(['update:modelValue', 'add'])
const isManualDialogOpen = useVModel(props, 'modelValue', emit)
const add = () => {
  emit('add')
}
const close = () => {
  isManualDialogOpen.value = false
  manualFormRef.value?.resetFields()
}
</script>
