import type { IBreadcrumb } from '@/types/breadcrumb.interface'
import { CreatPrposalSteps } from '@/types/create-proposal-steps.enum'
import { RouteName } from '@/types/route-name.enum'
import { defineStore } from 'pinia'

interface ILayoutStore {
  breadcrumbs: IBreadcrumb[]
  isSidebarVisible: boolean
  lastDashboard: RouteName
  createProposalSteps: ICreateProposalStep[]
  activeStep: CreatPrposalSteps
}
export interface ICreateProposalStep {
  step: CreatPrposalSteps
  validation: 'success' | 'process' | 'wait' | 'not-complete'
}

export const useLayoutStore = defineStore('layout', {
  state: (): ILayoutStore => ({
    breadcrumbs: [],
    isSidebarVisible: false,
    lastDashboard: RouteName.Dashboard,
    createProposalSteps: [
      { step: CreatPrposalSteps.DataSources, validation: 'wait' },
      { step: CreatPrposalSteps.Variables, validation: 'wait' },
      { step: CreatPrposalSteps.Casesohort, validation: 'wait' },
      { step: CreatPrposalSteps.DataUsage, validation: 'wait' },
      { step: CreatPrposalSteps.ProjectDetails, validation: 'wait' },
      { step: CreatPrposalSteps.ProjectParticipants, validation: 'wait' },
      { step: CreatPrposalSteps.ResearchProject, validation: 'wait' },
    ],
    activeStep: CreatPrposalSteps.DataSources,
  }),

  actions: {
    setBreadcrumbs(breadcrumbs: IBreadcrumb[]) {
      this.breadcrumbs = breadcrumbs
    },

    setSidebarVisiblity(isVisible: boolean) {
      this.isSidebarVisible = isVisible
    },

    setLastDashboard(lastDashboard: RouteName) {
      this.lastDashboard = lastDashboard
    },
    setActiveStep(step: CreatPrposalSteps) {
      this.activeStep = step
    },
    nextStep() {
      const nextStep = this.createProposalSteps.find((s) => s.step === this.activeStep + 1)
      if (nextStep) {
        this.activeStep = nextStep.step
      }
    },
    prevStep() {
      const prevStep = this.createProposalSteps.find((s) => s.step === this.activeStep - 1)
      if (prevStep) {
        this.activeStep = prevStep.step
      }
    },
    updateStepStatus(step: keyof typeof CreatPrposalSteps, valid: boolean, isAttempted: boolean = false) {
      const currentStep = this.createProposalSteps.find((s) => s.step === CreatPrposalSteps[step])
      if (currentStep) {
        if (valid) {
          currentStep.validation = 'success'
        } else if (isAttempted) {
          currentStep.validation = 'not-complete'
        } else {
          currentStep.validation = 'process'
        }
      } else {
        console.error('Step not found')
      }
    },
  },
})
