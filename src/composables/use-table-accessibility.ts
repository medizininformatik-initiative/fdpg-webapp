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
    const table = target.closest('.fdpg-table')
    keyboardNavigation.setFocus(table)
  }

  const focusHeaderRow = (event: Event): void => {
    const target = event.target as HTMLElement
    const currentTable = target?.closest('.fdpg-table')
    const headerRow = currentTable?.querySelector('.columnHeader')?.closest('tr')
    keyboardNavigation.setFocus(headerRow)
    event.preventDefault()
  }

  const focusTableBody = (event: Event): void => {
    const target = event.target as HTMLElement
    const currentTable = target?.closest('.fdpg-table')
    const tableBody = currentTable?.getElementsByClassName('el-table__body')[0] as HTMLTableElement
    keyboardNavigation.setFocus(tableBody)
    addTableBodyListeners(tableBody)
  }

  const focusFirstRow = (event: Event): void => {
    const target = event.target as HTMLElement
    const firstRow = target?.closest('.fdpg-table')?.querySelector('tbody')?.firstElementChild?.querySelector('.el-tag')
    keyboardNavigation.setFocus(firstRow)
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
      keyboardNavigation.focusNextElement(event)
    } else if (event.key === 'Space') {
      focusFirstRow(event)
    }
  }

  const removeTableBodyListeners = (event: Event): void => {
    const target = event.target as HTMLElement
    const tbody = target?.getElementsByClassName('el-table__body')[0] as HTMLElement
    if (tbody && tBodyListenerExists) {
      tbody.removeEventListener('keydown', handleTableBodyKeydown)
    }
  }

  const handleTableTab = (event: Event): void => {
    const target = event.target as HTMLElement
    const classes = Array.from(target?.classList)
    if (classes.includes('fdpg-table') || classes.includes('el-tag')) {
      keyboardNavigation.focusNextElement(event)
    } else if (classes.includes('columnHeader') || target?.nodeName.toLowerCase() === 'tr') {
      focusTableBody(event)
    }
  }

  const handleShiftTab = (event: Event): void => {
    const target = event.target as HTMLElement
    const classes = Array.from(target?.classList)
    if (classes.includes('el-table__body')) {
      focusHeaderRow(event)
    } else if (classes.includes('el-tag')) {
      focusTableBody(event)
    } else {
      const app = document.getElementById('app')
      keyboardNavigation.focusPreviousElement(event, app)
    }
  }

  const handleTableSpace = (event: Event): void => {
    const target = event.target as HTMLElement
    const classes = Array.from(target?.classList)
    if (classes.includes('fdpg-table')) {
      focusHeaderRow(event)
    } else if (classes.includes('el-table__body')) {
      focusFirstRow(event)
    } else if (target.nodeName.toLowerCase() === 'tr') {
      const firstColumnHeader = getFirstColumnHeader(event)
      keyboardNavigation.setFocus(firstColumnHeader)
    }
  }

  const handleTableEsc = (event: Event): void => {
    const target = event.target as HTMLElement
    const classes = Array.from(target?.classList)

    if (classes.includes('columnHeader')) {
      focusHeaderRow(event)
    } else if (classes.includes('el-tag')) {
      focusTableBody(event)
      event.preventDefault()
    } else if (classes.includes('el-table__body') || target?.nodeName.toLowerCase() === 'tr') {
      focusTable(event)
      event.preventDefault()
    } else {
      event.preventDefault()
    }
  }

  const focusNextColumnHeader = (event: Event): void => {
    const target = event.target as HTMLElement
    const lastElement = getLastColumnHeader(event)
    if (target?.isSameNode(<Node>lastElement)) {
      const firstColumnHeader = getFirstColumnHeader(event)
      keyboardNavigation.setFocus(firstColumnHeader)
    } else {
      const nextColumnHeader = getNextColumnHeader(event)
      keyboardNavigation.setFocus(nextColumnHeader)
    }
  }

  const focusPreviousColumnHeader = (event: Event): void => {
    const target = event.target as HTMLElement
    const firstElement = getFirstColumnHeader(event)
    if (target?.isSameNode(<Node>firstElement)) {
      const lastColumnHeader = getLastColumnHeader(event)
      keyboardNavigation.setFocus(lastColumnHeader)
    } else {
      const previousColumnHeader = getPreviousColumnHeader(event)
      keyboardNavigation.setFocus(previousColumnHeader)
    }
  }

  const getLastColumnHeader = (event: Event): Element | undefined => {
    const target = event.target as HTMLElement
    const headerRow = target?.closest('tr')
    return headerRow?.lastElementChild?.getElementsByClassName('columnHeader')[0]
  }

  const getFirstColumnHeader = (event: Event): Element | undefined => {
    const target = event.target as HTMLElement
    const headerRow = target?.closest('tr')
    return headerRow?.firstElementChild?.getElementsByClassName('columnHeader')[0]
  }

  const getNextColumnHeader = (event: Event): Element | undefined => {
    const target = event.target as HTMLElement
    const nextHeaderEl = target?.closest('th')?.nextElementSibling
    return nextHeaderEl?.getElementsByClassName('columnHeader')[0]
  }

  const getPreviousColumnHeader = (event: Event): Element | undefined => {
    const target = event.target as HTMLElement
    const previousHeaderEl = target?.closest('th')?.previousElementSibling
    return previousHeaderEl?.getElementsByClassName('columnHeader')[0]
  }

  const focusPreviousRow = (event: Event): void => {
    const target = event.target as HTMLElement
    const classes = Array.from(target?.classList)

    if (classes.includes('el-table__row') || classes.includes('el-tag')) {
      const row = document?.activeElement?.closest('.el-table__row')
      const tBody = target.closest('tbody')
      if (row instanceof HTMLTableRowElement && tBody instanceof HTMLElement && row.rowIndex > 0) {
        const previousRow = tBody?.children[row.rowIndex]?.previousElementSibling
        const tag = previousRow?.getElementsByClassName('el-tag')[0]
        keyboardNavigation.setFocus(tag)
      }
    }
  }

  const focusNextRow = (event: Event): void => {
    const target = event.target as HTMLElement
    const classes = Array.from(target.classList)

    if (classes.includes('el-table__row') || classes.includes('el-tag')) {
      const row = document?.activeElement?.closest('.el-table__row')
      const tBody = target.closest('tbody')
      if (row instanceof HTMLTableRowElement && tBody instanceof HTMLElement) {
        const nextRow = tBody?.children[row.rowIndex]?.nextElementSibling
        const tag = nextRow?.getElementsByClassName('el-tag')[0]
        keyboardNavigation.setFocus(tag)
      }
    }
  }

  const toggleSort = (event: Event): void => {
    const target = event.target as HTMLElement
    const headerEl = target?.closest('th')
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
