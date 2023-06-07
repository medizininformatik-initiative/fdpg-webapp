import { keyboardNavigation } from '../utils/keyboard-nav.util'

export default () => {
  const handleFocus = async (event: FocusEvent): Promise<void> => {
    const target = event.target as HTMLElement
    const relatedTarget = event.relatedTarget as HTMLElement

    const targetPanel = target?.closest('.fdpg-card-panel')
    const relatedTargetPanel = relatedTarget?.closest('.fdpg-card-panel')
    const isElementOfSamePanel = targetPanel?.isSameNode(relatedTargetPanel)

    if (!isElementOfSamePanel) {
      const targetPanelRow = targetPanel?.querySelector('.el-row') as HTMLElement
      targetPanelRow?.focus()
    }
    event.preventDefault()
  }

  const focusNextCard = (event: Event): void => {
    const target = event.target as HTMLElement
    const classes = Array.from(target?.classList)

    if (classes?.includes('fdpg-card')) {
      if (target?.isSameNode(getLastCard(event))) {
        getFirstCard(event).focus()
      } else {
        getNextCard(event).focus()
      }
    }
  }

  const focusPreviousCard = (event: Event): void => {
    const target = event.target as HTMLElement
    const classes = Array.from(target?.classList)

    if (classes?.includes('fdpg-card')) {
      if (target.isSameNode(getFirstCard(event))) {
        getLastCard(event)?.focus()
      } else {
        getPreviousCard(event)?.focus()
      }
    }
  }

  const getFirstCard = (event: Event): HTMLElement => {
    const target = event.target as HTMLElement
    const currentRow = target?.closest('.el-row')
    const firstCard = currentRow?.getElementsByClassName('fdpg-card')[0] as HTMLElement
    return firstCard
  }

  const getLastCard = (event: Event): HTMLElement => {
    const target = event.target as HTMLElement
    const lastRow = target?.closest('.el-row')?.lastElementChild
    const lastRowsCard = lastRow?.getElementsByClassName('fdpg-card')[0] as HTMLElement
    return lastRowsCard
  }

  const getNextCard = (event: Event): HTMLElement => {
    const target = event.target as HTMLElement
    const nextColumn = target?.closest('.el-col')?.nextElementSibling
    const nextColumnsCard = nextColumn?.getElementsByClassName('fdpg-card')[0] as HTMLElement
    return nextColumnsCard
  }

  const getPreviousCard = (event: Event): HTMLElement => {
    const target = event.target as HTMLElement
    const previousColumn = target?.closest('.el-col')?.previousElementSibling
    const previousColumnsCard = previousColumn?.getElementsByClassName('fdpg-card')[0] as HTMLElement
    return previousColumnsCard
  }

  const handleCardRowSpace = (target: HTMLElement, event: Event): void => {
    const cardsExist = target.getElementsByClassName('el-col').length > 0
    if (cardsExist) {
      const card = getFirstCard(event)
      card?.focus()
    }
  }

  const handleCardRowEsc = (target: HTMLElement): void => {
    const classes = Array.from(target.classList)

    if (classes.includes('fdpg-card')) {
      const row = target?.closest('.el-row') as HTMLElement
      row?.focus()
    }
  }

  const handleShiftTab = (event: Event): void => {
    const target = event.target as HTMLElement
    const classes = Array.from(target.classList)
    const card = target.closest('.fdpg-card')

    const isCard = classes.includes('fdpg-card')
    const isChildOfCard = card?.contains(target)

    if (isChildOfCard || isCard) {
      const panel = target.closest('.fdpg-card-panel') as HTMLElement
      const panelRow = panel?.querySelector('.el-row') as HTMLElement
      panelRow?.focus()
    } else {
      const app = document.getElementById('app') as HTMLElement
      keyboardNavigation.focusPreviousElement(event, app)
    }
  }

  const handleTab = (event: Event): void => {
    const target = event.target as HTMLElement
    const currentPanel = target.closest('.fdpg-card-panel') as HTMLElement
    const panelRow = currentPanel?.querySelector('.el-row') as HTMLElement
    const app = document.getElementById('app') as HTMLElement

    keyboardNavigation.focusNextElement(event, app, panelRow)

    event.preventDefault()
  }

  const focusCard = (event: Event): void => {
    const target = event.target as HTMLElement
    const card = target?.closest('.fdpg-card') as HTMLElement
    card?.focus()
  }

  const focusFirstActionItem = (event: Event): void => {
    const firstAction = getFirstActionItem(event)
    keyboardNavigation.setFocus(firstAction)
  }

  const getFirstActionItem = (event: Event): HTMLElement => {
    const target = event.target as HTMLElement
    const currentCard = target.closest('.fdpg-card')
    const firstActionItem = currentCard?.querySelector('.actions')?.firstElementChild as HTMLElement
    return firstActionItem
  }

  const getLastActionItem = (event: Event): HTMLElement => {
    const target = event.target as HTMLElement
    const lastActionItem = target.closest('.actions')?.lastElementChild as HTMLElement
    return lastActionItem
  }

  const focusPreviousButton = (event: Event): void => {
    const target = event.target as HTMLElement
    const isFirstActionItem = target.isSameNode(getFirstActionItem(event))

    if (isFirstActionItem) {
      keyboardNavigation.setFocus(getLastActionItem(event))
    } else {
      const previousActionItem = target.previousElementSibling as HTMLElement
      keyboardNavigation.setFocus(previousActionItem)
    }
  }

  const focusNextButton = (event: Event): void => {
    const target = event.target as HTMLElement
    const isLastActionItem = target.isSameNode(getLastActionItem(event))

    if (isLastActionItem) {
      keyboardNavigation.setFocus(getFirstActionItem(event))
    } else {
      const nextActionItem = target.nextElementSibling as HTMLElement
      keyboardNavigation.setFocus(nextActionItem)
    }
  }

  return {
    handleFocus,
    focusNextCard,
    focusPreviousCard,
    handleCardRowSpace,
    handleCardRowEsc,
    handleShiftTab,
    handleTab,

    focusCard,
    focusFirstActionItem,
    focusPreviousButton,
    focusNextButton,
  }
}
