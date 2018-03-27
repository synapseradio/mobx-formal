# mobx-formal

A small library to make form handling easier for applications using MobX for state management. It is meant to simplify the process of form creation, management, validation and providing useful feedback to users,  

mobx-formal has no dependencies on React, so you can use it with any view layer. 

mobx-formal uses [validator.js](https://github.com/chriso/validator.js) to provide some of the most common form validation rules. However, it also gives you the ability to easily create your own validation rules

## Installation
    npm i mobx-formal
## How to use it

### setup
Here's a quick example of a form getting initialized.

    import { Form, isRequired, isValidEmail } from 'mobx-formal'

    const form = new Form({ 
        name: { 
            value: 'Doctor Awesome'
        },
        email: {
            rules: [isRequired, isValidEmail],
            // this will show an error below
            value: 'probablynot@this'
        }
    })

It's pretty quick. You now have access to the following methods - for simplicity, the examples are written with JSX, but mobx-formal can be used with any view layer.

mobx-formal works for any input field that works with strings. It's limited because mobx-formal is targeted towards complex forms that have what can sometimes be equally complex validation rules, and other types of field generally need less effort to validate. 

However, mobx-formal will play nicely with forms that contain any type of input. It's lightweight, and can be used as one ingredient of your recipe without needing to control every field that you have. It's designed to be as versatile as possible, and can be used with any string input or group thereof, wrapped in forms or otherwise.

## Methods
### fieldValue
Fetches the value for any given field.

    
     form.fieldValue('email')
     // "probablynot@this"

    
### values
gathers all of the values in the form into a JS object. Useful when you're POSTing forms over AJAX, or exporting them for other purposes.

    form.values()
    // { name: 'Doctor Awesome', email: 'probablynot@this' }

the values method has an optional format parameter as well. You can use any function that formats a string, like trim() to remove trailing spaces, or something like toUpperCase(), if that's your thing.

    form.values({ 
        format: (str) => str.toUpperCase()
        })
    // { name: 'DOCTOR AWESOME', email: 'PROBABLYNOT@THIS'}



### validateField

    form.validateField('email')

    console.log(form.errorsOf('email'))

    // "Field is required. Email is invalid."

Gets any errors that currently exist for a given field. validateField is called on change events, so you shouldn't have to call it manually. mobx-formal handles validation in real time.

### errorsOf
    form.errorsOf('email')

Coalesces any errors for a given field into a human-readable string.
### validateAllFields

    form.validateAllFields()
    // common usage
    <button onClick={form.isValid ? submit() : form.validateAllFields() }>

validateAllFields is useful in cases where you want to show the user errors when they try to submit a form prematurely, like clicking the submit button before anything has been filled out.

### isValid
    form.isValid

    // true | false

isValid is a computed property that lets you know whether or not every field is valid with a simple boolean expression.
### handleChange

    <input 
        type={'email'} 
        onChange={form.handleChange('email')} 
        value={form.fieldValue('email)} 
    />

    <p color={'red'}>
        {form.errorsOf('email')}
    </p>

handleChange takes the name of the field, then returns an event handler for that field that updates the value of the field and validates it simultaneously.

While using handleChange, just using

    form.handleChange(fieldName)

is enough. But for some cases, you want a little more control. For example:

    // m is a moment.js object 
    <DatePicker 
        value={form.fieldValue('date')} 
        onChange={
            m => form.handleChange('date')(m.toISOString())
        }
    />

as long as whatever you use can boil down to a string, mobx-formal can handle it. 

### creating fields

There are three requirements for form fields - they must have a name, value, and that value must be a string.
    
    // valid field
    new Form({
        firstName: {
            value: '' // can be initialized, does not have to be empty
        }
    })

Fields can also have a *rules* property, which is a list of validators.

    new Form({
        firstName: {
            rules: [isRequired],
            value: ''
        }
    })

read below to see how validators work, and how you can create your own.
### Validators

    // a validator takes a string and returns 
    // a tuple of whether that string is valid
    // and a string that contains the combined ( concatenated ) error 
    // messages for invalid ones.

    validator :: string -> [boolean, string]

Validators are rules issued on a per-field basis that let the form know what's OK and what isn't.

mobx-formal contains a couple of the most common ones by default. *isRequired*, *isValidEmail*, *isValidUrl*, and *isPhoneNumber*. Pull requests are welcome to add more.

validation rules are applied in sequence automatically whenever a field is changed. You can also have mobx-formal validate fields manually.

creating your own validation rules is simple. mobx-formal exports a function call *makeRule* to do just that.



    import { makeValidator } from 'mobx-formal'

    const mustBeLoud = makeValidator({
        // rule ( required ) is a function that does some operation on a string 
        // and returns true or false

        rule: (val) => val === val.toUpperCase(),

        // invert is an optional config that's available 
        // if you want to check for the *opposite* of the condition.

        invert: false,

        // message ( required )
        message: "I CAN'T HEAR YOU"
    })

    const mustBeQuiet = makeValidator({
        rule: (str) => str === str.toLowerCase(),
        message: "MY EARS ARE SENSITIVE"
    })

    // a real-world example using validator.js and invert

    const isRequired = makeRule({
        errorMessage: 'Field is required.',
        invert: true,
        rule: isEmpty, // isRequired is the inverse of isEmpty
    })



    