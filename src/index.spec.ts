import { test } from 'ava'
import { Form } from './'
import { isRequired, isValidEmail } from './validators';

const testFields = {
    date: {
        rules: [],
        value: ''
    },

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

test('Form values have not been modified at init', t => {
    for (const key of form.fields.keys()) {
        // @ts-ignore
        t.false(form.fields.get(key).hasBeenModified)
        // @ts-ignore
        t.false(form.fields.get(key).hasOwnProperty('validationResult'))
        t.true(form.errorsOf(key) === '' || form.errorsOf(key) === undefined)
    }
})

test('Form::fieldValue', t => {

    form.handleChange('email')('wow')

    t.is('wow', form.fieldValue('email'))
})

test('Form::clearField', t => {

    form.handleChange('email')('wow')

    t.is('wow', form.fieldValue('email'))

    form.clearField('email')

    t.is('', form.fieldValue('email'))
})

test('Form::errorsOf', t => {
    form.clearField('email')
    t.is('', form.fieldValue('email'))
    t.true(form.errorsOf('email') === '')

    form.handleChange('email')('wow')

    t.is('wow', form.fieldValue('email'))

    t.true(form.errorsOf('email').length > 0)

    form.handleChange('email')('wow@wow.com')

    t.is('wow@wow.com', form.fieldValue('email'))

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
    form.handleChange('email')('test@gmail.com')

    t.true(form.fieldValue('email') === 'test@gmail.com')
    // tslint:disable-next-line
    t.true(form.errorsOf('email') === '')
})

test('Form::handleChange invalid', t => {

    // @ts-ignore
    form.handleChange('email')('wow@')

    const errorString = form.getFieldValidationResult('email')[1]
    t.true(form.fieldValue('email') === 'wow@')
    t.true(form.errorsOf('email') === errorString && errorString.length > 0)
    t.false(form.fieldIsValid('email'))
})

test('Form::handleChange with custom value', t => {
    const now = Date.now()

    form.handleChange('date')(now.toLocaleString())

    // tslint:disable-next-line
    t.true(form.fieldValue('date') === now.toLocaleString())
})

test('Form::validateAllFields', t => {
    form.validateAllFields()

    t.true(form.errorsOf('email').length > 0)
    t.true(form.errorsOf('name').length > 0)

    // make sure that all fields have been marked as modified
    for (const key of form.fields.keys()) {
        // if any of the fields are undefined
        // it's an error, so, 
        // @ts-ignore
        t.true(form.fields.get(key).hasBeenModified)
    }
})

test('Form::values', t => {
    form.clearAllFields()

    form.handleChange('email')('wow@wow.com')

    t.deepEqual({ date: '', email: 'wow@wow.com', name: '' }, form.values())
})

test('Form::values with format function', t => {
    form.clearAllFields()

    form.handleChange('name')('Matt Damon')

    t.deepEqual({ date: '', email: '', name: 'Matt Damon' }, form.values())

    t.deepEqual({ date: '', email: '', name: 'MATT DAMON' }, form.values({ format: str => str.toUpperCase() }))
})