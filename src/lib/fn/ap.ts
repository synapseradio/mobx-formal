/**
 * ap
 * 
 * apply a list of functions to a list of arguments
 */

export function ap<T>(fns: Array<((v: T) => T)>): (args: T[]) => T[] {
    return (args: T[]) => {
        const results: T[] = []

        for (const f of fns) {
            args.map(a => results.push(f(a)))
        }
        return results
    }
}