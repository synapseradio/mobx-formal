

/**
 * Types for form lib
 */

declare namespace MobxFormal {
    type ValidatedFieldValue = string
    type ValidatedFieldError = string

    type FieldValidationStatus = boolean

    type FieldValidationResult = [FieldValidationStatus, ValidatedFieldError]

    type ValidatedFieldRule = (v: string) => FieldValidationResult

    interface FormField {
        rules?: ValidatedFieldRule[]
        value: ValidatedFieldValue
        validationResult?: FieldValidationResult
    }

    interface InternalFormField {
        // rules are required internally, and added automatically if they don't exist
        rules: ValidatedFieldRule[]
        value: ValidatedFieldValue
        validationResult?: FieldValidationResult
    }


}
