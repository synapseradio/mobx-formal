/**
 * equals
 * 
 * curried function. take a value, then return a function that checks for equality to that value.
 */

export function equals(val: any) {
    return (arg: any) => arg === val
}