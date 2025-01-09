export type RecursivePartial<T> = {
    [P in keyof T]?: T[P] extends Array<infer U>
        ? Array<RecursivePartial<U>>
        : T[P] extends object | undefined
            ? RecursivePartial<T[P]>
            : T[P];
}

export interface DrawArgs {
    x: number
    y: number
    size: number
    rotation?: number
    getNeighbor?: (x: number, y: number) => boolean
}

export interface BasicFigureDrawArgs {
    x: number
    y: number
    size: number
    rotation?: number
}

export interface RotateFigureArgs {
    x: number
    y: number
    size: number
    rotation?: number
    draw: () => void
}
