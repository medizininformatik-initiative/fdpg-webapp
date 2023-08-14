import { proposalCountMock } from '@/mocks/proposal-counts.mock'
import { useProposalStore } from '@/stores/proposal/proposal.store'
import { createTestingPinia } from '@pinia/testing'
import { setActivePinia } from 'pinia'
import { keyboardNavigation } from '@/utils/keyboard-nav.util'
import type { MockedObject } from 'vitest'
import { flushPromises } from '@vue/test-utils'

describe('KeyboardNav', () => {
  let proposalStore: MockedObject<ReturnType<typeof useProposalStore>>

  beforeEach(() => {
    vi.clearAllMocks()
    setActivePinia(createTestingPinia())
    proposalStore = vi.mocked(useProposalStore())
    proposalStore.counts = proposalCountMock
  })
  describe('setFocus', () => {
    describe('setFocusOnNatives', () => {
      const testcases = [
        {
          nodeType: 'button',
        },
        {
          nodeType: 'input',
        },
        {
          nodeType: 'select',
        },
        {
          nodeType: 'textarea',
        },
      ]
      test.each(testcases)('should set the focus on the element without calling setAttribute %s', async (testcase) => {
        const parent = document.createElement('div')
        const el = document.createElement(testcase.nodeType)
        parent.appendChild(el)

        const focusMock = vi.spyOn(el, 'focus').mockImplementation(() => {})
        const setAttributeMock = vi.spyOn(el, 'setAttribute').mockImplementation(() => {})

        const { setFocus } = keyboardNavigation

        setFocus(el)

        expect(focusMock).toBeCalledTimes(1)
        expect(setAttributeMock).toBeCalledTimes(0)
      })
    })

    describe('setFocusHref', () => {
      it('should set the focus on the link element without calling setAttribute', async () => {
        const parent = document.createElement('div')
        const link = document.createElement('a')
        link.href = ''
        parent.appendChild(link)

        const focusMock = vi.spyOn(link, 'focus').mockImplementation(() => {})
        const setAttributeMock = vi.spyOn(link, 'setAttribute').mockImplementation(() => {})

        const { setFocus } = keyboardNavigation

        setFocus(link)

        expect(focusMock).toBeCalledTimes(1)
        expect(setAttributeMock).toBeCalledTimes(0)
      })
    })

    describe('setFocusWithTabindex', () => {
      it('should setAttribute tabindex=0 and focus the element', async () => {
        const parent = document.createElement('div')
        const el = document.createElement('div')
        parent.appendChild(el)

        const focusMock = vi.spyOn(el, 'focus').mockImplementation(() => {})
        const setAttributeMock = vi.spyOn(el, 'setAttribute').mockImplementation(() => {})

        const { setFocus } = keyboardNavigation

        setFocus(el)

        expect(focusMock).toBeCalledTimes(1)
        expect(setAttributeMock).toBeCalledWith('tabindex', '0')
      })
    })
  })

  describe('focusNextElement', () => {
    const testcases = [
      {
        isSameNodeAsLastElement: true,
        isChildOfElement: false,
        expectedPreventCalls: 1,
        expectedFocusCalls: 1,
        nextElementExists: true,
      },
      {
        isSameNodeAsLastElement: false,
        isChildOfElement: false,
        expectedPreventCalls: 0,
        expectedFocusCalls: 1,
        nextElementExists: false,
      },
      {
        isSameNodeAsLastElement: true,
        isChildOfElement: true,
        expectedPreventCalls: 0,
        expectedFocusCalls: 1,
        nextElementExists: false,
      },
    ]
    test.each(testcases)('should set the focus the next focusable element', async (testcase) => {
      const elMock = document.createElement('input') as any
      elMock.isSameNode = vi.fn().mockReturnValue(testcase.isSameNodeAsLastElement)
      elMock.focus = vi.fn().mockImplementation(() => {})

      const elMock2 = document.createElement('input') as any
      elMock2.isSameNode = vi.fn().mockReturnValue(!testcase.isSameNodeAsLastElement)
      elMock2.focus = vi.fn().mockImplementation(() => {})

      const eventMock = {
        target: {
          contains: vi.fn().mockReturnValue(testcase.isChildOfElement),
        },
        preventDefault: vi.fn().mockImplementation(() => {}),
      }

      const parentMock = {
        querySelectorAll: vi.fn().mockImplementation(() => {}),
      }

      vi.spyOn(parentMock, 'querySelectorAll').mockImplementationOnce(() => [elMock, elMock2])

      const firstElMock = document.createElement('input') as any
      vi.spyOn(firstElMock, 'focus')

      const appMock = {
        querySelectorAll: vi.fn().mockImplementation(() => {
          return [firstElMock]
        }),
      }

      vi.spyOn(document, 'getElementById').mockImplementation(() => appMock as any as HTMLElement)

      const { focusNextElement } = keyboardNavigation

      focusNextElement(eventMock as any as Event, parentMock as any as HTMLElement)

      if (testcase.nextElementExists) {
        expect(elMock2.focus).toBeCalledTimes(testcase.expectedFocusCalls)
        expect(eventMock?.preventDefault).toBeCalledTimes(testcase.expectedFocusCalls)
      } else {
        expect(firstElMock.focus).toBeCalledTimes(testcase.expectedFocusCalls)
      }
    })
  })

  describe('focusPreviousElement', () => {
    const testcases = [
      {
        isSameNodeAsFirstElement: false,
        expectedPreventCalls: 1,
        expectedFocusCalls: 1,
      },
      {
        isSameNodeAsFirstElement: true,
        expectedPreventCalls: 0,
        expectedFocusCalls: 0,
      },
    ]
    test.each(testcases)('should set the focus the previous focusable element', async (testcase) => {
      const elMock = document.createElement('input') as any
      elMock.isSameNode = vi.fn().mockReturnValue(testcase.isSameNodeAsFirstElement)
      vi.spyOn(elMock, 'focus')

      const elMock2 = document.createElement('input') as any
      elMock2.isSameNode = vi.fn().mockReturnValue(!testcase.isSameNodeAsFirstElement)
      const eventMock = {
        target: {},
        preventDefault: vi.fn().mockImplementation(() => {}),
      }

      const parentMock = {
        querySelectorAll: vi.fn().mockImplementation(() => {}),
      }

      vi.spyOn(parentMock, 'querySelectorAll').mockImplementationOnce(() => [elMock, elMock2])

      const { focusPreviousElement } = keyboardNavigation

      focusPreviousElement(eventMock as any as Event, parentMock as any as HTMLElement)

      expect(elMock.focus).toBeCalledTimes(testcase.expectedFocusCalls)
      expect(eventMock?.preventDefault).toBeCalledTimes(testcase.expectedFocusCalls)
    })
  })

  describe('focusNextElement', () => {
    const testcases = [
      {
        isSameNodeAsLastElement: false,
        elemIdxValue: 0,
        isContainedInCurrentElement: true,
        isNativeFocusCalled: true,
      },
      {
        isSameNodeAsLastElement: true,
        elemIdxValue: 1,
        isContainedInCurrentElement: true,
        isNativeFocusCalled: false,
      },
      {
        isSameNodeAsLastElement: false,
        elemIdxValue: 0,
        isContainedInCurrentElement: false,
        isNativeFocusCalled: false,
      },
    ]
    test.each(testcases)(
      'should set the focus the next focusable element or the first within a scope if the current element is the last of the scope',
      async (testcase) => {
        const elMock = document.createElement('input') as any
        elMock.isSameNode = vi.fn().mockReturnValue(!testcase.isSameNodeAsLastElement)

        const elMock2 = document.createElement('input') as any
        elMock2.isSameNode = vi.fn().mockReturnValue(testcase.isSameNodeAsLastElement)

        vi.spyOn(elMock, 'focus')
        vi.spyOn(elMock2, 'focus')

        const eventMock = {
          target: {
            contains: vi.fn().mockReturnValue(!testcase.isContainedInCurrentElement),
          },
          preventDefault: vi.fn().mockImplementation(() => {}),
        }

        const parentMock = {
          querySelectorAll: vi.fn().mockImplementation(() => {}),
        }

        vi.spyOn(parentMock, 'querySelectorAll').mockImplementation(() => [elMock, elMock2])

        const firstElMock = document.createElement('input') as any
        vi.spyOn(firstElMock, 'focus')

        const appMock = {
          querySelectorAll: vi.fn().mockImplementation(() => {
            return [firstElMock]
          }),
        }

        vi.spyOn(document, 'getElementById').mockImplementation(() => appMock as any as HTMLElement)

        const { focusNextElement } = keyboardNavigation

        focusNextElement(
          eventMock as any as Event,
          parentMock as any as HTMLElement,
          eventMock.target as any as HTMLElement,
        )
        if (testcase.isNativeFocusCalled) {
          expect(elMock2.focus).toBeCalledTimes(1)
          expect(eventMock?.preventDefault).toBeCalledTimes(1)
        } else {
          expect(firstElMock.focus).toBeCalledTimes(1)
        }
      },
    )
  })

  describe('isFirstFocusableElementOf', () => {
    const testcases = [
      {
        isSameNodeAsFirstElement: true,
      },
      {
        isSameNodeAsFirstElement: false,
      },
    ]
    test.each(testcases)(
      'should return true or false depending on whether the current element is the first focusable element of the parent',
      async (testcase) => {
        const parentClass = ''

        const target = {
          closest: vi.fn().mockImplementation(() => {
            return {
              querySelectorAll: vi.fn().mockImplementation(() => {
                return [{}]
              }),
            }
          }),
          isSameNode: vi.fn().mockReturnValue(testcase.isSameNodeAsFirstElement),
        }

        const { isFirstFocusableElementOf } = keyboardNavigation

        const returnValue = isFirstFocusableElementOf(target as any as HTMLElement, parentClass)
        expect(returnValue).toBe(testcase.isSameNodeAsFirstElement)
      },
    )
  })

  describe('focusNewElement', () => {
    it('should set the focus the the newly added element', async () => {
      const scrollIntoViewMock = vi.fn().mockImplementation(() => {})

      const elMock = document.createElement('input') as any
      vi.spyOn(elMock, 'focus')

      const appMock = {
        getElementsByClassName: vi.fn().mockImplementation(() => {
          return [
            {
              scrollIntoView: vi.fn().mockImplementation(() => {}),
              getElementsByTagName: vi.fn().mockImplementation(() => {
                return [elMock]
              }),
            },
            {
              scrollIntoView: scrollIntoViewMock,
              getElementsByTagName: vi.fn().mockImplementation(() => {
                return [elMock]
              }),
            },
          ]
        }),
      }

      vi.spyOn(document, 'getElementById').mockImplementation(() => appMock as any as HTMLElement)
      vi.spyOn(appMock.getElementsByClassName()[1], 'scrollIntoView').mockImplementation(() => {})

      const { focusNewElement } = keyboardNavigation

      focusNewElement('')

      await flushPromises()
      expect(appMock.getElementsByClassName()[1].scrollIntoView).toBeCalledTimes(1)
      expect(elMock.focus).toBeCalledTimes(1)
    })
  })
})
