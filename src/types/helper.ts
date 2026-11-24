/** Values taken whole rather than made partial: functions, and objects that aren't groups of options */
type WholeValue = ((...args: never[]) => unknown) | Date | RegExp | Blob | ArrayBuffer | ArrayBufferView | Node

/**
 * `T` with every option optional, in nested groups and lists too
 *
 * Each member of a union is made partial on its own, so a group that can also be `false` (e.g. `backgroundOptions`)
 * takes a partial group as well.
 */
export type RecursivePartial<T> = {
    [P in keyof T]?: PartialValue<T[P]>
}

type PartialValue<V> = V extends WholeValue
    ? V
    : V extends ReadonlyArray<infer U>
        ? Array<PartialValue<U>>
        : V extends object
            ? RecursivePartial<V>
            : V

export interface BasicFigureDrawArgs {
    document: Document
    x: number
    y: number
    size: number
}

export interface DrawArgs extends BasicFigureDrawArgs {
    rotation?: number
    getNeighbor?: (x: number, y: number) => boolean
    /** A pseudo-random number generator for the given position */
    getPRandom?: () => number
}

export interface RotateFigureArgs<T extends SVGElement | ReadonlyArray<SVGElement>> extends BasicFigureDrawArgs {
    rotation?: number
    draw: (args: BasicFigureDrawArgs) => T
}
