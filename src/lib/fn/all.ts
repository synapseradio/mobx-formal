/**
 * all
 * curried function. takes a condition function, and returns a function that tests it against an array.
 * return true only if all members of an array satisfy the condition
 */

export const all: (cond: (v: any) => boolean) => (elements: boolean[]) => boolean = cond => elements => {
    return elements.reduce(
        (prev, next) =>
            cond(prev) === true && cond(next) === true
        , true)
}