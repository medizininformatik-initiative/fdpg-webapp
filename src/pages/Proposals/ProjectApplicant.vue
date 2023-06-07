<template>
  <div class="profile-completion-hint">
    <span class="icon fa-solid fa-circle-exclamation" aria-hidden="true" />

    <i18n-t keypath="proposal.profileCompletionHint" tag="span">
      <template #link>
        <router-link :to="{ name: RouteName.UserProfile }">{{ $t('proposal.profileCompletionHintLink') }}</router-link>
      </template>
    </i18n-t>
  </div>

  <div class="form-group-wrapper">
    <ProjectResearcher
      v-model="applicant.researcher"
      :review-mode="true"
      :form-ref="formRef"
      identifier="applicant"
    ></ProjectResearcher>
    <TaskViewer :object-id="applicant.researcher._id" />

    <ProjectInstitute
      v-model="applicant.institute"
      :review-mode="true"
      :form-ref="formRef"
      identifier="applicant"
    ></ProjectInstitute>

    <TaskViewer :object-id="applicant.institute._id" />

    <ProjectParticipantCategory
      v-model="applicant.participantCategory"
      :review-mode="reviewMode"
      :form-ref="formRef"
      identifier="applicant"
    ></ProjectParticipantCategory>

    <TaskViewer :object-id="applicant.participantCategory._id" />
  </div>
</template>

<script setup lang="ts">
import TaskViewer from '@/components/TaskViewer/TaskViewer.vue'
import type { IApplicant } from '@/types/proposal.types'
import { RouteName } from '@/types/route-name.enum'
import { useVModel } from '@vueuse/core'
import type { FormInstance } from 'element-plus'
import type { PropType } from 'vue'
import ProjectInstitute from './ProjectInstitute.vue'
import ProjectParticipantCategory from './ProjectParticipantCategory.vue'
import ProjectResearcher from './ProjectResearcher.vue'

const props = defineProps({
  modelValue: {
    type: Object as PropType<IApplicant>,
    required: true,
  },

  formRef: {
    type: Object as PropType<FormInstance>,
    required: false,
    default: () => undefined,
  },

  reviewMode: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:modelValue'])

const applicant = useVModel(props, 'modelValue', emit)
</script>

<style scoped lang="scss">
@import 'src/assets/sass/variable';

.profile-completion-hint {
  color: $blue;
  margin: 0 0 0.5rem 0;

  .icon {
    margin-right: 0.5rem;
  }
}
</style>
