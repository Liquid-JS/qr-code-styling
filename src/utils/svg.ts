import { RotateFigureArgs } from '../types/helper.js'

const rx = /\.?0+$/

export function numToAttr(value: number | string) {
    if (typeof value == 'string') return value
    return value.toFixed(7).replace(rx, '')
}

export function svgPath(strings: TemplateStringsArray, ...values: unknown[]) {
    return strings
        .reduce((t, v, i) => {
            let p: unknown = ''
            if (i) p = values[i - 1]
            if (typeof p == 'number') p = numToAttr(p)
            return `${t}${p}${v}`
        }, '')
        .trim()
        .replace(/[\s\n\r]+/gim, ' ')
}

export function rotateFigure<T extends SVGElement | ReadonlyArray<SVGElement>>({ draw, ...args }: RotateFigureArgs<T>) {
    const { x, y, size, rotation = 0 } = args
    const cx = x + size / 2
    const cy = y + size / 2

    const element = draw(args)
    if (rotation) (Array.isArray(element) ? element : [element])
        .forEach(el => el.setAttribute('transform', `rotate(${numToAttr((180 * rotation) / Math.PI)},${cx},${cy})`))
    return element
}

export function scalePath(path: Array<string | number>, { x, y, size }: {
    x: number
    y: number
    size: number
}) {
    let move = false
    let i = 0
    return path
        .map((v) => {
            if (typeof v == 'string') {
                i = 0
                move = v.toUpperCase() == v
                return v
            }
            i++
            v = v * size
            if (move) {
                v += i % 2 == 1 ? x : y
            }
            return numToAttr(v)
        })
        .join(' ')
}
