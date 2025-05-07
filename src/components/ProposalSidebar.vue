<template>
  <el-aside class="proposal-sidebar">
    <img :src="logoSrc" alt="" class="logo" />
    <div class="proposal-menu">
      <div class="proposal-menu__top">
        <div style="height: 590px; max-width: 600px">
          <el-steps direction="vertical" :active="activeTab" finish-status="success">
            <el-step
              v-for="step in layoutStore.createProposalSteps"
              :key="step.step"
              :status="getStepStatus(getStepKey(step.step))"
              @click="setActiveTab(step.step)"
              :class="{
                'is-process': activeTab === step.step,
              }"
            >
              <template #title>
                <span class="step-title">{{ $t(`sidebar.${getStepKey(step.step)}`) }}</span>
              </template>
              <template #description>
                <span class="step-status">{{ $t(`sidebar.${getStepStatus(getStepKey(step.step))}`) }}</span>
              </template>
            </el-step>
          </el-steps>
        </div>
      </div>
    </div>
  </el-aside>
</template>

<script setup lang="ts">
import { useLayoutStore } from '@/stores/layout.store'
import { CreatPrposalSteps } from '@/types/create-proposal-steps.enum'
import { computed, ref } from 'vue'

const layoutStore = useLayoutStore()
const logoSrc = new URL('@/assets/img/logo/logo.svg', import.meta.url).href
const activeTab = computed(() => layoutStore.activeStep)

const completedSteps = ref<Set<CreatPrposalSteps>>(new Set())

const setActiveTab = (tab: CreatPrposalSteps) => {
  if (!layoutStore.isDatasourceSelected) return
  layoutStore.setActiveStep(tab)
}

const getStepKey = (step: CreatPrposalSteps): string => {
  return (
    Object.keys(CreatPrposalSteps).find((key) => CreatPrposalSteps[key as keyof typeof CreatPrposalSteps] === step) ||
    ''
  )
}

const steps = computed(() => {
  return layoutStore.createProposalSteps
})

// Method to check if a step is completed
const isStepCompleted = (step: CreatPrposalSteps): boolean => {
  return completedSteps.value.has(step)
}

// Method to get the status of a step
const getStepStatus = (step: string): 'success' | 'process' | 'wait' | 'error' => {
  const stepEnum = CreatPrposalSteps[step as keyof typeof CreatPrposalSteps]
  const stepData = layoutStore.createProposalSteps.find((s) => s.step === stepEnum)

  if (stepData?.validation === true) {
    return 'success'
  } else if (stepData?.validation === false) {
    return 'error'
  } else if (activeTab.value === stepEnum) {
    return 'process'
  }
  return 'wait'
}
</script>

<style lang="scss">
@use '@/assets/sass/variable' as *;

@mixin sidebar-block {
  width: $sidebar-width !important;
  transition-timing-function: ease;
}

.el-step__head {
  .el-step__line {
    border-color: $blue;
    background-color: $blue;
    color: $blue;
    &.is-error {
      background-color: $red-100 !important;
      border-color: $red-100 !important;
    }
  }
  .el-step__icon {
    border: $blue 2px solid !important;
    color: $gray-900 !important;
  }
  &.is-process {
    .el-step__icon {
      background-color: $blue !important;
      color: $white !important;
    }
  }
  &.is-error {
    .el-step__icon {
      background-color: $red-100 !important;
      color: $white !important;
      border-color: $red-100 !important;
    }
  }
  &.is-success {
    .el-step__icon {
      background-color: $green !important;
      color: $white !important;
      border-color: $green !important;
    }
  }
}

.el-step.is-vertical {
  padding: 0 16px;
  .el-step__main {
    .el-step__title.is-process {
      font-weight: normal;
    }
  }
}

.el-step.is-vertical.is-process {
  background-color: $gray-200;
}

.proposal-sidebar {
  height: 100%;
  display: flex;
  position: fixed;
  padding: 24px 0;
  background: $white;
  flex-direction: column;
  z-index: $sidebar-z-index;
  border-right: 1px solid $gray-400;
  transition-duration: $sidebar-transition-duration;
  @include sidebar-block;

  .logo {
    width: 179px;
    margin-left: 29px;
    height: $header-height;
  }

  .proposal-menu {
    border-top: 1px solid $gray-100;
    width: 100%;
    height: 100%;
    padding-top: 15px;
    border-right: none;
    display: flex;
    flex-direction: column;
    justify-content: space-between;

    .step-status {
      font-size: 16px;
      color: $gray-900;
      margin-left: 8px;
    }

    .step-title {
      font-size: 18px;
      color: $gray-900;
      font-weight: 900;
    }
  }

  @media (max-width: $md) {
    padding: 46px 0;
    width: 0 !important;
    transition-timing-function: cubic-bezier(0.99, 0.01, 0.25, 1);
  }

  &.block {
    @include sidebar-block;
  }
}
</style>
