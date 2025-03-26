<template>
  <el-aside class="proposal-sidebar">
    <img :src="logoSrc" alt="" class="logo" />
    <div class="proposal-menu">
      <div class="proposal-menu__top">
        <div style="height: calc(100vh - 200px); max-width: 600px">
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
                <span class="step-title">{{ t(`sidebar.${getStepKey(step.step)}`) }}</span>
              </template>
              <template #description>
                <span class="step-status">{{ JSON.stringify(step.validation) }}</span>
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
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const layoutStore = useLayoutStore()
const logoSrc = new URL('@/assets/img/logo/logo.svg', import.meta.url).href
const activeTab = computed(() => layoutStore.activeStep)

const completedSteps = ref<Set<CreatPrposalSteps>>(new Set())

const setActiveTab = (tab: CreatPrposalSteps) => {
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
@use 'sass:color';

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
    border: $blue 2px solid;
    color: $gray-900 !important;
  }
  &.is-process {
    .el-step__icon {
      background-color: $blue !important;
      color: $white !important;
      /* border-color: $blue !important; */
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
  padding: 24px 0px;
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
    border-top: $gray-100 1px solid;
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
    .proposal-menu__item {
      height: 44px;
      margin: 8px 0;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-weight: 600;
      color: $gray-900;
      line-height: 45px;
      border-radius: 4px;
      padding: 0 20px !important;
      text-decoration-line: none;

      &.proposal-menu__item--exact-active,
      &:focus,
      &:hover {
        background-color: $gray-200;
      }

      i {
        color: $gray-900;
        width: 20px;
        text-align: center;
        font-size: 20px;
        margin-right: 12px;
        margin-left: 2px;
      }

      &.proposal-menu__item--exact-active {
        i {
          color: $blue;
        }
      }

      .proposal-menu__wrapper {
        display: flex;
        align-items: center;
      }
      .proposal-sidebar__url {
        color: $gray-900;
        text-decoration: none;
      }

      .proposal-menu__icons {
        float: right;

        .proposal-menu__icon {
          border-radius: 8px;
          padding: 0 8px;
          line-height: 24px;
          margin-left: 4px;
          border: 1px solid;

          &--critical {
            background: $red-100;
            border-color: $red-100;
            color: $white;
          }

          &--high {
            background: $blue;
            border-color: $blue;
            color: $white;
          }

          &--medium {
            background: $white;
            border-color: $white;
            color: $black;
          }

          &--low {
            background: rgba(106, 116, 132, 0.1);
            border-color: rgba(106, 116, 132, 0.1);
            color: $gray-900;
          }
        }
      }
    }

    .el-divider {
      background-color: $gray-300;

      &.el-divider--horizontal {
        height: 2px;
        margin: 23px 0;
      }
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
