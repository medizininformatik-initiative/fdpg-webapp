<template>
  <div class="condition-review-sections">
    <section class="section contract-conditions">
      <template v-if="uacCondition.uploadId">
        <div class="contract-condition-row">
          {{ $t('proposal.reviewUacConditionFile') }}
        </div>

        <div class="contract-condition-row">
          <div
            role="button"
            class="condition-text cursor-pointer"
            :data-testId="'button__condition-download__' + uacCondition.location"
            tabindex="0"
            @click="handleDownload(uacCondition.uploadId)"
            @keydown.enter="handleDownload(uacCondition.uploadId)"
          >
            {{ locationLookUpMapRef[uacCondition.location]?.display }}:
            {{ getFileName(uacCondition.uploadId) }}
          </div>
        </div>
      </template>

      <div class="contract-condition-row">
        <div class="condition-text-area">
          <FdpgTextEditor
            v-model="uacCondition.conditionReasoning"
            :placeholder="$t('proposal.acceptReasonPlaceholder')"
            :rows="2"
            :disabled="isDisabled"
          ></FdpgTextEditor>
        </div>
      </div>
    </section>

    <section class="section contract-conditions">
      <h3 class="no-padding">{{ $t('proposal.specifyTheAmountOfData') }}</h3>
      <p>{{ $t('proposal.asADataProviderYouMustSpecifyAQuantity') }}</p>
      <el-form ref="formRef" class="contract-condition-row" :model="form" :rules="rules" @validate="onValidate">
        <FdpgFormItem prop="dataVolume">
          <FdpgLabel required html-for="proposal.dataVolume" />
          <FdpgNumberInput
            v-model="form.dataVolume"
            placeholder="proposal.acceptContractDataVolumePlaceholder"
            data-testId="input__dataVolume"
            :readonly="isDisabled"
          />
        </FdpgFormItem>
      </el-form>
    </section>
  </div>
</template>

<script setup lang="ts">
import useDownload from '@/composables/use-download'
import useNotifications from '@/composables/use-notifications'
import { useProposalStore } from '@/stores/proposal/proposal.store'
import type { IConditionalApproval } from '@/types/proposal.types'
import { computed, onMounted, reactive, ref, type PropType, type Ref } from 'vue'
import { useRoute } from 'vue-router'
import FdpgTextEditor from './FdpgTextEditor.vue'
import { useI18n } from 'vue-i18n'
import { useLocationStore } from '@/stores/locations/location.store'
import type { ILocation } from '@/types/location.types'

const props = defineProps({
  uacCondition: {
    type: Object as PropType<IConditionalApproval>,
    required: true,
  },
  isDisabled: {
    type: Boolean,
    default: false,
  },
  isDraft: {
    type: Boolean,
    default: false,
  },
})
const emit = defineEmits(['disableButton'])

const { params } = useRoute()
const proposalId = computed(() => params.id as string)
const { showErrorMessage } = useNotifications()
const proposalStore = useProposalStore()

const locationStore = useLocationStore()
const locationLookUpMapRef: Ref<{ [k: string]: ILocation }> = ref({})

const { t } = useI18n()
const requiredValidation = {
  required: true,
  trigger: ['change', 'blur'],
  message: t('general.requiredField'),
}

const requiredDataVolume = (_rule: any, value: any, callback: any) => {
  if (!value) {
    return callback(new Error(t('general.requiredField')))
  }
  setTimeout(() => {
    if (!Number.isInteger(value)) {
      callback(new Error(t('general.requiredField')))
    } else {
      if (value <= 0) {
        callback(new Error(t('general.requiredField')))
      } else {
        callback()
      }
    }
  }, 1000)
}

const form = reactive({
  dataVolume: props.uacCondition.dataAmount,
})

const rules = ref<Record<string, any>>({
  dataVolume: [requiredValidation, { validator: requiredDataVolume, trigger: 'blur' }],
})

const isValidToSubmit = ref<boolean>(false)
const onValidate = (_field, value) => {
  isValidToSubmit.value = value

  if (value) {
    props.uacCondition.dataAmount = form.dataVolume

    emit('disableButton', { value: !value, button: 'positive' })
  }
}

const { downloadFile } = useDownload(proposalId, showErrorMessage)
const handleDownload = async (id: string) => {
  if (proposalId.value) {
    await downloadFile(id)
  }
}

const getFileName = (uploadId?: string) => {
  const uploads = proposalStore.currentProposal?.uploads ?? []

  return uploads.find((upload: any) => upload._id === uploadId)?.fileName ?? ''
}

onMounted(async () => {
  const dataAmount = props.uacCondition.dataAmount
  emit('disableButton', { value: !(typeof dataAmount === 'number' && dataAmount >= 0), button: 'positive' })
  emit('disableButton', { value: props.isDisabled || !props.isDraft, button: 'negative' })

  const lm = await locationStore.getLocationLookupMap()
  locationLookUpMapRef.value = lm
})
</script>

<style lang="scss" scoped>
@use '@/assets/sass/variable' as *;

.condition-review-sections {
  display: flex;
  flex-direction: column;
  gap: 2em;

  .section {
    margin: unset;
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

  .no-padding {
    padding: unset;
  }

  .contract-condition-row {
    display: flex;
    justify-content: space-between;

    padding: 0 12px;
    line-height: 24px;

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

    .condition-text-area {
      margin-top: 1rem;
      display: flex;
      flex-direction: column;
      width: 100%;
      justify-content: start;
      align-items: start;
      gap: 1rem;
    }
  }
}
</style>
