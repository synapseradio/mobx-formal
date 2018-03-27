

/**
 * Types for form lib
 */

import { ObservableMap } from 'mobx'

export type ValidatedFieldValue = string
export type ValidatedFieldError = string

export type FieldValidationStatus = boolean

export type FieldValidationResult = [FieldValidationStatus, ValidatedFieldError]

export type ValidatedFieldRule = (v: string) => FieldValidationResult

export interface FormField {
    rules: ValidatedFieldRule[]
    value: ValidatedFieldValue
    validationResult?: FieldValidationResult
}

export interface IForm {
    fields: ObservableMap<string, FormField>
    hasBeenSubmitted: boolean
    isValid: boolean

    clearField(key: string): void
    clearAllFields(): void
    errorsOf(key: string): ValidatedFieldError
    fieldIsValid(key: string): boolean
    fieldValue(key: string): string
    getFieldValidationResult(key: string): FieldValidationResult
    validateField(key: string): void
    validateAllFields(): void
    handleChange(key: string): (e: Event) => void
    values(): { [key: string]: string }
}
