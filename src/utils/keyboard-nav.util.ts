import { nextTick } from 'vue'

const setFocus = (el?: Element | null): void => {
  if (el instanceof HTMLElement) {
    if (el && !isFocusable(el)) {
      el?.setAttribute('tabindex', '0')
    }
    el.focus()
  }
}

const getFocusableChildren = (parent: Element | null): HTMLElement[] => {
  const focusableElements = ['button', '[href]', 'input', 'select', 'textarea', '[tabindex]:not([tabindex="-1"])']
  const querySelector = focusableElements.join(', ')
  if (parent) {
    return Array.from(parent?.querySelectorAll<HTMLElement>(querySelector))
  } else {
    return []
  }
}

const isFocusable = (el: HTMLElement): boolean => {
  const parent = el.parentElement
  const focusableSiblings = getFocusableChildren(parent)
  if (focusableSiblings?.length > 0) {
    return focusableSiblings?.includes(el)
  } else {
    return false
  }
}

const focusFirstElement = (): void => {
  const app = document.getElementById('app')
  const firstEl = getFocusableChildren(app)[0]
  setFocus(firstEl)
}

const focusPreviousElement = (event: Event, parent: Element | null): void => {
  const focusable = getFocusableChildren(parent)
  const target = event.target as HTMLElement
  const elemIdx = Array.from(focusable).findIndex((node) => node.isSameNode(target))
  if (elemIdx > 0) {
    setFocus(focusable[elemIdx - 1])
    event.preventDefault()
  }
}

const focusNextElement = (event: Event, parent?: Element | null, el?: Element | null): void => {
  const target = el ? el : (event.target as HTMLElement)
  const scope = parent ? parent : document.getElementById('app')
  const focusable = getFocusableChildren(scope)
  const focusableSiblings = focusable.filter((el) => !target.contains(el) || el.isSameNode(target))
  const elemIdx = Array.from(focusableSiblings).findIndex((node) => node.isSameNode(target))
  const nextElement = focusableSiblings[elemIdx + 1]

  if (elemIdx < focusable.length && nextElement) {
    setFocus(nextElement)
    event.preventDefault()
  } else if (!nextElement) {
    focusFirstElement()
  }
}

const isFirstFocusableElementOf = (target: HTMLElement, parentClass: string): boolean => {
  const parent = target.closest('.' + parentClass)
  const isFirstElem = target.isSameNode(getFocusableChildren(parent)[0])
  return isFirstElem
}

const focusNewElement = (parentId: string): void => {
  nextTick(() => {
    const scrollArea = document.getElementById(parentId)
    if (scrollArea) {
      const idx = scrollArea.getElementsByClassName('scrollFocus').length - 1

      const scrollEl = scrollArea?.getElementsByClassName('scrollAnker')[idx]
      scrollEl?.scrollIntoView({ behavior: 'smooth' })

      const focusSection = scrollArea?.getElementsByClassName('scrollFocus')[idx]
      const focusEl = focusSection?.getElementsByTagName('input')[0]
      if (focusEl instanceof HTMLElement) {
        focusEl?.focus({ preventScroll: true })
      }
    }
  })
}

export const keyboardNavigation = {
  setFocus,
  getFocusableChildren,
  isFocusable,
  focusPreviousElement,
  focusNextElement,
  isFirstFocusableElementOf,
  focusNewElement,
}
