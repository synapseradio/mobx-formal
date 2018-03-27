import { test } from 'ava'
import { Form } from './'
import { isRequired, isValidEmail } from './validators';

const testFields = {
    email: {
        rules: [isRequired, isValidEmail],
        value: ''
    },
    name: {
        rules: [isRequired],
        value: ''
    },
}

const form = new Form(testFields)

test('Form::fieldValue', t => {
    // @ts-ignore
    form.fields.set('email', { ...form.fields.get('email'), value: 'wow' })

    t.is('wow', form.fieldValue('email'))
})

test('Form::clearField', t => {
    // @ts-ignore
    form.fields.set('email', { ...form.fields.get('email'), value: 'wow' })

    t.is('wow', form.fieldValue('email'))

    form.clearField('email')

    t.is('', form.fieldValue('email'))
})

test('Form::errorsOf', t => {
    // @ts-ignore
    form.fields.set('email', { ...form.fields.get('email'), value: 'wow' })

    t.is('wow', form.fieldValue('email'))

    form.validateField('email')

    t.true(form.errorsOf('email').length > 0)

    // @ts-ignore
    form.fields.set('email', { ...form.fields.get('email'), value: 'wow@wow.com' })

    t.is('wow@wow.com', form.fieldValue('email'))

    form.validateField('email')

    t.true(form.errorsOf('email').length === 0)

})

test('Form::getFieldValidationResult', t => {
    // @ts-ignore
    form.fields.set('email', { ...form.fields.get('email'), value: 'wow@wow.com' })

    t.deepEqual([true, ''], form.getFieldValidationResult('email'))

    // @ts-ignore
    form.fields.set('email', { ...form.fields.get('email'), value: 'wow@wow' })
    t.deepEqual(false, form.getFieldValidationResult('email')[0])
    t.true(form.getFieldValidationResult('email')[1].length > 0)
})


test('Form::handleChange valid', t => {
    // @ts-ignore
    form.handleChange('email')({ target: { value: 'test@gmail.com' } })

    t.true(form.fieldValue('email') === 'test@gmail.com')
    // tslint:disable-next-line
    t.true(form.errorsOf('email') === '')
})

test('Form::handleChange invalid', t => {

    // @ts-ignore
    form.handleChange('email')({ target: { value: 'wow@' } })

    const errorString = form.getFieldValidationResult('email')[1]
    t.true(form.fieldValue('email') === 'wow@')
    t.true(form.errorsOf('email') === errorString && errorString.length > 0)
    t.false(form.fieldIsValid('email'))
})

test('Form::validateAllFields', t => {
    form.validateAllFields()

    t.true(form.errorsOf('email').length > 0)
    t.true(form.errorsOf('name').length > 0)
})

test('Form::values', t => {
    form.clearAllFields()

    t.deepEqual({ email: '', name: '' }, form.values())
    // @ts-ignore
    form.handleChange('email')({ target: { value: 'wow@wow.com' } })

    t.deepEqual({ email: 'wow@wow.com', name: '' }, form.values())
})