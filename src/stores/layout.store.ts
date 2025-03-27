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
  validation: boolean | null
}

export const useLayoutStore = defineStore('layout', {
  state: (): ILayoutStore => ({
    breadcrumbs: [],
    isSidebarVisible: false,
    lastDashboard: RouteName.Dashboard,
    createProposalSteps: [
      { step: CreatPrposalSteps.DataSources, validation: null },
      { step: CreatPrposalSteps.Variables, validation: null },
      { step: CreatPrposalSteps.Casesohort, validation: null },
      { step: CreatPrposalSteps.DataUsage, validation: null },
      { step: CreatPrposalSteps.ProjectDetails, validation: null },
      { step: CreatPrposalSteps.ProjectParticipants, validation: null },
      { step: CreatPrposalSteps.ResearchProject, validation: null },
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
    updateStepStatus(step: keyof typeof CreatPrposalSteps, valid: boolean | null) {
      const currentStep = this.createProposalSteps.find((s) => s.step === CreatPrposalSteps[step])
      if (currentStep) {
        currentStep.validation = valid
      }
    },
  },
})
