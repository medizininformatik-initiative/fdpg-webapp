import { proposalCountMock } from '@/mocks/proposal-counts.mock'
import { useProposalStore } from '@/stores/proposal/proposal.store'
import { createTestingPinia } from '@pinia/testing'
import { setActivePinia } from 'pinia'
import { keyboardNavigation } from '@/utils/keyboard-nav.util'
import useTableAccessibility from '../use-table-accessibility'
import type { MockedObject } from 'vitest'

vi.mock('@/utils/keyboard-nav.util', () => ({
  keyboardNavigation: {
    setFocus: vi.fn().mockImplementation(() => {}),
    focusNextElement: vi.fn().mockImplementation(() => {}),
    focusPreviousElement: vi.fn().mockImplementation(() => {}),
  },
}))

describe('UseTableAccessibility', () => {
  let proposalStore: MockedObject<ReturnType<typeof useProposalStore>>

  beforeEach(() => {
    vi.clearAllMocks()
    setActivePinia(createTestingPinia())
    proposalStore = vi.mocked(useProposalStore())
    proposalStore.counts = proposalCountMock
  })

  describe('handleFocus', () => {
    const testcases = [
      {
        classListValue: ['el-table__body'],
        expectedCalls: 0,
      },
      {
        classListValue: ['el-tag'],
        expectedCalls: 0,
      },
      {
        classListValue: [],
        expectedCalls: 1,
      },
    ]
    test.each(testcases)('should move the focus to the table on entering a table', async (testcase) => {
      const eventMock = {
        relatedTarget: {
          classList: testcase.classListValue,
        },
        target: {
          closest: vi.fn().mockImplementation(() => {}),
        },
      }

      const { handleFocus } = useTableAccessibility()

      handleFocus(eventMock as any as FocusEvent)

      expect(keyboardNavigation.setFocus).toBeCalledTimes(testcase.expectedCalls)
    })
  })

  describe('focusTable', () => {
    it('should focus the whole table', () => {
      const eventMock = {
        target: {
          closest: vi.fn().mockImplementation(() => {}),
        },
      }

      const { focusTable } = useTableAccessibility()

      focusTable(eventMock as any as Event)
      expect(keyboardNavigation.setFocus).toBeCalledTimes(1)
    })
  })

  describe('focusHeaderRow', () => {
    it('should focus the header row of the table', () => {
      const eventMock = {
        target: {
          closest: vi.fn().mockImplementation(() => {
            return {
              querySelector: vi.fn().mockImplementation(() => {
                return {
                  closest: vi.fn().mockImplementation(() => {}),
                }
              }),
            }
          }),
        },
        preventDefault: vi.fn(),
      }

      const { focusHeaderRow } = useTableAccessibility()

      focusHeaderRow(eventMock as any as Event)
      expect(keyboardNavigation.setFocus).toBeCalledTimes(1)
      expect(eventMock.preventDefault).toBeCalledTimes(1)
    })
  })

  describe('focusTableBody', () => {
    it('should focus the body of the table and add an event listener to the tables rows', async () => {
      const addListenerMock = vi.fn().mockImplementation(() => {})

      const eventMock = {
        target: {
          closest: vi.fn().mockImplementation(() => {
            return {
              getElementsByClassName: vi.fn().mockImplementation(() => {
                return [
                  {
                    addEventListener: addListenerMock,
                  },
                ]
              }),
            }
          }),
        },
      }

      const { focusTableBody } = useTableAccessibility()

      focusTableBody(eventMock as any as Event)

      expect(addListenerMock).toBeCalledTimes(1)
      expect(keyboardNavigation.setFocus).toBeCalledTimes(1)

      focusTableBody(eventMock as any as Event)

      expect(addListenerMock).toBeCalledTimes(1)
      expect(keyboardNavigation.setFocus).toBeCalledTimes(2)
    })
  })

  describe('handleTableBodyKeydown', () => {
    const testcases = [
      {
        shiftKeyValue: true,
        eventKeyValue: 'Tab',
        isHeaderRowFocusCalled: true,
        isNextFocusCalled: false,
        isFirstRowFocusCalled: false,
      },
      {
        shiftKeyValue: false,
        eventKeyValue: 'Tab',
        isHeaderRowFocusCalled: false,
        isNextFocusCalled: true,
        isFirstRowFocusCalled: false,
      },
      {
        shiftKeyValue: false,
        eventKeyValue: 'Space',
        isHeaderRowFocusCalled: false,
        isNextFocusCalled: false,
        isFirstRowFocusCalled: true,
      },
      {
        shiftKeyValue: false,
        eventKeyValue: '',
        isHeaderRowFocusCalled: false,
        isNextFocusCalled: false,
        isFirstRowFocusCalled: false,
      },
    ]
    test.each(testcases)('should move the focus to the table on entering a table', async (testcase) => {
      const eventMock = {
        shiftKey: testcase.shiftKeyValue,
        key: testcase.eventKeyValue,
        target: {
          closest: vi.fn().mockImplementation(() => {
            return {
              querySelector: vi.fn().mockImplementation(() => {
                return {
                  closest: vi.fn().mockImplementation(() => {}),
                  firstElementChild: {
                    querySelector: vi.fn().mockImplementation(() => {}),
                  },
                }
              }),
            }
          }),
        },
        preventDefault: vi.fn(),
      }

      const headerRow = eventMock.target.closest().querySelector().closest()
      const firstRow = eventMock.target.closest().querySelector().firstElementChild.querySelector()

      const { handleTableBodyKeydown } = useTableAccessibility()

      handleTableBodyKeydown(eventMock as any as KeyboardEvent)

      if (testcase.isHeaderRowFocusCalled) {
        expect(keyboardNavigation.setFocus).toBeCalledWith(headerRow)
        expect(eventMock.preventDefault).toBeCalledTimes(1)
      } else if (testcase.isNextFocusCalled) {
        expect(keyboardNavigation.focusNextElement).toBeCalledTimes(1)
      } else if (testcase.isFirstRowFocusCalled) {
        expect(keyboardNavigation.setFocus).toBeCalledWith(firstRow)
      } else {
        expect(keyboardNavigation.setFocus).toBeCalledTimes(0)
        expect(eventMock.preventDefault).toBeCalledTimes(0)
        expect(keyboardNavigation.focusNextElement).toBeCalledTimes(0)
      }
    })
  })

  describe('removeTableBodyListeners', () => {
    const removeListenerMock = vi.fn().mockImplementation(() => {})

    const testcases = [
      {
        tBody: { removeEventListener: removeListenerMock },
      },
      {
        tBody: undefined,
      },
    ]
    test.each(testcases)(
      'should remove the event listener (`keydown`, handleTableBodyKeydown) from the table body',
      (testcase) => {
        const addListenerMock = vi.fn().mockImplementation(() => {})

        const eventMock = {
          target: {
            closest: vi.fn().mockImplementation(() => {
              return {
                getElementsByClassName: vi.fn().mockImplementation(() => {
                  return [
                    {
                      addEventListener: addListenerMock,
                    },
                  ]
                }),
              }
            }),
            getElementsByClassName: vi.fn().mockImplementation(() => {
              return [testcase.tBody]
            }),
          },
        }

        const { removeTableBodyListeners, focusTableBody } = useTableAccessibility()

        removeTableBodyListeners(eventMock as any as Event)

        expect(removeListenerMock).toBeCalledTimes(0)

        focusTableBody(eventMock as any as Event)
        removeTableBodyListeners(eventMock as any as Event)

        if (testcase.tBody) {
          expect(removeListenerMock).toBeCalledTimes(1)
        } else {
          expect(removeListenerMock).toBeCalledTimes(0)
        }
      },
    )
  })

  describe('handleTableTab', () => {
    const testcases = [
      {
        classList: ['fdpg-table'],
        nodeName: '',
        isFocusNextCalled: true,
        isBodyFocusCalled: false,
      },
      {
        classList: ['el-tag'],
        nodeName: '',
        isFocusNextCalled: true,
        isBodyFocusCalled: false,
      },
      {
        classList: ['colummHeader'],
        nodeName: '',
        isFocusNextCalled: false,
        isBodyFocusCalled: true,
      },
      {
        classList: [],
        nodeName: 'tr',
        isFocusNextCalled: false,
        isBodyFocusCalled: true,
      },
    ]
    test.each(testcases)(
      'should move focus to the next element which should be the body if the target is the tables header',
      (testcase) => {
        const addListenerMock = vi.fn().mockImplementation(() => {})

        const eventMock = {
          target: {
            classList: testcase.classList,
            nodeName: {
              toLowerCase: vi.fn().mockImplementation(() => {
                return 'tr'
              }),
            },
            closest: vi.fn().mockImplementation(() => {
              return {
                getElementsByClassName: vi.fn().mockImplementation(() => {
                  return [
                    {
                      addEventListener: addListenerMock,
                    },
                  ]
                }),
                querySelector: vi.fn().mockImplementation(() => {
                  return {
                    closest: vi.fn().mockImplementation(() => {}),
                  }
                }),
              }
            }),
          },
        }

        const tableBody = eventMock.target.closest().getElementsByClassName()[0]

        const { handleTableTab, focusTableBody } = useTableAccessibility()

        handleTableTab(eventMock as any as Event)

        if (testcase.isFocusNextCalled) {
          expect(keyboardNavigation.focusNextElement).toBeCalledTimes(1)
        } else if (testcase.isBodyFocusCalled) {
          expect(keyboardNavigation.setFocus).toBeCalledWith(tableBody)
          expect(addListenerMock).toBeCalledTimes(1)
          expect(keyboardNavigation.setFocus).toBeCalledTimes(1)

          focusTableBody(eventMock as any as Event)

          expect(addListenerMock).toBeCalledTimes(1)
          expect(keyboardNavigation.setFocus).toBeCalledTimes(2)
        } else {
          expect(keyboardNavigation.focusNextElement).toBeCalledTimes(0)
          expect(keyboardNavigation.setFocus).toBeCalledTimes(0)
          expect(addListenerMock).toBeCalledTimes(0)
        }
      },
    )
  })

  describe('handleShiftTab', () => {
    const testcases = [
      {
        classList: ['el-table__body'],
        isHeaderRowFocusCalled: true,
        isBodyFocusCalled: false,
        isPreviousFocusCalled: false,
      },
      {
        classList: ['el-tag'],
        isHeaderRowFocusCalled: false,
        isBodyFocusCalled: true,
        isPreviousFocusCalled: false,
      },
      {
        classList: [],
        isHeaderRowFocusCalled: false,
        isBodyFocusCalled: false,
        isPreviousFocusCalled: true,
      },
    ]
    test.each(testcases)('should move the focus backwards to the previous focusable element', (testcase) => {
      const addListenerMock = vi.fn().mockImplementation(() => {})

      const eventMock = {
        target: {
          classList: testcase.classList,
          closest: vi.fn().mockImplementation(() => {
            return {
              querySelector: vi.fn().mockImplementation(() => {
                return {
                  closest: vi.fn().mockImplementation(() => {}),
                }
              }),
              getElementsByClassName: vi.fn().mockImplementation(() => {
                return [
                  {
                    addEventListener: addListenerMock,
                  },
                ]
              }),
            }
          }),
        },
        preventDefault: vi.fn(),
      }

      const appMock = {
        getElementById: vi.fn().mockImplementation(() => {
          return {}
        }),
      } as any as HTMLElement

      const headerRow = eventMock.target.closest().querySelector().closest()
      const tableBody = eventMock.target.closest().getElementsByClassName()[0]

      vi.spyOn(document, 'getElementById').mockImplementationOnce(() => appMock as any as HTMLElement)

      const { handleShiftTab, focusTableBody } = useTableAccessibility()

      handleShiftTab(eventMock as any as Event)

      if (testcase.isHeaderRowFocusCalled) {
        expect(keyboardNavigation.setFocus).toBeCalledWith(headerRow)
        expect(eventMock.preventDefault).toBeCalledTimes(1)
      } else if (testcase.isBodyFocusCalled) {
        expect(keyboardNavigation.setFocus).toBeCalledWith(tableBody)
        expect(addListenerMock).toBeCalledTimes(1)
        expect(keyboardNavigation.setFocus).toBeCalled()

        focusTableBody(eventMock as any as Event)

        expect(addListenerMock).toBeCalledTimes(1)
        expect(keyboardNavigation.setFocus).toBeCalledTimes(2)
      } else if (testcase.isPreviousFocusCalled) {
        expect(keyboardNavigation.focusPreviousElement).toBeCalledWith(eventMock, appMock)
      } else {
        expect(keyboardNavigation.setFocus).toBeCalledWith(0)
        expect(keyboardNavigation.focusPreviousElement).toBeCalledTimes(0)
      }
    })
  })

  describe('handleTableSpace', () => {
    const testcases = [
      {
        classList: ['fdpg-table'],
        nodeName: '',
        isHeaderRowFocusCalled: true,
        isFirstRowFocusCalled: false,
        isFirstColumnHeaderFocusCalled: false,
      },
      {
        classList: ['el-table__body'],
        nodeName: '',
        isHeaderRowFocusCalled: false,
        isFirstRowFocusCalled: true,
        isFirstColumnHeaderFocusCalled: false,
      },
      {
        classList: [],
        nodeName: 'tr',
        isHeaderRowFocusCalled: false,
        isFirstRowFocusCalled: false,
        isFirstColumnHeaderFocusCalled: true,
      },
      {
        classList: [],
        nodeName: '',
        isHeaderRowFocusCalled: false,
        isFirstRowFocusCalled: false,
        isFirstColumnHeaderFocusCalled: false,
      },
    ]
    test.each(testcases)('should move the focus one level lower in the table hierarchy', (testcase) => {
      const eventMock = {
        target: {
          classList: testcase.classList,
          nodeName: {
            toLowerCase: vi.fn().mockImplementation(() => {
              return 'tr'
            }),
          },
          closest: vi.fn().mockImplementation(() => {
            return {
              querySelector: vi.fn().mockImplementation(() => {
                return {
                  closest: vi.fn().mockImplementation(() => {}),
                  firstElementChild: {
                    querySelector: vi.fn().mockImplementation(() => {}),
                  },
                }
              }),
              firstElementChild: {
                getElementsByClassName: vi.fn().mockImplementation(() => [{}]),
              },
            }
          }),
        },
        preventDefault: vi.fn(),
      }

      const headerRow = eventMock.target.closest().querySelector().closest()
      const firstRow = eventMock.target.closest().querySelector().firstElementChild.querySelector()
      const firstColumnHeader = eventMock.target.closest().firstElementChild.getElementsByClassName()[0]

      const { handleTableSpace } = useTableAccessibility()

      handleTableSpace(eventMock as any as Event)

      if (testcase.isHeaderRowFocusCalled) {
        expect(keyboardNavigation.setFocus).toBeCalledWith(headerRow)
        expect(eventMock.preventDefault).toBeCalledTimes(1)
      } else if (testcase.isFirstRowFocusCalled) {
        expect(keyboardNavigation.setFocus).toBeCalledWith(firstRow)
      } else {
        expect(keyboardNavigation.setFocus).toBeCalledWith(firstColumnHeader)
      }
    })
  })

  describe('handleTableEsc', () => {
    const testcases = [
      {
        classList: ['columnHeader'],
        nodeName: '',
        isHeaderRowFocusCalled: true,
        isBodyFocusCalled: false,
        isTableFocusCalled: false,
      },
      {
        classList: ['el-tag'],
        nodeName: '',
        isHeaderRowFocusCalled: false,
        isBodyFocusCalled: true,
        isTableFocusCalled: false,
      },
      {
        classList: ['el-table__body'],
        nodeName: '',
        isHeaderRowFocusCalled: false,
        isBodyFocusCalled: false,
        isTableFocusCalled: true,
      },
      {
        classList: [],
        nodeName: 'tr',
        isHeaderRowFocusCalled: false,
        isBodyFocusCalled: false,
        isTableFocusCalled: true,
      },
      {
        classList: [],
        nodeName: '',
        isHeaderRowFocusCalled: false,
        isBodyFocusCalled: false,
        isTableFocusCalled: false,
      },
    ]
    test.each(testcases)('should move the focus one level higher in the table hierarchy (testcase: %s)', (testcase) => {
      const addListenerMock = vi.fn().mockImplementation(() => {})

      const eventMock = {
        target: {
          classList: testcase.classList,
          nodeName: {
            toLowerCase: vi.fn().mockImplementation(() => {
              return testcase.nodeName
            }),
          },
          closest: vi.fn().mockImplementation(() => {
            return {
              querySelector: vi.fn().mockImplementation(() => {
                return {
                  closest: vi.fn().mockImplementation(() => {}),
                }
              }),
              getElementsByClassName: vi.fn().mockImplementation(() => {
                return [
                  {
                    addEventListener: addListenerMock,
                  },
                ]
              }),
            }
          }),
        },
        preventDefault: vi.fn(),
      }

      const headerRow = eventMock.target.closest().querySelector().closest()
      const tableBody = eventMock.target.closest().getElementsByClassName()[0]

      const { handleTableEsc, focusTableBody } = useTableAccessibility()

      handleTableEsc(eventMock as any as Event)

      if (testcase.isHeaderRowFocusCalled) {
        expect(keyboardNavigation.setFocus).toBeCalledWith(headerRow)
      } else if (testcase.isBodyFocusCalled) {
        expect(keyboardNavigation.setFocus).toBeCalledWith(tableBody)
        expect(addListenerMock).toBeCalledTimes(1)
        expect(keyboardNavigation.setFocus).toBeCalled()

        //after the second call addEventListenerMock has still been called only once because the tBodyListenerExists flag
        //has been set to true after the first time
        focusTableBody(eventMock as any as Event)

        expect(addListenerMock).toBeCalledTimes(1)
        expect(keyboardNavigation.setFocus).toBeCalledTimes(2)
      } else if (testcase.isTableFocusCalled) {
        expect(keyboardNavigation.setFocus).toBeCalledTimes(1)
      } else {
        expect(eventMock.preventDefault).toBeCalledTimes(1)
      }
    })
  })

  describe('focusNextColumnHeader', () => {
    test.each([true, false])(
      'should focus the next columnHeader of the table and skip to the first when we reached the last one (isSameNode: %s)',
      (isSameNode) => {
        const eventMock = {
          target: {
            isSameNode: vi.fn().mockReturnValue(isSameNode),
            closest: vi.fn().mockImplementation(() => {
              return {
                firstElementChild: {
                  getElementsByClassName: vi.fn().mockImplementation(() => [{}]),
                },
                lastElementChild: {
                  getElementsByClassName: vi.fn().mockImplementation(() => [{}]),
                },
                nextElementSibling: {
                  getElementsByClassName: vi.fn().mockImplementation(() => [{}]),
                },
              }
            }),
          },
        }

        const firstHeader = eventMock.target.closest().firstElementChild.getElementsByClassName()[0]
        const nextHeader = eventMock.target.closest().nextElementSibling.getElementsByClassName()[0]

        const { focusNextColumnHeader } = useTableAccessibility()

        focusNextColumnHeader(eventMock as any as Event)

        if (isSameNode) {
          expect(keyboardNavigation.setFocus).toBeCalledWith(firstHeader)
          expect(keyboardNavigation.setFocus).toBeCalledTimes(1)
        } else {
          expect(keyboardNavigation.setFocus).toBeCalledWith(nextHeader)
          expect(keyboardNavigation.setFocus).toBeCalledTimes(1)
        }
      },
    )
  })

  describe('focusPreviousColumnHeader', () => {
    test.each([true, false])(
      'should focus the previous columnHeader of the table and skip to the last when we reached the first one (isSameNode: %s)',
      (isSameNode) => {
        const eventMock = {
          target: {
            isSameNode: vi.fn().mockReturnValue(isSameNode),
            closest: vi.fn().mockImplementation(() => {
              return {
                lastElementChild: {
                  getElementsByClassName: vi.fn().mockImplementation(() => [{}]),
                },
                previousElementSibling: {
                  getElementsByClassName: vi.fn().mockImplementation(() => [{}]),
                },
              }
            }),
          },
        }

        const lastHeader = eventMock.target.closest().lastElementChild.getElementsByClassName()[0]
        const previousHeader = eventMock.target.closest().previousElementSibling.getElementsByClassName()[0]

        const { focusPreviousColumnHeader } = useTableAccessibility()

        focusPreviousColumnHeader(eventMock as any as Event)

        if (isSameNode) {
          expect(keyboardNavigation.setFocus).toBeCalledWith(lastHeader)
          expect(keyboardNavigation.setFocus).toBeCalledTimes(1)
        } else {
          expect(keyboardNavigation.setFocus).toBeCalledWith(previousHeader)
          expect(keyboardNavigation.setFocus).toBeCalledTimes(1)
        }
      },
    )
  })

  describe('focusPreviousRow', () => {
    const testcases = [
      {
        classListValue: ['el-table__row'],
        rowIndexValue: 0,
        expectedCalls: 0,
      },
      {
        classListValue: ['el-table__row'],
        rowIndexValue: 1,
        expectedCalls: 1,
      },
      {
        classListValue: ['el-tag'],
        rowIndexValue: 0,
        expectedCalls: 0,
      },
      {
        classListValue: ['el-tag'],
        rowIndexValue: 1,
        expectedCalls: 1,
      },
      {
        classListValue: [],
        rowIndexValue: 0,
        expectedCalls: 0,
      },
      {
        classListValue: [],
        rowIndexValue: 1,
        expectedCalls: 0,
      },
    ]
    test.each(testcases)('should focus the previous row of the table', (testcase) => {
      const tableMock = document.createElement('table') as any
      const bodyMock = document.createElement('tbody') as any
      const rowMock = document.createElement('tr') as any
      const rowMock2 = document.createElement('tr') as any

      bodyMock.appendChild(rowMock)
      bodyMock.appendChild(rowMock2)

      tableMock.appendChild(bodyMock)

      const eventMock = {
        target: {
          classList: testcase.classListValue,
          closest: vi.fn().mockImplementation(() => {
            return bodyMock
          }),
        },
      }

      //current row is the first row -> previous row doesnt exist
      if (testcase.rowIndexValue === 0) {
        vi.spyOn(document.activeElement as HTMLElement, 'closest').mockImplementation(
          () => rowMock as any as HTMLTableRowElement,
        )
      } else if (testcase.rowIndexValue === 1) {
        //current row is the second row -> previous row exists
        vi.spyOn(document.activeElement as HTMLElement, 'closest').mockImplementation(
          () => rowMock2 as any as HTMLTableRowElement,
        )
      }

      const { focusPreviousRow } = useTableAccessibility()

      focusPreviousRow(eventMock as any as Event)
      expect(keyboardNavigation.setFocus).toBeCalledTimes(testcase.expectedCalls)
    })
  })

  describe('focusNextRow', () => {
    const testcases = [
      {
        classListValue: ['el-table__row'],
        expectedCalls: 1,
      },
      {
        classListValue: ['el-tag'],
        expectedCalls: 1,
      },
      {
        classListValue: [],
        expectedCalls: 0,
      },
    ]
    test.each(testcases)('should focus the next row of the table', (testcase) => {
      const tableMock = document.createElement('table') as any
      const bodyMock = document.createElement('tbody') as any
      const rowMock = document.createElement('tr') as any
      const rowMock2 = document.createElement('tr') as any
      const tag = document.createElement('div') as any
      tag.classList.add('tag')
      rowMock.appendChild(tag)
      rowMock2.appendChild(tag)

      bodyMock.appendChild(rowMock)
      bodyMock.appendChild(rowMock2)
      tableMock.appendChild(bodyMock)

      const eventMock = {
        target: {
          classList: testcase.classListValue,
          closest: vi.fn().mockImplementation(() => {
            return bodyMock
          }),
        },
      }

      vi.spyOn(document.activeElement as HTMLElement, 'closest').mockImplementation(
        () => rowMock as any as HTMLTableRowElement,
      )

      const { focusNextRow } = useTableAccessibility()

      focusNextRow(eventMock as any as Event)
      expect(keyboardNavigation.setFocus).toBeCalledTimes(testcase.expectedCalls)
    })
  })

  describe('toggleSort', () => {
    it('should toggle the sorting direction', () => {
      const clickMock = vi.fn().mockImplementation(() => {})

      const eventMock = {
        target: {
          closest: vi.fn().mockImplementation(() => {
            return {
              click: clickMock,
            }
          }),
        },
      }

      const { toggleSort } = useTableAccessibility()

      toggleSort(eventMock as any as Event)
      expect(clickMock).toBeCalledTimes(1)
    })
  })
})
