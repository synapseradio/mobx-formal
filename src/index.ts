/**
 * 
 * Form
 * 
 * held in FormStore, these handle form operations for a form
 */

import { observable, ObservableMap } from 'mobx'
import { all, ap, equals } from './lib/fn'
export { isValidEmail, isRequired, isPhoneNumber, isValidUrl, makeRule, ValidationRuleArgs } from './validators'

import InternalFormField = MobxFormal.InternalFormField
import FieldValidationResult = MobxFormal.FieldValidationResult
import FormField = MobxFormal.FormField

export interface IForm {
    fields: ObservableMap<InternalFormField>
    hasBeenSubmitted: boolean
    isValid: boolean

    clearField(key: string): void
    clearAllFields(): void
    errorsOf(key: string): string
    fieldIsValid(key: string): boolean
    fieldValue(key: string): string
    getFieldValidationResult(key: string): FieldValidationResult
    validateField(key: string): void
    validateAllFields(): void
    handleChange(key: string): (e: Event) => void
    values(opts: { format: (v: string) => string }): { [key: string]: string }
}


function isNullOrUndefined<T>(obj: T | null | undefined): obj is null | undefined {
    return typeof obj === "undefined" || obj === null
}

export class Form implements IForm {

    /**
     *
     * All fields of this form should be held in here.
     *
     */

    public fields: ObservableMap<InternalFormField> = observable.map({})

    /**
     * hasBeenSubmitted
     * Whether or not the user has tried to submit this form
     */

    public hasBeenSubmitted: boolean = false

    constructor(fields: { [key: string]: FormField }) {
        Object.keys(fields).map(key => {
            // tslint:disable-next-line
            this.fields.set(key, ({ ...fields[key], rules: fields[key].hasOwnProperty('rules') ? fields[key].rules : [], hasBeenModified: false } as InternalFormField))
        })
    }

    /**
     * create a field out of a loose field object
     */


    /**
     * clearField
     * 
     * clear a single filed of this form
     */

    public clearField = (key: string): void => {
        const field = this.fields.get(key)
        if (isNullOrUndefined(field)) {
            throw new Error('Field does not exist.')
        } else {
            this.fields.set(
                key,
                {
                    hasBeenModified: false,
                    rules: field.rules,
                    value: ''
                }
            )
        }

    }

    /**
     * clearFields
     * 
     * clear all fields of this form
     */

    public clearAllFields = (): void => {
        for (const key of this.fields.keys()) {
            this.clearField(key)
        }
    }

    /**
     *
     * errorsOf
     * Get a text string of any errors that may exist for a field
     */

    public errorsOf: (key: string) => string = (key: string) => {
        const field: InternalFormField | undefined = this.fields.get(key)

        if (!isNullOrUndefined(field)) {
            if (field.hasOwnProperty('validationResult') && !isNullOrUndefined(field.validationResult)) {
                return field.validationResult[1]
            } else if (field.hasBeenModified) {
                return this.getFieldValidationResult(key)[1]
            }
            else {
                return ''
            }
        } else {
            throw new Error('Field does not exist.')
        }

    }

    /**
     * formIsValid
     * checks all fields with rules and returns true if they are all valid
     */

    get isValid(): boolean {
        // check all fields that have rules
        // to see if they are valid
        const fieldValidationResults = []
        for (const key of this.fields.keys()) {
            fieldValidationResults.push(this.fieldIsValid(key))
        }

        return all(equals(true))(fieldValidationResults)
    }

    /**
     * fieldIsValid
     * check a single field
     *
     */

    public fieldIsValid = (key: string): boolean => {
        const field = this.fields.get(key)

        if (isNullOrUndefined(field)) {
            return false
        }

        return (
            // if a field doesn't have rules or a validation result, it's valid
            (!field.hasOwnProperty('validationResult') && (!field.rules.length)) ||

            // if it does have rules and the results are good, it's valid
            // note that fields don't have results until one is touched,
            // so if an empty form has any guarded fields, it's invalid.
            ((field.hasOwnProperty('validationResult')
                && !isNullOrUndefined(field.validationResult)
                && (field.validationResult[0] as boolean)))
        )
    }

    /**
     * fieldValue
     * All form input components
     * should be controlled with this function
     * <Input value={this.fieldValue(fieldKey)} />
     */

    public fieldValue = (key: string): string => {
        const field = this.fields.get(key)
        if (isNullOrUndefined(field)) {
            throw new Error('Field does not exist')
        } else {
            return field.value
        }
    }

    /**
     * getFieldValidationResult
     * 
     * ensure that a field is valid by applying all of its rules in sequence
     */

    public getFieldValidationResult = (key: string): FieldValidationResult => {

        const field: InternalFormField | undefined = this.fields.get(key)

        if (isNullOrUndefined(field)) {
            throw new Error('Field does not exist.')
        }

        if (field.rules.length) {
            const results = ap<any>(field.rules!)([field.value])

            return results.reduce(
                (prev, next) => [
                    prev[0] && next[0],
                    // concatenate the errors together if there are any
                    prev[1].length ? prev[1].concat(` ${next[1]}`) : next[1]
                ],
                [true, '']
            )
        } else {
            return [true, '']
        }

    }

    /**
     * 
     * validate a single field.
     * 
     * @param key 
     * 
     */
    public validateField(key: string): void {
        const field = this.fields.get(key)
        if (isNullOrUndefined(field)) {
            throw new Error('Field does not exist.')
        }

        if (field.hasBeenModified) {
            this.fields.set(key, {
                ...field,
                validationResult: this.getFieldValidationResult(key)
            })
        }

    }

    /**
     * 
     * validate all fields at once, saving the result.
     */

    public validateAllFields = (): void => {
        for (const key of this.fields.keys()) {
            // validateAllFields is meant to force user feedback.
            // fields will only validate after they have been modified,
            // so we need to make sure that all fields have been marked as such
            this.fields.set(
                key,
                {
                    ...this.fields.get(key),
                    hasBeenModified: true
                    // tslint:disable-next-line
                } as InternalFormField
            )

            this.validateField(key)
        }
    }

    /**
     * 
     * Change the value of a field while ensuring validity on key press
     *
     */

    public handleChange = (key: string) => (e: any): void => {
        // apply all rules to the value of the field

        const field: InternalFormField | undefined = this.fields.get(key)

        if (isNullOrUndefined(field)) {
            throw new Error('Field does not exist.')
        }

        // mark the field as modified.
        // after this is set to,
        // errors will appear when they exist
        // for this field
        if (!field.hasBeenModified) {
            field.hasBeenModified = true
        }

        if (e.hasOwnProperty('target') && e.target.hasOwnProperty('value')) {
            this.fields.set(key, {
                ...field,
                value: (e.target as HTMLInputElement).value
            })
        } else {
            this.fields.set(key, {
                ...field,
                value: e
            })
        }

        if (field.rules.length) {
            this.validateField(key)
        }

    }

    public values = (opts = { format: (v: string) => v }) => {
        const values: { [key: string]: string } = {}

        for (const key of this.fields.keys()) {
            values[key] = opts.format(this.fieldValue(key))
        }

        return values
    }
}
