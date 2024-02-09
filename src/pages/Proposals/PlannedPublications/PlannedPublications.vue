<template>
  <FdpgLabel required html-for="proposal.plannedPublications" size="medium" />
  <el-card class="form__check--margin">
    <FdpgFormItem prop="userProject.plannedPublication.noPublicationPlanned">
      <el-checkbox
        v-model="plannedPublicationForm.noPublicationPlanned"
        :disabled="reviewMode || plannedPublicationForm.isDone"
        :size="FdpgInputSize.Small"
        class="fdpg-checkbox"
        >{{ $t('proposal.noPublicationIsPlanned') }}</el-checkbox
      >
    </FdpgFormItem>
  </el-card>
  <template v-for="(publication, index) in plannedPublicationForm.publications" :key="index">
    <PlannedPublicationsCollapsed
      v-if="activeKey !== index"
      :data-testId="'proposal.plannedPublications__collapsed__' + index"
      :publication-form="publication"
      :form-ref="formRef"
      :index="index"
      :review-mode="reviewMode"
      @edit="handleEdit"
      @remove="handleRemove"
    ></PlannedPublicationsCollapsed>
    <el-card
      v-if="activeKey === index && !plannedPublicationForm.noPublicationPlanned"
      :id="'scrollParentPlannedPublications' + index"
      class="form-group form--margin-bottom"
      data-testId="proposal.plannedPublications"
    >
      <el-button
        v-if="!reviewMode && !plannedPublicationForm.isDone"
        type="text"
        class="card-remove-button scrollAnker"
        :data-testId="'handleRemovePublication__' + index"
        @click="handleRemove(index)"
      >
        <i class="fa fa-minus-circle form__icon--margin" aria-hidden="true" />
        {{ $t('proposal.deletePublication') }}
      </el-button>
      <el-row>
        <el-col :sm="24">
          <FdpgFormItem
            :prop="`userProject.plannedPublication.publications[${index}].type`"
            :rules="publicationRules.type"
          >
            <FdpgLabel html-for="proposal.type" />
            <FdpgSelect
              v-model="publication.type"
              class="scrollFocus"
              placeholder="proposal.specifyTheTypeOfPublication"
              :data-testId="'publication.type__' + index"
              :disabled="reviewMode || plannedPublicationForm.isDone"
              :options="types"
            ></FdpgSelect>
          </FdpgFormItem>
        </el-col>
        <el-col :sm="24">
          <FdpgFormItem
            :prop="`userProject.plannedPublication.publications[${index}].description`"
            :rules="publicationRules.description"
          >
            <FdpgLabel html-for="proposal.description" info="proposal.plannedPublicationDescriptionInfo" />
            <FdpgInput
              v-model="publication.description"
              :data-testId="'publication.description__' + index"
              placeholder="proposal.describeThePublication"
              :disabled="reviewMode || plannedPublicationForm.isDone"
            />
          </FdpgFormItem>
        </el-col>
        <el-col :sm="24">
          <FdpgFormItem
            :prop="`userProject.plannedPublication.publications[${index}].authors`"
            :rules="publicationRules.authors"
          >
            <FdpgLabel html-for="proposal.authors" info="proposal.plannedPublicationAuthorsInfo" />
            <FdpgInput
              v-model="publication.authors"
              :data-testId="'publication.authors__' + index"
              placeholder="proposal.pleaseListContributingAuthors"
              :disabled="reviewMode || plannedPublicationForm.isDone"
            />
          </FdpgFormItem>
        </el-col>
      </el-row>
    </el-card>
  </template>

  <el-button
    v-show="!reviewMode && !plannedPublicationForm.isDone && !plannedPublicationForm.noPublicationPlanned"
    data-testId="handleAddAnotherPublication"
    type="text"
    class="add-more-button add-more-button--publication"
    @click="handleAddAnotherPublication"
  >
    <i class="el-icon-plus" aria-hidden="true" />
    <span class="add-text">{{ $t('proposal.addAnotherPublication') }}</span>
  </el-button>
  <TaskViewer :object-id="plannedPublicationForm._id" />
