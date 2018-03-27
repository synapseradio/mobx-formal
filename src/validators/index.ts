/**
 *
 * Form Validation functions
 *
 * All must return FieldValidationResult
 */

import { isEmail, isEmpty, isMobilePhone, isURL } from 'validator'


// tslint:disable-next-line
export type ValidationRuleArgs = {
    /**
     * a rule checks a string and returns boolean.
     * extra conditions are supported, as long as the end result is boolean.
     */
    // tslint:disable-next-line
    rule: { (str: string): boolean } | { (str: string, ...args: any[]): boolean }

    /**
     * Each rule should give feedback to the user when there's an error.
     */
    errorMessage: string

    /**
     * Set to true if this condition should check for the inverse of the rule. Ex. isRequired = !isEmpty
     * not required; defaults to false
     */
    invert?: boolean
}



export const makeRule:
    (args: ValidationRuleArgs) =>
        (str: string) =>
            MobxFormal.FieldValidationResult =
    ({ rule, errorMessage, invert }) =>

        (str: string) => {
            invert = invert || false
            // tslint:disable-next-line
            const valid = (invert) ? !rule(str) : rule(str)

            return [valid, valid ? '' : errorMessage.trim()]
        }

export const isRequired = makeRule({
    errorMessage: 'Field is required.',
    invert: true,
    rule: isEmpty,
})

export const isValidEmail = makeRule({
    errorMessage: 'Must be a valid email address.',
    invert: false,
    rule: isEmail,
})

export const isValidUrl = makeRule({
    errorMessage: 'Must be a valid URL.',
    invert: false,
    rule: isURL,
})

export const isPhoneNumber = makeRule({
    errorMessage: 'Must be a valid phone number.',
    invert: false,
    rule: isMobilePhone
})