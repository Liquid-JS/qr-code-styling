import { Gradient, GradientType } from './gradient.js'
import { numToAttr } from './svg.js'

export function parseColor(cstr: string) {
    let m: RegExpExecArray | null
    let parts: string[] | number[] = []
    let alpha = 1

    cstr = cstr.toLowerCase()

    if (cstr[0] === '#') {
        const base = cstr.slice(1)
        const size = base.length
        const isShort = size <= 4

        if (isShort) {
            parts = [parseInt(base[0] + base[0], 16), parseInt(base[1] + base[1], 16), parseInt(base[2] + base[2], 16)]
            if (size === 4) {
                alpha = parseInt(base[3] + base[3], 16) / 255
            }
        } else {
            parts = [parseInt(base[0] + base[1], 16), parseInt(base[2] + base[3], 16), parseInt(base[4] + base[5], 16)]
            if (size === 8) {
                alpha = parseInt(base[6] + base[7], 16) / 255
            }
        }

        if (!parts[0]) parts[0] = 0
        if (!parts[1]) parts[1] = 0
        if (!parts[2]) parts[2] = 0
    } else if ((m = /^((?:rgba?))\s*\(([^)]*)\)/.exec(cstr))) {
        const dims = 3
        parts = m[2].trim().split(/\s*[,/]\s*|\s+/)

        parts = parts.map((x, i) => {
            if (x[x.length - 1] === '%') {
                const v = parseFloat(x) / 100
                if (i === 3) return v
                return v * 255
            }

            if (x === 'none') return 0
            return parseFloat(x)
        })

        alpha = parts.length > dims ? parts.pop()! : 1
    } else {
        return {
            value: cstr,
            alpha
        }
    }

    const value = '#' + parts.map((v) => Math.max(0, Math.min(255, v)).toString(16).padStart(2, '0')).join('')
    return {
        value,
        alpha: Math.max(0, Math.min(1, alpha))
    }
}

export function createColor({
    options,
    color,
    additionalRotation,
    x,
    y,
    height,
    width,
    name,
    dotSize: size,
    document
}: {
    options?: Gradient
    color?: string
    additionalRotation: number
    x: number
    y: number
    height: number
    width: number
    name: string
    dotSize: number
    document: Document
}): {
    gradient?: SVGElement
    value: string
    opacity: number
} | undefined {
    const gradientSize = width > height ? width : height

    x -= size
    y -= size
    width += 2 * size
    height += 2 * size

    if (options) {
        let gradient: SVGElement
        if (options.type === GradientType.radial) {
            gradient = document.createElementNS('http://www.w3.org/2000/svg', 'radialGradient')
            gradient.setAttribute('id', name)
            gradient.setAttribute('gradientUnits', 'userSpaceOnUse')
            gradient.setAttribute('fx', numToAttr(x + width / 2))
            gradient.setAttribute('fy', numToAttr(y + height / 2))
            gradient.setAttribute('cx', numToAttr(x + width / 2))
            gradient.setAttribute('cy', numToAttr(y + height / 2))
            gradient.setAttribute('r', numToAttr(gradientSize / 2))
        } else {
            const rotation = ((options.rotation || 0) + additionalRotation) % (2 * Math.PI)
            const positiveRotation = (rotation + 2 * Math.PI) % (2 * Math.PI)
            let x0 = x + width / 2
            let y0 = y + height / 2
            let x1 = x + width / 2
            let y1 = y + height / 2

            if (
                (positiveRotation >= 0 && positiveRotation <= 0.25 * Math.PI) ||
                (positiveRotation > 1.75 * Math.PI && positiveRotation <= 2 * Math.PI)
            ) {
                x0 = x0 - width / 2
                y0 = y0 - (height / 2) * Math.tan(rotation)
                x1 = x1 + width / 2
                y1 = y1 + (height / 2) * Math.tan(rotation)
            } else if (positiveRotation > 0.25 * Math.PI && positiveRotation <= 0.75 * Math.PI) {
                y0 = y0 - height / 2
                x0 = x0 - width / 2 / Math.tan(rotation)
                y1 = y1 + height / 2
                x1 = x1 + width / 2 / Math.tan(rotation)
            } else if (positiveRotation > 0.75 * Math.PI && positiveRotation <= 1.25 * Math.PI) {
                x0 = x0 + width / 2
                y0 = y0 + (height / 2) * Math.tan(rotation)
                x1 = x1 - width / 2
                y1 = y1 - (height / 2) * Math.tan(rotation)
            } else if (positiveRotation > 1.25 * Math.PI && positiveRotation <= 1.75 * Math.PI) {
                y0 = y0 + height / 2
                x0 = x0 + width / 2 / Math.tan(rotation)
                y1 = y1 - height / 2
                x1 = x1 - width / 2 / Math.tan(rotation)
            }

            gradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient')
            gradient.setAttribute('id', name)
            gradient.setAttribute('gradientUnits', 'userSpaceOnUse')
            gradient.setAttribute('x1', numToAttr(x0))
            gradient.setAttribute('y1', numToAttr(y0))
            gradient.setAttribute('x2', numToAttr(x1))
            gradient.setAttribute('y2', numToAttr(y1))
        }

        options.colorStops.forEach((stopCfg: { offset: number, color: string }) => {
            const stop = document.createElementNS('http://www.w3.org/2000/svg', 'stop')
            stop.setAttribute('offset', `${numToAttr(100 * stopCfg.offset)}%`)

            const parsed = parseColor(stopCfg.color)
            stop.setAttribute('stop-color', parsed.value)
            if (parsed.alpha < 1) stop.setAttribute('stop-opacity', parsed.alpha.toFixed(7))
            gradient.appendChild(stop)
        })

        return {
            gradient,
            value: `url(#${name})`,
            opacity: 1
        }
    } else if (color) {
        const parsed = parseColor(color)

        return {
            value: parsed.value,
            opacity: parsed.alpha
        }
    }
    return
}
