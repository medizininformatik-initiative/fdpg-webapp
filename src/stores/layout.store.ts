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
  isShoppingListOpen: boolean
  isDatasourceSelected: boolean
  totalRequiredFields: number
  validatedFields: number
  formTouched: boolean
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
    isShoppingListOpen: false,
    isDatasourceSelected: false,
    totalRequiredFields: 0,
    validatedFields: 0,
    formTouched: false,
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
      this.scrollToTop()
    },
    nextStep() {
      const nextStep = this.createProposalSteps.find((s) => s.step === this.activeStep + 1)
      if (nextStep) {
        this.activeStep = nextStep.step
        this.scrollToTop()
      }
    },
    prevStep() {
      const prevStep = this.createProposalSteps.find((s) => s.step === this.activeStep - 1)
      if (prevStep) {
        this.activeStep = prevStep.step
        this.scrollToTop()
      }
    },
    goToStep(step: CreatPrposalSteps) {
      const targetStep = this.createProposalSteps.find((s) => s.step === step)
      if (targetStep) {
        this.activeStep = targetStep.step
        this.scrollToTop()
      }
    },
    updateStepStatus(step: keyof typeof CreatPrposalSteps, valid: boolean | null) {
      const currentStep = this.createProposalSteps.find((s) => s.step === CreatPrposalSteps[step])
      if (currentStep) {
        currentStep.validation = valid
      }
    },
    resetSteps() {
      this.createProposalSteps.forEach((step) => {
        step.validation = null
      })
      this.activeStep = CreatPrposalSteps.DataSources
    },
    toggleShoppingList() {
      const mainWrapper = document.querySelector('.fdpg-new-proposal-page')
      this.isShoppingListOpen = !this.isShoppingListOpen

      if (mainWrapper) {
        if (this.isShoppingListOpen) {
          mainWrapper.classList.add('shopping-list-open')
        } else {
          setTimeout(() => {
            mainWrapper.classList.remove('shopping-list-open')
          }, 500)
        }
      }
      this.scrollToTop()
    },
    setDatasourceSelected(isSelected: boolean) {
      this.isDatasourceSelected = isSelected
    },
    setTotalRequiredFields(count: number) {
      this.totalRequiredFields = count
    },
    setValidatedFields(count: number) {
      this.validatedFields = count
    },
    scrollToTop() {
      setTimeout(() => {
        const mainWrapper = document.getElementById('main-scroll-top')
        if (mainWrapper) {
          mainWrapper.scrollTo(0, 0)
        }
      }, 100)
    },
    setFormTouched(touched: boolean) {
      this.formTouched = touched
    },
  },
})
