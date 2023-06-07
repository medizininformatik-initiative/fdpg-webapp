import type { TranslationSchema } from '@/plugins/i18n'

// Menu Item Types:
export interface IDropdownItemBase {
  label: TranslationSchema
  action: () => void
}

export interface IDropdownBasicItem extends IDropdownItemBase {
  kind: 'basic'
}

export interface IDropdownImgItem extends IDropdownItemBase {
  kind: 'img'
  src: string
}

export interface IDropdownIconItem extends IDropdownItemBase {
  kind: 'icon'
  iconClass: string
}

export type DropdownItem = IDropdownImgItem | IDropdownIconItem | IDropdownBasicItem

// Menu Button Types:
export interface IDropdownButtonTranslatable {
  isTranslatable: true
  label: TranslationSchema
}

export interface IDropdownButtonDefault {
  isTranslatable: false
  label: string
}

export type DropdownBaseType = IDropdownButtonTranslatable | IDropdownButtonDefault

export type IDropdownBasicButton = DropdownBaseType & {
  kind: 'basic'
}

export type IDropdownImgButton = DropdownBaseType & {
  kind: 'img'
  src: string
}

export type IDropdownIconButton = DropdownBaseType & {
  kind: 'icon'
  iconClass: string
}

export type DropdownButton = IDropdownImgButton | IDropdownIconButton | IDropdownBasicButton
