import type { TranslationSchema } from '@/plugins/i18n'
import type { Ref } from 'vue'
import type { WithIdAndIsDone } from '../../types/proposal.types'

export interface IVirtualWrap<T> {
  [key: string]: T
}

interface IBaseDefinition<T> {
  key: keyof T
  isList?: boolean
  hideIfOtherValueIsTruthy?: keyof T
}
interface ILookupDefinition<T, L extends Record<string, Object>> extends IBaseDefinition<T> {
  kind: 'lookup'
  lookupMap: L
  lookupKey: keyof L[keyof L]
}

interface ITranslatableDefinition<T> extends IBaseDefinition<T> {
  kind: 'translatable'
  prefix: string
}

interface IContentDefinition<T> extends IBaseDefinition<T> {
  kind?: 'content'
}

interface IDateDefinition<T> extends IBaseDefinition<T> {
  kind?: 'date'
}

interface IBooleanDefinition<T> extends IBaseDefinition<T> {
  kind?: 'boolean'
  true: TranslationSchema
  false: TranslationSchema
}

export type Definitions<T, L extends Record<string, Object> = {}> =
  | IContentDefinition<T>
  | ITranslatableDefinition<T>
  | IDateDefinition<T>
  | IBooleanDefinition<T>
  | ILookupDefinition<T, L>

export interface IDefinitionCardTerm<T, L extends Record<string, Object> = {}> {
  label: TranslationSchema
  size: 12 | 24
  definitions: Definitions<T, L>[][]
  hideIfOtherValueIsTruthy?: keyof T
  hideIfThisValueIsFalsy?: keyof T
}

export interface IDefinitionCardAction {
  label: TranslationSchema
  disabled?: Ref<boolean>
  onClick: () => void
}
interface IDefinitionCardBase {
  cardLabel: TranslationSchema | null
  actions?: IDefinitionCardAction[]
}
interface IDefinitionCardRealBase extends IDefinitionCardBase {
  kind?: 'real'
}
interface IDefinitionCardVirtualBase extends IDefinitionCardBase {
  kind?: 'virtual'
}

export interface IDefinitionCard<Parent, Key extends keyof Parent, Lookup extends Record<string, Object> = {}>
  extends IDefinitionCardRealBase {
  loopOn?: never
  key: Parent[Key] extends WithIdAndIsDone ? Key : never
  terms: IDefinitionCardTerm<Parent[Key], Lookup>[]
  hideIfOtherValueIsTruthy?: [string, string]
}

export interface IDefinitionCardArray<Parent, LoopKey extends keyof Parent, Key extends keyof Parent[LoopKey]>
  extends IDefinitionCardRealBase {
  loopOn?: Parent[LoopKey][Key] extends any[] ? Key : never
  key: Parent[LoopKey] extends WithIdAndIsDone ? LoopKey : never
  terms: IDefinitionCardTerm<ArrElement<Parent[LoopKey][Key]>>[]
  hideIfOtherValueIsTruthy?: [string, string]
}

export interface IDefinitionCardVirtual<Parent, Key extends keyof Parent, Lookup extends Record<string, Object> = {}>
  extends IDefinitionCardVirtualBase {
  loopOn?: never
  key: Key
  terms: IDefinitionCardTerm<Parent[Key], Lookup>[]
  hideIfOtherValueIsTruthy?: [string, string]
}

export interface IDefinitionCardArrayVirtual<Parent, LoopKey extends keyof Parent, Key extends keyof Parent[LoopKey]>
  extends IDefinitionCardVirtualBase {
  loopOn?: Key
  key: LoopKey
  terms: IDefinitionCardTerm<ArrElement<Parent[LoopKey][Key]>>[]
  hideIfOtherValueIsTruthy?: [string, string]
}

export type DefinitionCards<Parent, Key extends keyof Parent> =
  | IDefinitionCard<Parent[Key], any, any>
  | IDefinitionCardArray<ArrElement<Parent[Key]>, any, any>

export type DefinitionCardsVirtual<Parent, Key extends keyof Parent> =
  | IDefinitionCardVirtual<Parent[Key], any, any>
  | IDefinitionCardArrayVirtual<ArrElement<Parent[Key]>, any, any>

export interface IDefinitionSectionObject<Parent, Key extends keyof Parent> {
  sectionLabel: TranslationSchema
  kind: 'object'
  key: Key
  mapping: DefinitionCards<Parent, Key>[]
}

export interface IDefinitionSectionObjectVirtual<Parent, Key extends keyof Parent> {
  sectionLabel: TranslationSchema
  kind: 'object'
  key: Key
  mapping: DefinitionCardsVirtual<Parent, Key>[]
}

type ArrElement<ArrType extends any> = ArrType extends readonly (infer ElementType)[] ? ElementType : never

export interface IDefinitionSectionArray<
  Parent,
  Key extends keyof Parent,
  ArrayLabelKey extends keyof ArrElement<Parent[Key]>,
> {
  sectionLabel: TranslationSchema
  arrayLabel: (
    | IContentDefinition<ArrElement<Parent[Key]>[ArrayLabelKey]>
    | ITranslatableDefinition<ArrElement<Parent[Key]>[ArrayLabelKey]>
  )[]
  kind: 'array'
  key: Key
  arrayLabelKey: ArrayLabelKey
  mapping: IDefinitionCard<ArrElement<Parent[Key]>, any>[]
}

export interface IDefinitionSectionSingle<Parent, Key extends keyof Parent> {
  sectionLabel: TranslationSchema
  kind: 'single'
  key: Key
  card: IDefinitionCard<ArrElement<Parent[Key]>, any> | IDefinitionCardVirtual<ArrElement<Parent[Key]>, any>
}

export type DefinitionSection<Parent, Key extends keyof Parent> =
  | IDefinitionSectionSingle<Parent, Key>
  | IDefinitionSectionArray<Parent, Key, any>
  | IDefinitionSectionObject<Parent, Key>
