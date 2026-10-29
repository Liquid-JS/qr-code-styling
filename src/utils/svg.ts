import { RotateFigureArgs } from '../types/helper.js'

const rx = /\.?0+$/

export function numToAttr(value: number | string) {
    if (typeof value == 'string') return value
    const str = value.toFixed(7).replace(rx, '')
    // Avoid negative zero for values rounded to 0
    return str == '-0' ? '0' : str
}

/**
 * Template tag for SVG attribute values (path data, transforms, lengths, ...);
 * formats interpolated numbers with numToAttr and collapses whitespace
 */
export function svgAttr(strings: TemplateStringsArray, ...values: unknown[]) {
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

/**
 * @deprecated Use svgAttr
 */
export const svgPath = svgAttr

export function rotateFigure<T extends SVGElement | ReadonlyArray<SVGElement>>({ draw, ...args }: RotateFigureArgs<T>) {
    const { x, y, size, rotation = 0 } = args
    const cx = x + size / 2
    const cy = y + size / 2

    const element = draw(args)
    if (rotation) (Array.isArray(element) ? element : [element])
        .forEach(el => el.setAttribute('transform', svgAttr`rotate(${(180 * rotation) / Math.PI},${cx},${cy})`))
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

const paramCount: Record<string, number> = { m: 2, l: 2, h: 1, v: 1, c: 6, s: 4, q: 4, t: 2, a: 7, z: 0 }

/**
 * Parse path data into commands with numeric arguments; undefined if invalid
 */
export function parsePath(d: string) {
    const segments: Array<[string, number[]]> = []
    const skipRx = /[\s,]*/y
    const cmdRx = /[MmLlHhVvCcSsQqTtAaZz]/y
    const numRx = /[-+]?(?:\d+\.?\d*|\.\d+)(?:[eE][-+]?\d+)?/y
    const flagRx = /[01]/y
    let pos = 0
    const match = (re: RegExp) => {
        skipRx.lastIndex = pos
        skipRx.exec(d)
        pos = re.lastIndex = skipRx.lastIndex
        const m = re.exec(d)
        if (m) pos = re.lastIndex
        return m?.[0]
    }

    let cmd = ''
    while (true) {
        const c = match(cmdRx)
        if (c) {
            cmd = c
        } else {
            if (pos >= d.length) break
            // Implicit command repetition
            if (!cmd || cmd == 'z' || cmd == 'Z') return undefined
            if (cmd == 'M') cmd = 'L'
            if (cmd == 'm') cmd = 'l'
        }

        const isArc = cmd == 'a' || cmd == 'A'
        const args: number[] = []
        for (let i = 0; i < paramCount[cmd.toLowerCase()]; i++) {
            const v = match(isArc && (i == 3 || i == 4) ? flagRx : numRx)
            if (v === undefined) return undefined
            args.push(parseFloat(v))
        }
        segments.push([cmd, args])
    }
    return segments
}

/**
 * Rotate path data around (cx, cy), keeping relative commands relative
 * (converting them to absolute would accumulate rounding errors of the original values)
 */
function rotatePath(d: string, angle = 0, cx = 0, cy = 0) {
    const segments = parsePath(d)
    if (!segments) return undefined

    const rad = (angle * Math.PI) / 180
    const cos = Math.cos(rad)
    const sin = Math.sin(rad)
    const vector = (dx: number, dy: number) => svgAttr`${dx * cos - dy * sin} ${dx * sin + dy * cos}`
    const point = (px: number, py: number) => svgAttr`${cx + (px - cx) * cos - (py - cy) * sin} ${cy + (px - cx) * sin + (py - cy) * cos}`

    // Track the current point to resolve absolute H / V commands
    let x = 0
    let y = 0
    let startX = 0
    let startY = 0
    return segments.map(([cmd, args], i) => {
        // The first moveto is always absolute
        if (i == 0 && cmd == 'm') cmd = 'M'
        const rel = cmd != cmd.toUpperCase()
        const map = rel ? vector : point
        const ox = rel ? x : 0
        const oy = rel ? y : 0
        switch (cmd.toUpperCase()) {
            case 'Z':
                x = startX
                y = startY
                return cmd
            case 'H':
            case 'V': {
                const isH = cmd.toUpperCase() == 'H'
                const dx = isH ? args[0] - (rel ? 0 : x) : 0
                const dy = isH ? 0 : args[0] - (rel ? 0 : y)
                x += dx
                y += dy
                if (!angle) return svgAttr`${cmd} ${args[0]}`
                return svgAttr`l ${vector(dx, dy)}`
            }
            case 'A':
                x = ox + args[5]
                y = oy + args[6]
                return svgAttr`${cmd} ${args[0]} ${args[1]} ${args[2] + angle} ${args[3]} ${args[4]} ${map(args[5], args[6])}`
            default: {
                const points: string[] = []
                for (let j = 0; j < args.length; j += 2) points.push(map(args[j], args[j + 1]))
                x = ox + args[args.length - 2]
                y = oy + args[args.length - 1]
                if (cmd == 'M' || cmd == 'm') {
                    startX = x
                    startY = y
                }
                return svgAttr`${cmd} ${points.join(' ')}`
            }
        }
    }).join(' ')
}

function shapeToPath(el: Element) {
    const num = (name: string) => parseFloat(el.getAttribute(name) || '0') || 0
    switch (el.tagName) {
        case 'path':
            return el.getAttribute('d') || ''
        case 'rect': {
            const x = num('x')
            const y = num('y')
            const w = num('width')
            const h = num('height')
            let rX = el.hasAttribute('rx') ? num('rx') : num('ry')
            let rY = el.hasAttribute('ry') ? num('ry') : rX
            rX = Math.min(Math.max(rX, 0), w / 2)
            rY = Math.min(Math.max(rY, 0), h / 2)
            if (w <= 0 || h <= 0) return ''
            if (!rX || !rY) return svgAttr`M ${x} ${y} v ${h} h ${w} v ${-h} z`
            return svgAttr`M ${x} ${y + rY}
                v ${h - 2 * rY}
                a ${rX} ${rY} 0 0 0 ${rX} ${rY}
                h ${w - 2 * rX}
                a ${rX} ${rY} 0 0 0 ${rX} ${-rY}
                v ${-h + 2 * rY}
                a ${rX} ${rY} 0 0 0 ${-rX} ${-rY}
                h ${-w + 2 * rX}
                a ${rX} ${rY} 0 0 0 ${-rX} ${rY}
                z`
        }
        case 'circle':
        case 'ellipse': {
            const cx = num('cx')
            const cy = num('cy')
            const rX = el.tagName == 'circle' ? num('r') : num('rx')
            const rY = el.tagName == 'circle' ? rX : num('ry')
            if (rX <= 0 || rY <= 0) return ''
            return svgAttr`M ${cx - rX} ${cy}
                a ${rX} ${rY} 0 1 0 ${2 * rX} 0
                a ${rX} ${rY} 0 1 0 ${-2 * rX} 0
                z`
        }
        case 'polygon':
            return `M ${el.getAttribute('points') || ''} z`
        default:
            return undefined
    }
}

/**
 * Merge clip path shapes into a single path per clip rule, so the result can be drawn as a plain filled path
 *
 * @returns Path data grouped by clip rule, or undefined if any of the shapes can't be expressed as a path
 */
export function mergeShapes(elements: Element[]) {
    const rotateRx = /^\s*rotate\(\s*([-+.\deE]+)(?:[\s,]+([-+.\deE]+)[\s,]+([-+.\deE]+))?\s*\)\s*$/
    const paths: Record<string, string[]> = {}

    for (const el of elements) {
        if (el.hasAttribute('clip-path')) return undefined

        const d = shapeToPath(el)
        if (d === undefined) return undefined
        if (!d) continue

        const transform = el.getAttribute('transform')
        const m = transform ? rotateRx.exec(transform) : undefined
        if (m === null) return undefined
        const rotated = m ? rotatePath(d, parseFloat(m[1]), parseFloat(m[2] || '0'), parseFloat(m[3] || '0')) : rotatePath(d)
        if (rotated === undefined) return undefined

        const rule = el.getAttribute('clip-rule') == 'evenodd' ? 'evenodd' : 'nonzero'
        if (!paths[rule]) paths[rule] = []
        paths[rule].push(rotated)
    }

    return Object.entries(paths).map(([rule, d]) => ({ rule, d: d.join(' ') }))
}

export interface SVGPadding {
    left: number
    top: number
    right: number
    bottom: number
}

/**
 * Extend the SVG by a uniform (non-negative) padding, or by the given amount on each side
 */
export function extendSVG(svg: SVGSVGElement, padding: number | Partial<SVGPadding>) {
    if (typeof padding == 'number') padding = { left: Math.max(padding, 0), top: Math.max(padding, 0), right: Math.max(padding, 0), bottom: Math.max(padding, 0) }
    const { left = 0, top = 0, right = 0, bottom = 0 } = padding
    svg.setAttribute('width', numToAttr(parseFloat(svg.getAttribute('width') || '0') + left + right))
    svg.setAttribute('height', numToAttr(parseFloat(svg.getAttribute('height') || '0') + top + bottom))
    const vb = (svg.getAttribute('viewBox') || '').split(' ').map(parseFloat)
    if (vb.length >= 4) {
        vb[0] -= left
        vb[1] -= top
        vb[2] += left + right
        vb[3] += top + bottom
    }
    svg.setAttribute('viewBox', vb.map(numToAttr).join(' '))
    if (vb.length < 4)
        return undefined
    return {
        left: vb[0],
        right: vb[2] + vb[0],
        top: vb[1],
        bottom: vb[3] + vb[1]
    }
}
