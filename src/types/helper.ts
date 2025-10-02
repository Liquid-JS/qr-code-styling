export type RecursivePartial<T> = {
    [P in keyof T]?: T[P] extends Array<infer U>
        ? Array<RecursivePartial<U>>
        : T[P] extends object | undefined
            ? RecursivePartial<T[P]>
            : T[P];
}

export interface BasicFigureDrawArgs {
    document: Document
    x: number
    y: number
    size: number
}

export interface DrawArgs extends BasicFigureDrawArgs {
    rotation?: number
    getNeighbor?: (x: number, y: number) => boolean
}

export interface RotateFigureArgs<T extends SVGElement | ReadonlyArray<SVGElement>> extends BasicFigureDrawArgs {
    rotation?: number
    draw: (args: BasicFigureDrawArgs) => T
}
