import { test } from 'ava'
import { isRequired, isValidEmail } from '../../validators';
import { all } from './all'
import { ap } from './ap'

test('functions: all', t => {
    t.is(true, all(v => v === true)([true, true, true]))
    t.is(false, all(v => v === true)([true, false, true]))
})

test('functions: ap', t => {

    t.deepEqual([''], (() => {
        const fns = [
            (v: string) => v
        ]
        return ap<string>(fns)([''])
    })())

    t.deepEqual(['WOW'], (() => {
        const fns = [
            (v: string) => v.toUpperCase()
        ]
        return ap<string>(fns)(['wow'])
    })())

    t.deepEqual([[true, ''], [true, '']], (() => {
        const fns = [
            isValidEmail,
            isRequired
        ]
        // tslint:disable-next-line
        return ap<any>(fns)(['wow@wow.com'])
    })())
})