</template>

<script setup lang="ts">
import FdpgFormItem from '@/components/FdpgFormItem.vue'
import FdpgInput from '@/components/FdpgInput.vue'
import FdpgLabel from '@/components/FdpgLabel.vue'
import FdpgSelect from '@/components/FdpgSelect.vue'
import { FdpgInputSize } from '@/types/component.types'
import type { IPlannedPublication, IPublication } from '@/types/proposal.types'
import { PublicationType } from '@/types/publication-type.enum'
import { mapPublication } from '@/utils/form-transform/transform-user-project.util'
import { keyboardNavigation } from '@/utils/keyboard-nav.util'
import { maxLengthValidationFunc, requiredValidationFunc } from '@/validations'
import { useVModel } from '@vueuse/core'
import type { FormInstance } from 'element-plus'
import type { PropType } from 'vue'
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import PlannedPublicationsCollapsed from './PlannedPublicationsCollapsed.vue'
const props = defineProps({
  modelValue: {
    type: Object as PropType<IPlannedPublication>,
    required: true,
  },

  reviewMode: {
    type: Boolean,
    default: false,
  },

  formRef: {
    type: Object as PropType<FormInstance>,
    required: false,
    default: () => undefined,
  },
})
const { t } = useI18n()
const types = ref<{ label: string; value: string }[]>([
  {
    label: t(`proposal.publicationType_${PublicationType.JournalArticle}`),
    value: PublicationType.JournalArticle,
  },
  {
    label: t(`proposal.publicationType_${PublicationType.Poster}`),
    value: PublicationType.Poster,
  },
  {
    label: t(`proposal.publicationType_${PublicationType.ConferenceArticle}`),
    value: PublicationType.ConferenceArticle,
  },
  {
    label: t(`proposal.publicationType_${PublicationType.Thesis}`),
    value: PublicationType.Thesis,
  },
  {
    label: t(`proposal.publicationType_${PublicationType.Report}`),
    value: PublicationType.Report,
  },
  {
    label: t(`proposal.publicationType_${PublicationType.Other}`),
    value: PublicationType.Other,
  },
])
const emit = defineEmits(['update:modelValue'])

const plannedPublicationForm = useVModel(props, 'modelValue', emit)

const publicationRules = {
  type: [requiredValidationFunc('string'), maxLengthValidationFunc(10000)],
  description: [requiredValidationFunc('string'), maxLengthValidationFunc(10000)],
  authors: [requiredValidationFunc('string'), maxLengthValidationFunc(10000)],
}

const activeKey = ref(0)

const handleEdit = (value: number) => {
  activeKey.value = value
}

const handleAddAnotherPublication = () => {
  plannedPublicationForm.value.publications.push(mapPublication() as IPublication)
  const newIndex = plannedPublicationForm.value.publications.length - 1
  activeKey.value = newIndex
  keyboardNavigation.focusNewElement('scrollParentPlannedPublications' + newIndex)
}

const handleRemove = async (id: number) => {
  plannedPublicationForm.value.publications.splice(id, 1)

  if (id <= activeKey.value) {
    activeKey.value = Math.max(activeKey.value - 1, 0)
  }
}
const noPublicationPlannedComputed = computed<boolean>(() => plannedPublicationForm.value.noPublicationPlanned)
watch(
  noPublicationPlannedComputed,
  (newValue) => {
    if (newValue) {
      plannedPublicationForm.value.publications.forEach((publication, index) => handleRemove(index))
    } else if (!plannedPublicationForm.value.publications.length) {
      handleAddAnotherPublication()
    }
  },
  { immediate: true },
)
</script>
<style lang="scss" scoped>
.form__check--margin {
  margin-bottom: 15px;
}
.form--margin-bottom {
  margin-bottom: 0px;
}

.form__icon--margin {
  margin-right: 5px;
}
</style>
