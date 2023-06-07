import { nextTick } from 'vue'

const setFocus = (el: HTMLElement): void => {
  if (el && !isFocusable(el)) {
    el?.setAttribute('tabindex', '0')
  }
  el?.focus()
}

const getFocusableChildren = (el: HTMLElement): Array<HTMLElement> => {
  const focusableElements = ['button', '[href]', 'input', 'select', 'textarea', '[tabindex]:not([tabindex="-1"])']
  const querySelector = focusableElements.join(', ')
  return Array.from(el?.querySelectorAll(querySelector))
}

const isFocusable = (el: HTMLElement): boolean => {
  const parent = el.parentElement as HTMLElement
  const focusableSiblings = getFocusableChildren(parent)
  return focusableSiblings.includes(el)
}

const focusFirstElement = (): void => {
  const app = document.getElementById('app') as HTMLElement
  const firstEl = getFocusableChildren(app)[0] as HTMLElement
  firstEl?.focus()
}

const focusPreviousElement = (event: Event, parent: HTMLElement): void => {
  const focusable = getFocusableChildren(parent) as Array<HTMLElement>
  const target = event.target as HTMLElement
  const elemIdx = Array.from(focusable).findIndex((node) => node.isSameNode(target))
  if (elemIdx > 0) {
    focusable[elemIdx - 1].focus()
    event.preventDefault()
  }
}

const focusNextElement = (event: Event, parent: HTMLElement, el?: HTMLElement): void => {
  const target = el ? el : (event.target as HTMLElement)
  const focusable = getFocusableChildren(parent) as Array<HTMLElement>
  const focusableSiblings = focusable.filter((el) => !target.contains(el) || el.isSameNode(target))
  const elemIdx = Array.from(focusableSiblings).findIndex((node) => node.isSameNode(target))
  const nextElement = focusableSiblings[elemIdx + 1]
  if (elemIdx < focusable.length && nextElement) {
    nextElement.focus()
    event.preventDefault()
  } else if (!nextElement) {
    focusFirstElement()
  }
}

const isFirstFocusableElementOf = (target: HTMLElement, parentClass: string): boolean => {
  const parent = target.closest('.' + parentClass) as HTMLElement
  return target.isSameNode(getFocusableChildren(parent)[0])
}

const focusNewElement = (parentId: string): void => {
  nextTick(() => {
    const scrollArea = document.getElementById(parentId) as HTMLElement
    const idx = scrollArea.getElementsByClassName('scrollFocus').length - 1

    const scrollEl = scrollArea?.getElementsByClassName('scrollAnker')[idx]
    scrollEl?.scrollIntoView({ behavior: 'smooth' })

    const focusSection = scrollArea?.getElementsByClassName('scrollFocus')[idx]
    const focusEl = focusSection?.getElementsByTagName('input')[0]
    focusEl?.focus({ preventScroll: true })
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
