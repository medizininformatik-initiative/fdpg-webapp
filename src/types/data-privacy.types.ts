import type { PlatformIdentifier } from './platform-identifier.enum'
import type { ProposalTypeOfUse } from './proposal.types'

export interface IDataPrivacyConfigBase {
  messages: IDataPrivacyTexts
}

export interface DataPrivacyConfigCreateDto extends IDataPrivacyConfigBase {}

export interface IDataPrivacyConfigGet extends IDataPrivacyConfigBase {
  platform: PlatformIdentifier
  updatedAt: string
  createdAt: string
  _id: string
}

interface IDataPrivacyTexts extends Record<ProposalTypeOfUse, IDataPrivacyTextsContent> {
  [ProposalTypeOfUse.Biosample]: IDataPrivacyTextsContent
  [ProposalTypeOfUse.Centralized]: IDataPrivacyTextsContent
  [ProposalTypeOfUse.Distributed]: IDataPrivacyTextsContent
}

interface IDataPrivacyTextsContent {
  headline: IMessages
  text: IMessages
}

interface IMessages {
  en: string
  de: string
}

export type DataPrivacyTextsContentKeys = {
  [key in keyof IDataPrivacyTextsContent]: string
}

export type DataPrivacyTextSingleLanguage = {
  [key in keyof IDataPrivacyTexts]: DataPrivacyTextsContentKeys
}
