export interface IDataSource {
  _id: string
  externalIdentifier: string
  origin: DataSourceOrigin
  titles: IDataSourceLanguage[]
  descriptions: IDataSourceLanguage[]
  collection: string
  classification: string
  status: DataSourceStatus
  active: boolean
  approvalDate?: Date
  createdAt: Date
  updatedAt: Date
}

export interface IDataSourceLanguage {
  language: Language
  value: string
}

export enum Language {
  EN = 'en',
  DE = 'de',
}

export enum DataSourceStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
}

export enum DataSourceOrigin {
  NFDI4HEALTH = 'NFDI4HEALTH',
}

export enum DataSourceSortField {
  TITLE = 'TITLE',
  EXTERNAL_IDENTIFIER = 'EXTERNAL_IDENTIFIER',
  CREATED_AT = 'CREATED_AT',
  UPDATED_AT = 'UPDATED_AT',
}

export enum SortOrder {
  ASC = 'ASC',
  DESC = 'DESC',
}

export interface IDataSourcePaginatedResult {
  data: IDataSource[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface IDataSourceSearchParams {
  query?: string
  status?: DataSourceStatus
  page?: number
  pageSize?: number
  sortBy?: DataSourceSortField
  sortOrder?: SortOrder
  language?: string
}

export interface ISyncStatus {
  isRunning: boolean
  startedAt: Date | null
  lastCompletedAt: Date | null
  lastStats: ISyncStats | null
}

export interface ISyncStats {
  fetched: number
  created: number
  updated: number
  skipped: number
  errors: number
}

export interface IUpdateStatusPayload {
  status: DataSourceStatus
}

export interface IUpdateActivePayload {
  active: boolean
}

/**
 * Gets title in preferred language with fallback logic:
 * 1. Preferred language (current locale)
 * 2. English (EN)
 * 3. First available title
 */
export function getTitleByLanguage(dataSource: IDataSource, preferredLanguage: string): string {
  // Try preferred language (no need to uppercase since backend uses lowercase)
  const preferredTitle = dataSource.titles.find((t) => t.language === preferredLanguage)
  if (preferredTitle) return preferredTitle.value

  // Fallback to English
  const enTitle = dataSource.titles.find((t) => t.language === Language.EN)
  if (enTitle) return enTitle.value

  // Fallback to first available
  return dataSource.titles[0]?.value || '-'
}
