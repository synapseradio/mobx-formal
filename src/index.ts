/**
 * 
 * Form
 * 
 * held in FormStore, these handle form operations for a form
 */

import FieldValidationResult = Form.FieldValidationResult
import ValidatedFieldError = Form.ValidatedFieldError
import IForm = Form.IForm
import FormField = Form.FormField
import { all, ap, equals } from './lib/fn'

function isNullOrUndefined<T>(obj: T | null | undefined): obj is null | undefined {
    return typeof obj === "undefined" || obj === null
}

export class Form implements IForm {

    /**
     *
     * All fields of this form should be held in here.
     *
     */

    public fields = new Map<string, FormField>()

    /**
     * hasBeenSubmitted
     * Whether or not the user has tried to submit this form
     */

    public hasBeenSubmitted: boolean = false

    constructor(fields: { [key: string]: FormField }) {
        Object.keys(fields).map(key => {
            this.fields.set(key, fields[key])
        })
    }

    /**
     * clearField
     * 
     * clear a single filed of this form
     */

    public clearField = (key: string): void => {
        const existingField = this.fields.get(key)
        if (isNullOrUndefined(existingField)) {
            return
        } else {
            this.fields.set(key, { ...existingField, value: '' })
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

    public errorsOf: (key: string) => ValidatedFieldError = (key: string) => {
        const existingField: FormField | undefined = this.fields.get(key)

        if (!isNullOrUndefined(existingField)) {
            return existingField.hasOwnProperty('validationResult') && !isNullOrUndefined(existingField.validationResult)
                ? (existingField.validationResult)[1]
                : this.getFieldValidationResult(key)[1]
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
        const existingField = this.fields.get(key)

        if (isNullOrUndefined(existingField)) {
            return false
        }

        return (
            // if a field doesn't have rules or a validation result, it's valid
            (!existingField.hasOwnProperty('validationResult') && !existingField.rules.length) ||

            // if it does have rules and the results are good, it's valid
            // note that fields don't have results until one is touched,
            // so if an empty form has any guarded fields, it's invalid.
            (existingField.hasOwnProperty('validationResult')
                && !isNullOrUndefined(existingField.validationResult)
                && (existingField.validationResult[0] as boolean))
        )
    }

    /**
     * fieldValue
     * All form input components
     * should be controlled with this function
     * <Input value={this.fieldValue(fieldKey)} />
     */

    public fieldValue = (key: string): string => {
        const existingField = this.fields.get(key)
        if (isNullOrUndefined(existingField)) {
            throw new Error('Field does not exist')
        } else {
            return existingField.value
        }
    }

    /**
     * getFieldValidationResult
     * 
     * ensure that a field is valid by applying all of its rules in sequence
     */

    public getFieldValidationResult = (key: string): FieldValidationResult => {

        const field: FormField | undefined = this.fields.get(key)

        if (isNullOrUndefined(field)) {
            throw new Error('Field does not exist.')
        }

        if (field.hasOwnProperty('rules')) {
            const results = ap<any>(field.rules)([field.value])

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
        const existingField = this.fields.get(key)
        if (isNullOrUndefined(existingField)) {
            throw new Error('Field does not exist.')
        }

        this.fields.set(key, {
            ...existingField,
            validationResult: this.getFieldValidationResult(key)
        })
    }

    /**
     * 
     * validate all fields at once, saving the result.
     */

    public validateAllFields = (): void => {
        for (const key of this.fields.keys()) {
            this.validateField(key)
        }
    }

    /**
     * 
     * Change the value of a field while ensuring validity on key press
     *
     */

    public handleChange = (key: string) => (e: Event): void => {
        // apply all rules to the value of the field

        const field: FormField | undefined = this.fields.get(key)

        if (isNullOrUndefined(field)) {
            throw new Error('Field does not exist.')
        }

        this.fields.set(key, {
            ...field,
            value: (e.target as HTMLInputElement).value
        })

        this.validateField(key)
    }
}
