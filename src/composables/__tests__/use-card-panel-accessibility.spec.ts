import { proposalCountMock } from '@/mocks/proposal-counts.mock'
import { useProposalStore } from '@/stores/proposal/proposal.store'
import { createTestingPinia } from '@pinia/testing'
import { setActivePinia } from 'pinia'
import { keyboardNavigation } from '@/utils/keyboard-nav.util'
import useCardPanelAccessibility from '../use-card-panel-accessibility'
import type { MockedObject } from 'vitest'

vi.mock('@/utils/keyboard-nav.util', () => ({
  keyboardNavigation: {
    setFocus: vi.fn().mockImplementation(() => {}),
    focusNextElement: vi.fn().mockImplementation(() => {}),
    focusPreviousElement: vi.fn().mockImplementation(() => {}),
  },
}))

describe('UseCardPanelAccessibility', () => {
  let proposalStore: MockedObject<ReturnType<typeof useProposalStore>>

  beforeEach(() => {
    vi.clearAllMocks()
    setActivePinia(createTestingPinia())
    proposalStore = vi.mocked(useProposalStore())
    proposalStore.counts = proposalCountMock
  })

  describe('moveFocusToPanelRow', () => {
    const testcases = [
      {
        value: true,
        expectedCalls: 0,
      },
      {
        value: false,
        expectedCalls: 1,
      },
    ]
    test.each(testcases)('should move the focus to the panels row on entering a panel', async (testcase) => {
      const { handleFocus } = useCardPanelAccessibility()

      const focusMock = vi.fn().mockImplementation(() => {})
      const eventMock = {
        target: {
          closest: vi.fn().mockImplementation(() => {
            return {
              isSameNode: vi.fn().mockReturnValue(testcase.value),
              querySelector: vi.fn().mockImplementation(() => {
                return {
                  focus: focusMock,
                } as any as HTMLElement
              }),
            }
          }),
        },
        relatedTarget: {
          closest: vi.fn(),
        },
        preventDefault: vi.fn(),
      }

      await handleFocus(eventMock as any as FocusEvent)

      expect(focusMock).toBeCalledTimes(testcase.expectedCalls)
      expect(eventMock.preventDefault).toBeCalledTimes(1)
    })
  })

  describe('focusNextCard', () => {
    const testcases = [
      {
        value: true,
        expectedCalls: 1,
      },
      {
        value: false,
        expectedCalls: 1,
      },
    ]

    test.each(testcases)('should focus the next fdpg-card', (testcase) => {
      const { focusNextCard } = useCardPanelAccessibility()

      const focusMock = vi.fn().mockImplementation(() => {})

      const eventMock = {
        target: {
          classList: ['fdpg-card'],
          isSameNode: vi.fn().mockReturnValue(testcase.value),
          closest: vi.fn().mockImplementation(() => {
            return {
              nextElementSibling: {
                getElementsByClassName: vi.fn().mockImplementation(() => {
                  return [
                    {
                      focus: focusMock,
                    },
                  ]
                }),
              },
              getElementsByClassName: vi.fn().mockImplementation(() => {
                return [
                  {
                    focus: focusMock,
                  },
                ]
              }),
            } as any as HTMLElement
          }),
        },
      }

      focusNextCard(eventMock as any as Event)

      expect(focusMock).toBeCalledTimes(testcase.expectedCalls)
    })
  })

  describe('focusPreviousCard', () => {
    const testcases = [
      {
        classListValue: ['fdpg-card'],
        expected: 1,
        isSameNodeValue: true,
        expectedCalls: 1,
      },
      {
        classListValue: ['fdpg-card'],
        expected: 1,
        isSameNodeValue: false,
        expectedCalls: 1,
      },
      {
        classListValue: [],
        expected: 0,
        isSameNodeValue: true,
        expectedCalls: 0,
      },
      {
        classListValue: [],
        expected: 0,
        isSameNodeValue: false,
        expectedCalls: 0,
      },
    ]

    test.each(testcases)('should focus the previous fdpg-card', (testcase) => {
      const { focusPreviousCard } = useCardPanelAccessibility()

      const focusMock = vi.fn().mockImplementation(() => {})

      const eventMock = {
        target: {
          classList: testcase.classListValue,
          isSameNode: vi.fn().mockReturnValue(testcase.isSameNodeValue),
          closest: vi.fn().mockImplementation(() => {
            return {
              getElementsByClassName: vi.fn().mockImplementation(() => {
                return [
                  {
                    focus: focusMock,
                  },
                ]
              }),
              lastElementChild: {
                getElementsByClassName: vi.fn().mockImplementation(() => {
                  return [
                    {
                      focus: focusMock,
                    },
                  ]
                }),
              },
              previousElementSibling: {
                getElementsByClassName: vi.fn().mockImplementation(() => {
                  return [
                    {
                      focus: focusMock,
                    },
                  ]
                }),
              },
            } as any as HTMLElement
          }),
        },
      }

      focusPreviousCard(eventMock as any as Event)

      expect(focusMock).toBeCalledTimes(testcase.expectedCalls)
    })
  })

  describe('handleCardRowSpace', () => {
    const testcases = [
      {
        columns: [],
        expectToBeCalled: false,
      },
      {
        columns: [{}],
        expectToBeCalled: true,
      },
    ]
    test.each(testcases)('should focus the first card of a panel', async (testcase) => {
      const { handleCardRowSpace } = useCardPanelAccessibility()

      const focusMock = vi.fn().mockImplementation(() => {})

      const targetMock = {
        getElementsByClassName: vi.fn().mockImplementation(() => {
          return testcase.columns
        }),
      }

      const eventMock = {
        target: {
          closest: vi.fn().mockImplementation(() => {
            return {
              getElementsByClassName: vi.fn().mockImplementation(() => {
                return [
                  {
                    focus: focusMock,
                  },
                ]
              }),
            }
          }),
        },
      }

      handleCardRowSpace(targetMock as any as HTMLElement, eventMock as any as Event)

      if (testcase.expectToBeCalled) {
        expect(focusMock).toBeCalledTimes(1)
      } else {
        expect(focusMock).toBeCalledTimes(0)
      }
    })
  })

  describe('handleCardRowEsc', () => {
    const testcases = [
      {
        value: [],
        expectedCalls: 0,
      },
      {
        value: ['fdpg-card'],
        expectedCalls: 1,
      },
    ]
    test.each(testcases)('should focus the cards parent row', async (testcase) => {
      const { handleCardRowEsc } = useCardPanelAccessibility()

      const focusMock = vi.fn().mockImplementation(() => {})

      const targetMock = {
        classList: testcase.value,
        closest: vi.fn().mockImplementation(() => {
          return {
            focus: focusMock,
          }
        }),
      }

      handleCardRowEsc(targetMock as any as HTMLElement)

      expect(focusMock).toBeCalledTimes(testcase.expectedCalls)
    })
  })

  describe('handleShiftTab', () => {
    const testcases = [
      {
        classListValue: [],
        contains: false,
        isNativeFocusCalled: false,
      },
      {
        classListValue: ['fdpg-card'],
        contains: false,
        isNativeFocusCalled: true,
      },
      {
        classListValue: [],
        contains: true,
        isNativeFocusCalled: true,
      },
    ]
    test.each(testcases)('should focus the cards parent row', async (testcase) => {
      const { handleShiftTab } = useCardPanelAccessibility()

      const focusMock = vi.fn().mockImplementation(() => {})

      const eventMock = {
        target: {
          classList: testcase.classListValue,
          closest: vi.fn().mockImplementation(() => {
            return {
              contains: vi.fn().mockImplementation(() => testcase.contains),
              querySelector: vi.fn().mockImplementation(() => {
                return {
                  focus: focusMock,
                }
              }),
            }
          }),
        },
      }

      const appMock = {
        getElementById: vi.fn().mockImplementation(() => {}),
      } as any as HTMLElement

      vi.spyOn(document, 'getElementById').mockImplementationOnce(() => appMock as any as HTMLElement)

      handleShiftTab(eventMock as any as Event)

      if (testcase.isNativeFocusCalled) {
        expect(focusMock).toBeCalledTimes(1)
      } else {
        expect(keyboardNavigation.focusPreviousElement).toBeCalledWith(eventMock, appMock)
      }
    })
  })

  describe('handleTab', () => {
    it('should focus the next focusable element', async () => {
      const { handleTab } = useCardPanelAccessibility()
      const panelRowMock = 'panelRowMock'
      const eventMock = {
        target: {
          closest: vi.fn().mockImplementation(() => {
            return {
              querySelector: vi.fn().mockImplementation(() => {
                return panelRowMock
              }),
            }
          }),
        },
        preventDefault: vi.fn(),
      }

      const appMock = {
        getElementById: vi.fn().mockImplementation(() => {}),
      } as any as HTMLElement

      vi.spyOn(document, 'getElementById').mockImplementationOnce(() => appMock as any as HTMLElement)

      handleTab(eventMock as any as Event)

      expect(keyboardNavigation.focusNextElement).toBeCalledWith(eventMock, appMock, panelRowMock)

      expect(eventMock.preventDefault).toBeCalledTimes(1)
    })
  })

  describe('focusCard', () => {
    it('should focus the closest card', () => {
      const { focusCard } = useCardPanelAccessibility()

      const focusMock = vi.fn().mockImplementation(() => {})

      const eventMock = {
        target: {
          closest: vi.fn().mockImplementation(() => {
            return {
              focus: focusMock,
            }
          }),
        },
      }

      focusCard(eventMock as any as Event)
      expect(focusMock).toBeCalledTimes(1)
    })
  })

  describe('focusFirstActionItem', () => {
    it('should focus the first action item', async () => {
      const { focusFirstActionItem } = useCardPanelAccessibility()

      const eventMock = {
        target: {
          closest: vi.fn().mockImplementation(() => {
            return {
              querySelector: vi.fn().mockImplementation(() => {
                return {
                  firstElementChild: {},
                }
              }),
            }
          }),
        },
      }

      focusFirstActionItem(eventMock as any as Event)
      expect(keyboardNavigation.setFocus).toBeCalledTimes(1)
    })
  })

  describe('focusPreviousButton', () => {
    test.each([true, false])('should focus the previous button of the panel (isSameNode: %s)', async (isSameNode) => {
      const eventMock = {
        target: {
          isSameNode: vi.fn().mockReturnValue(isSameNode),
          closest: vi.fn().mockImplementation(() => {
            return {
              querySelector: vi.fn().mockImplementation(() => {
                return {
                  firstElementChild: {},
                }
              }),
              lastElementChild: {},
            }
          }),
          previousElementSibling: {},
        },
      }
      const { focusPreviousButton } = useCardPanelAccessibility()

      focusPreviousButton(eventMock as any as Event)

      const lastActionItem = eventMock.target.closest().lastElementChild
      const previousActionItem = eventMock.target.previousElementSibling

      if (isSameNode) {
        expect(keyboardNavigation.setFocus).toBeCalledWith(lastActionItem)
      } else {
        expect(keyboardNavigation.setFocus).toBeCalledWith(previousActionItem)
      }
    })
  })

  describe('focusNextButton', () => {
    test.each([true, false])('should focus the next button of the panel %s', async (isSameNode) => {
      const eventMock = {
        target: {
          isSameNode: vi.fn().mockReturnValue(isSameNode),
          closest: vi.fn().mockImplementation(() => {
            return {
              querySelector: vi.fn().mockImplementation(() => {
                return {
                  firstElementChild: {},
                }
              }),
              lastElementChild: {},
            }
          }),
          nextElementSibling: {},
        },
      }

      const firstActionItem = eventMock.target.closest().querySelector().firstElementChild
      const nextActionItem = eventMock.target.nextElementSibling

      const { focusNextButton } = useCardPanelAccessibility()
      focusNextButton(eventMock as any as Event)

      if (isSameNode) {
        expect(keyboardNavigation.setFocus).toBeCalledWith(firstActionItem)
      } else {
        expect(keyboardNavigation.setFocus).toBeCalledWith(nextActionItem)
      }
    })
  })
})
