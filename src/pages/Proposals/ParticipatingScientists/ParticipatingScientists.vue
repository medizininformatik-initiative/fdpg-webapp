<template>
  <div v-for="(participant, index) in participants" :id="'scrollParentParticipatingScientists' + index" :key="index">
    <ParticipatingScientistsCollapsed
      v-if="index !== activePanelKey && formRef"
      :participant-form="participant"
      :form-ref="formRef"
      :index="index"
      :review-mode="reviewMode"
      @edit="handleEditParticipant"
      @remove="handleRemoveParticipant"
    />
    <!-- v-show instead of v-for is needed for the validation props -->
    <div v-show="index === activePanelKey" class="form-group-wrapper">
      <el-button
        type="text"
        :disabled="reviewMode || participant.isDone"
        :data-testId="'removeParticipant__' + index"
        class="card-remove-button"
        @click="handleRemoveParticipant(index)"
        ><i class="fa fa-minus-circle" aria-hidden="true" /><span>{{
          $t('proposal.removeParticipant')
        }}</span></el-button
      >

      <ProjectResearcher
        v-model="participant.researcher"
        :review-mode="reviewMode"
        :form-ref="formRef"
        :identifier="`participants.${index}`"
      ></ProjectResearcher>
      <TaskViewer :object-id="participant.researcher._id" />

      <ProjectInstitute
        v-model="participant.institute"
        :review-mode="reviewMode"
        :form-ref="formRef"
        :identifier="`participants.${index}`"
      ></ProjectInstitute>
      <TaskViewer :object-id="participant.institute._id" />

      <ProjectParticipantCategory
        v-model="participant.participantCategory"
        :review-mode="reviewMode"
        :form-ref="formRef"
        :identifier="`participants.${index}`"
      ></ProjectParticipantCategory>

      <section style="display: flex; flex-direction: column; gap: 0.3em">
        <TaskViewer :object-id="participant.participantCategory._id" />
        <!-- Legacy: participant main object should not receive comments -->
        <TaskViewer :object-id="participant._id" />
      </section>
    </div>
  </div>

  <el-button
    v-if="!reviewMode"
    type="text"
    class="add-more-button add-more-button--another-person"
    data-testId="handleAddAnotherPerson"
    @click="handleAddAnotherPerson"
  >
    <i class="el-icon-plus" aria-hidden="true" />
    <span class="add-text">{{ $t('proposal.addAnotherPerson') }}</span>
  </el-button>
</template>

<script setup lang="ts">
import TaskViewer from '@/components/TaskViewer/TaskViewer.vue'
import type { IParticipant } from '@/types/proposal.types'
import { mapParticipant } from '@/utils/form-transform/participant-applicant-transform.util'
import { keyboardNavigation } from '@/utils/keyboard-nav.util'
import { useVModel } from '@vueuse/core'
import type { FormInstance } from 'element-plus'
import type { PropType } from 'vue'
import { ref } from 'vue'
import ProjectInstitute from '../ProjectInstitute.vue'
import ProjectParticipantCategory from '../ProjectParticipantCategory.vue'
import ProjectResearcher from '../ProjectResearcher.vue'
import ParticipatingScientistsCollapsed from './ParticipatingScientistsCollapsed.vue'

const props = defineProps({
  modelValue: {
    type: Array as PropType<IParticipant[]>,
    required: false,
    default: () => [],
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

const participants = useVModel(props, 'modelValue', emit)

const activePanelKey = ref(0)

const handleEditParticipant = (idx: number) => {
  activePanelKey.value = idx
}

const handleRemoveParticipant = (idx: number) => {
  participants.value.splice(idx, 1)

  if (idx <= activePanelKey.value) {
    activePanelKey.value = Math.max(activePanelKey.value - 1, 0)
  }
}

const handleAddAnotherPerson = async () => {
  participants.value.push(mapParticipant() as IParticipant)
  const newIndex = participants.value.length - 1
  activePanelKey.value = newIndex
  keyboardNavigation.focusNewElement('scrollParentParticipatingScientists' + newIndex)
}
</script>
