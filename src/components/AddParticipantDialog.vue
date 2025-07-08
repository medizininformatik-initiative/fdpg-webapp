<template>
  <FdpgDialog
    v-model="dialogVisible"
    :title="t('proposal.addParticipant')"
    footer-justify="space-between"
    width="900px"
  >
    <div class="dialog-content">
      <el-form ref="dialogFormRef" :model="participant">
        <ProjectResearcher v-model="participant.researcher" :form-ref="dialogFormRef" />
        <ProjectInstitute v-model="participant.institute" :form-ref="dialogFormRef" />
        <ProjectParticipantCategory
          v-model="participant.participantCategory"
          :ParticipatingScientists="true"
          :form-ref="dialogFormRef"
          required
        />
        <ProjectParticipantRole v-model="participant.participantRole" :form-ref="dialogFormRef" required />
      </el-form>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">{{ t('general.cancel') }}</el-button>
        <el-button type="primary" @click="handleSubmit">{{ t('general.save') }}</el-button>
      </div>
    </template>
  </FdpgDialog>
</template>

<script setup lang="ts">
import FdpgDialog from '@/components/FdpgDialog.vue'
import { useVModel } from '@vueuse/core'
import { defineEmits, defineProps, ref } from 'vue'
import ProjectInstitute from '@/pages/Proposals/ProjectInstitute.vue'
import ProjectParticipantCategory from '@/pages/Proposals/ProjectParticipantCategory.vue'
import ProjectParticipantRole from '@/pages/Proposals/ProjectParticipantRole.vue'
import ProjectResearcher from '@/pages/Proposals/ProjectResearcher.vue'
import { useI18n } from 'vue-i18n'
import type { IParticipant } from '@/types/proposal.types'
import { ParticipantType, ParticipantRole } from '@/types/proposal.types'
import type { FormInstance } from 'element-plus'

const emit = defineEmits(['update:modelValue', 'submit'])

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true,
    default: false,
  },
})

const dialogVisible = useVModel(props, 'modelValue', emit)
const dialogFormRef = ref<FormInstance>()
const { t } = useI18n()

const participant = ref<IParticipant>({
  researcher: {
    title: '',
    firstName: '',
    lastName: '',
    affiliation: '',
    email: '',
  },
  institute: {},
  participantCategory: {
    category: ParticipantType.DataReceiver,
  },
  participantRole: {
    role: ParticipantRole.ParticipatingScientist,
  },
})

const handleClose = () => {
  dialogVisible.value = false
}

const handleSubmit = async () => {
  try {
    if (dialogFormRef.value) {
      await dialogFormRef.value.validate()
    }
    emit('submit', participant.value)
    handleClose()
  } catch (error) {
    console.error('Form validation failed:', error)
  }
}
</script>

<style lang="scss" scoped>
.dialog-content {
  padding: 20px 0;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>
