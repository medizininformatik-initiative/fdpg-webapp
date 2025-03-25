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
  status: 'success' | 'process' | 'wait'
}

export const useLayoutStore = defineStore('layout', {
  state: (): ILayoutStore => ({
    breadcrumbs: [],
    isSidebarVisible: false,
    lastDashboard: RouteName.Dashboard,
    createProposalSteps: [
      { step: CreatPrposalSteps.DataSources, status: 'wait' },
      { step: CreatPrposalSteps.Variables, status: 'wait' },
      { step: CreatPrposalSteps.Casesohort, status: 'wait' },
      { step: CreatPrposalSteps.DataUsage, status: 'wait' },
      { step: CreatPrposalSteps.ProjectDetails, status: 'wait' },
      { step: CreatPrposalSteps.ProjectParticipants, status: 'wait' },
      { step: CreatPrposalSteps.ResearchProject, status: 'wait' },
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
  },
})
