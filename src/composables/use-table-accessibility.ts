import { keyboardNavigation } from '../utils/keyboard-nav.util'

export default () => {
  const handleFocus = (event: FocusEvent): void => {
    const relatedTarget = event.relatedTarget as HTMLElement
    const classes = Array.from(relatedTarget?.classList)
    if (!classes.includes('el-table__body') && !classes.includes('el-tag')) {
      focusTable(event)
    }
  }

  const focusTable = (event: Event): void => {
    const target = event.target as HTMLElement
    const table = target.closest('.fdpg-table') as HTMLElement
    table?.focus()
  }

  const focusHeaderRow = (event: Event): void => {
    const target = event.target as HTMLElement
    const currentTable = target.closest('.fdpg-table')
    const headerRow = currentTable?.querySelector('.columnHeader')?.closest('tr') as HTMLElement
    keyboardNavigation.setFocus(headerRow)
    event.preventDefault()
  }

  const focusTableBody = (event: Event): void => {
    const target = event.target as HTMLElement
    const currentTable = target.closest('.fdpg-table')
    const tableBody = currentTable?.getElementsByClassName('el-table__body')[0] as HTMLTableElement
    keyboardNavigation.setFocus(tableBody)
    addTableBodyListeners(tableBody)
  }

  const focusFirstRow = (event: Event): void => {
    const target = event.target as HTMLElement
    const firstRow = target
      ?.closest('.fdpg-table')
      ?.querySelector('tbody')
      ?.firstElementChild?.querySelector('.el-tag') as HTMLElement
    keyboardNavigation.setFocus(firstRow)
  }

  const focusNextElement = (event: Event): void => {
    const target = event.target as HTMLElement
    const nextElement = target?.closest('.fdpg-table')?.nextElementSibling as HTMLElement

    if (nextElement) {
      const nextElementsFocusables = keyboardNavigation.getFocusableChildren(nextElement)

      const isNextElementFocusable = keyboardNavigation.isFocusable(nextElement)
      const isNextElementsChildFocusable = nextElementsFocusables && nextElementsFocusables.length > 0

      if (isNextElementFocusable) {
        nextElement.focus()
      } else if (isNextElementsChildFocusable) {
        const next = nextElementsFocusables[0] as HTMLElement
        next.focus()
      } else {
        focusTable(event)
      }
    }
  }

  let tBodyListenerExists = false
  const addTableBodyListeners = (tableBody: HTMLTableElement): void => {
    if (!tBodyListenerExists) {
      tableBody?.addEventListener('keydown', handleTableBodyKeydown)
      tBodyListenerExists = true
    }
  }

  const handleTableBodyKeydown = (event: KeyboardEvent): void => {
    if (event.shiftKey && event.key === 'Tab') {
      focusHeaderRow(event)
    } else if (event.key === 'Tab') {
      focusNextElement(event)
    } else if (event.key === 'Space') {
      focusFirstRow(event)
    }
  }

  const removeTableBodyListeners = (event: Event): void => {
    const target = event.target as HTMLElement
    const tbody = target.getElementsByClassName('el-table__body')[0] as HTMLElement
    if (tbody && tBodyListenerExists) {
      tbody.removeEventListener('keydown', handleTableBodyKeydown)
    }
  }

  const handleTableTab = (event: Event): void => {
    const target = event.target as HTMLElement
    const classes = Array.from(target?.classList)
    if (classes.includes('fdpg-table') || classes.includes('el-tag')) {
      focusNextElement(event)
    } else if (classes.includes('columnHeader') || target.nodeName.toLowerCase() === 'tr') {
      focusTableBody(event)
    }
  }

  const handleShiftTab = (event: Event): void => {
    const target = event.target as HTMLElement
    const classes = Array.from(target.classList)
    if (classes.includes('el-table__body')) {
      focusHeaderRow(event)
    } else if (classes.includes('el-tag')) {
      focusTableBody(event)
    } else {
      const app = document.getElementById('app') as HTMLElement
      keyboardNavigation.focusPreviousElement(event, app)
    }
  }

  const handleTableSpace = (event: Event): void => {
    const target = event.target as HTMLElement
    const classes = Array.from(target.classList)
    if (classes.includes('fdpg-table')) {
      focusHeaderRow(event)
    } else if (classes.includes('el-table__body')) {
      focusFirstRow(event)
    } else if (target.nodeName.toLowerCase() === 'tr') {
      getFirstColumnHeader(event)?.focus()
    }
  }

  const handleTableEsc = (event: Event): void => {
    const target = event.target as HTMLElement
    const classes = Array.from(target.classList)

    if (classes.includes('columnHeader')) {
      focusHeaderRow(event)
    } else if (classes.includes('el-tag')) {
      focusTableBody(event)
    } else if (classes.includes('el-table__body') || target.nodeName.toLowerCase() === 'tr') {
      focusTable(event)
    }
    event.preventDefault()
  }

  const focusNextColumnHeader = (event: Event): void => {
    const target = event.target as HTMLElement
    const lastElement = getLastColumnHeader(event)
    if (target.isSameNode(lastElement)) {
      getFirstColumnHeader(event)?.focus()
    } else {
      getNextColumnHeader(event)?.focus()
    }
  }

  const focusPreviousColumnHeader = (event: Event): void => {
    const target = event.target as HTMLElement
    const firstElement = getFirstColumnHeader(event)
    if (target.isSameNode(firstElement)) {
      getLastColumnHeader(event)?.focus()
    } else {
      getPreviousColumnHeader(event)?.focus()
    }
  }

  const getLastColumnHeader = (event: Event): HTMLElement => {
    const target = event.target as HTMLElement
    const headerRow = target?.closest('tr')
    return headerRow?.lastElementChild?.getElementsByClassName('columnHeader')[0] as HTMLElement
  }

  const getFirstColumnHeader = (event: Event): HTMLElement => {
    const target = event.target as HTMLElement
    const headerRow = target?.closest('tr')
    return headerRow?.firstElementChild?.getElementsByClassName('columnHeader')[0] as HTMLElement
  }

  const getNextColumnHeader = (event: Event): HTMLElement => {
    const target = event.target as HTMLElement
    const nextHeaderEl = target?.closest('th')?.nextElementSibling
    return nextHeaderEl?.getElementsByClassName('columnHeader')[0] as HTMLElement
  }

  const getPreviousColumnHeader = (event: Event): HTMLElement => {
    const target = event.target as HTMLElement
    const previousHeaderEl = target?.closest('th')?.previousElementSibling
    return previousHeaderEl?.getElementsByClassName('columnHeader')[0] as HTMLElement
  }

  const focusPreviousRow = (event: Event): void => {
    const target = event.target as HTMLElement
    const classes = Array.from(target.classList)

    if (classes.includes('table__row') || classes.includes('el-tag')) {
      const row = document?.activeElement?.closest('.el-table__row') as HTMLTableRowElement
      const tBody = target.closest('tbody') as HTMLElement
      const idxMax = tBody.children.length

      const isNotLastElement = row.rowIndex < idxMax

      if (isNotLastElement) {
        const previousRow = tBody?.children[row.rowIndex].previousElementSibling
        const tag = previousRow?.getElementsByClassName('el-tag')[0] as HTMLTableRowElement
        tag?.focus()
      }
    }
  }

  const focusNextRow = (event: Event): void => {
    const target = event.target as HTMLElement
    const classes = Array.from(target.classList)

    if (classes.includes('el-table__row') || classes.includes('el-tag')) {
      const row = document?.activeElement?.closest('.el-table__row') as HTMLTableRowElement
      const tBody = target.closest('tbody')
      const nextRow = tBody?.children[row.rowIndex].nextElementSibling
      const tag = nextRow?.getElementsByClassName('el-tag')[0] as HTMLTableRowElement
      tag?.focus()
    }
  }

  const toggleSort = (event: Event): void => {
    const target = event.target as HTMLElement
    const headerEl = target.closest('th')
    headerEl?.click()
  }

  return {
    handleFocus,
    focusTableBody,
    focusHeaderRow,
    focusTable,
    removeTableBodyListeners,
    handleTableTab,
    handleShiftTab,
    handleTableSpace,
    handleTableEsc,
    focusNextColumnHeader,
    focusPreviousColumnHeader,
    focusPreviousRow,
    focusNextRow,
    handleTableBodyKeydown,
    toggleSort,
  }
}
