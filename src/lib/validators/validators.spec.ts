import { test } from 'ava'
import { isValidEmail } from "./"

test('validators::isValidEmail', t => {
    t.true(isValidEmail('fresh@prince.com')[0] === true && isValidEmail('fresh@prince.com')[1].length === 0)
})