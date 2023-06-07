<template>
  <FdpgDialog v-model="dialogOpen" :title="$t('proposal.viewReport')" class="reports--modal" @close="closeDialog">
    <dl class="form-group">
      <dt>{{ $t('general.title') }}</dt>
      <dd>
        {{ report.title }}
      </dd>

      <dt>{{ $t('proposal.text') }}</dt>
      <dd>{{ report.content }}</dd>

      <dt>{{ $t('proposal.album') }}</dt>
      <dd>
        <ImageList
          :documents="uploadedFiles"
          :is-loading="false"
          :is-disabled="true"
          empty-alert-text="proposal.reportUploadPlaceholder"
        />
      </dd>
    </dl>
    <template #footer>
      <span>
        <el-button type="text" @click="closeDialog">{{ $t('general.cancel') }}</el-button>
      </span>
    </template>
  </FdpgDialog>
</template>
<script setup lang="ts">
import { useVModel } from '@vueuse/core'
import type { PropType } from 'vue'
import { computed, ref, watch } from 'vue'
import FdpgDialog from './FdpgDialog.vue'
import ImageList from './Proposals/Details/ImageList.vue'
import type { IReportGet, IUpload } from '@/types/proposal.types'
import { useProposalStore } from '@/stores/proposal/proposal.store'

const emit = defineEmits(['update:modelValue', 'reset', 'update:report'])
const props = defineProps({
  report: {
    type: Object as PropType<IReportGet>,
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
const dialogOpen = useVModel(props, 'modelValue', emit)
const uploadedFiles = ref<IUpload[]>([])

watch(dialogOpen, async (newModelValue) => {
  if (newModelValue) {
    if (props.report._id) {
      const content = await proposalStore.getReportContent(props.proposalId, props.report._id)
      emit('update:report', { ...props.report, content })
      uploadedFiles.value = props.report.uploads as IUpload[]
    }
  }
})
const proposalStore = useProposalStore()
const report = computed(() => props.report)
const closeDialog = () => {
  dialogOpen.value = false
  uploadedFiles.value = []
  emit('reset')
}
</script>
<style lang="scss" scoped>
@import 'src/assets/sass/variable';

dt {
  font-weight: bold;
}
</style>
