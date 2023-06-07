import type { PlatformIdentifier } from './platform-identifier.enum'

export interface ITermsConfigBase {
  terms: ITerms[]
  messages: IMessages
}

export interface TermsConfigCreateDto extends ITermsConfigBase {}

export interface ITermsConfigGet extends ITermsConfigBase {
  platform: PlatformIdentifier
  updatedAt: string
  createdAt: string
  _id: string
}

export interface ITerms {
  label: string
  slots: ITermsSlot[]
}

export interface ITermsSlot {
  name: string
  label: string
  link?: string
}

export interface IMessages {
  en: Record<string, string>
  de: Record<string, string>
}
