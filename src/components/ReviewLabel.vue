<template>
  <section :id="sectionId" class="review-label">
    <component :is="headline" v-if="title">{{ $t(title) }}</component>

    <el-checkbox
      v-if="
        authStore.singleKnownRole === Role.FdpgMember &&
        sectionId &&
        proposalStore.currentProposal?.status !== ProposalStatus.Draft
      "
      v-model="checkboxValue"
      v-loading="isCheckboxLoading"
      :disabled="isCheckboxLoading"
      class="label-checkbox"
    >
      <template v-if="checkboxValue">{{ $t('proposal.areaWasChecked') }}</template>
      <template v-else>{{ $t('proposal.markAreaAsChecked') }}</template>
    </el-checkbox>
  </section>
</template>

<script setup lang="ts">
import useNotifications from '@/composables/use-notifications'
import { useAuthStore } from '@/stores/auth/auth.store'
import { useProposalStore } from '@/stores/proposal/proposal.store'
import { Role } from '@/types/oidc.types'
import { ProposalStatus } from '@/types/proposal.types'
import { computed, ref } from 'vue'

const authStore = useAuthStore()

const props = defineProps({
  title: {
    type: String,
    default: undefined,
  },
  isDone: {
    type: Boolean,
    default: false,
  },
  sectionId: {
    type: String,
    default: undefined,
  },
  headline: {
    type: String,
    default: 'h3',
  },
})

const emit = defineEmits(['update:isDone'])

const _isDone = ref()
_isDone.value = props.isDone.valueOf()

const proposalStore = useProposalStore()
const proposalId = computed(() => proposalStore.currentProposal?._id as string)
const { showErrorMessage } = useNotifications()
const isCheckboxLoading = ref(false)
const checkboxValue = computed({
  get() {
    return _isDone.value
  },
  async set(value) {
    if (isCheckboxLoading.value) {
      return
    }

    isCheckboxLoading.value = true
    try {
      if (proposalId.value && props.sectionId) {
        await proposalStore.markSectionAsDone(proposalId.value, props.sectionId, value)
      }
      _isDone.value = value
      emit('update:isDone', value)
    } catch (error) {
      console.log(error)
      showErrorMessage()
    }

    isCheckboxLoading.value = false
  },
})
</script>

<style lang="scss">
@import 'src/assets/sass/variable';

.review-label {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: $gray-900;
  font-weight: 700;
  margin-bottom: 0.5em;

  h3,
  h4 {
    margin: 0;
  }

  .label-checkbox {
    background-color: $white;
    padding: 6px 20px 6px 12px;
    border-radius: 4px;
    box-shadow: 0 2px 11px 0 $gray-500;

    &.is-checked {
      .el-checkbox__input {
        .el-checkbox__inner {
          &::after {
            border-color: #9bb923;
            height: 8.5px;
            width: 3px;
            top: 1.5px;
            left: 5.5px;
            border-width: 2px;
          }

          background-color: white;
        }
      }
    }

    .el-checkbox__input {
      .el-checkbox__inner {
        width: 20px;
        height: 20px;
        border-width: 2px;
        border-radius: 50%;
        border-color: $green;
      }

      &:focus-within {
        outline: $blue auto 1px;
        outline-offset: 3px;
      }
    }

    .el-checkbox__label {
      font-size: 16px;
      color: $black;
      padding-left: 10px;
    }
  }

  .el-loading-spinner {
    text-align: left;
  }
}
</style>
