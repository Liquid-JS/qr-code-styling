/**
 * @license -------------------------------------------------------------------
 *    module: Lanczos Resampling
 *       src: http://blog.yoz.sk/2010/11/lanczos-resampling-with-actionscript/
 *   authors: Jozef Chutka
 * copyright: (c) 2009-2010 Jozef Chutka
 *   license: MIT
 * -------------------------------------------------------------------
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without
 * restriction, including without limitation the rights to use,
 * copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following
 * conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
 * OTHER DEALINGS IN THE SOFTWARE.
 */

export type Kernel = (size: number, x: number) => number

export enum KernelType {
    Lanczos = 'lanczos',
    Linear = 'linear'
}

const CACHE_PRECISION = 1000

export const Kernels: { [P in KernelType]: Kernel } = {
    [KernelType.Lanczos]: (size, x) => {
        if (x >= size || x <= -size) return 0
        if (x === 0) return 1
        const xpi = x * Math.PI
        return size * Math.sin(xpi) * Math.sin(xpi / size) / (xpi * xpi)
    },
    [KernelType.Linear]: (size, x) => {
        x = Math.abs(x)
        if (x <= 1) return (1 - x) * size
        return 0
    }
}

function createCache(kernel: Kernel, cachePrecision: number, filterSize: number) {
    const cache: { [key: number]: number } = {}
    const max = filterSize * filterSize * cachePrecision
    const iPrecision = 1.0 / cachePrecision
    for (let cacheKey = 0; cacheKey < max; cacheKey++) {
        const value = kernel(filterSize, Math.sqrt(cacheKey * iPrecision))
        cache[cacheKey] = value < 0 ? 0 : value
    }
    return cache
}

function baseLength(val: number | SVGAnimatedLength) {
    if (typeof val == 'object') {
        val.baseVal.convertToSpecifiedUnits(val.baseVal.SVG_LENGTHTYPE_PX)
        return val.baseVal.value
    }
    return val
}

export function lanczosResize(canvas: HTMLCanvasElement | OffscreenCanvas, opt: {
    width: number
    height: number
}, kernel = Kernels[KernelType.Lanczos]): ImageData {
    const cwidth = baseLength((canvas as any).width)
    const cheight = baseLength((canvas as any).height)
    const ctx = canvas.getContext('2d')!

    const { width, height } = opt

    const src = ctx.getImageData(0, 0, cwidth, cheight)
    let dst = ctx.createImageData(width, height)

    // No need to resize
    if (src.data.length == dst.data.length) {
        dst = src
    } else {
        const sdata = src.data
        const ddata = dst.data

        const values = []
        const sX = width / cwidth
        const sY = height / cheight

        let filterSize = 3
        if (sX > 0.01 && sY > 0.01 && sX < 1 && sY < 1) {
            if (sX <= 0.2 || sY <= 0.2) {
                filterSize = 2
            } else if (sX <= 0.05 || sY <= 0.05) {
                filterSize = 1
            } else {
                filterSize = 3
            }
        }
        const sw1 = cwidth - 1
        const sh1 = cheight - 1
        const isx = 1.0 / sX
        const isy = 1.0 / sX
        const cw = 1.0 / width
        const ch = 1.0 / height
        const csx = Math.min(1, sX) * Math.min(1, sX)
        const csy = Math.min(1, sX) * Math.min(1, sX)
        const cachePrecision = CACHE_PRECISION
        // filterSize = filterSize || FILTER_SIZE
        const cache = createCache(kernel, cachePrecision, filterSize)
        let y = height

        while (y--) {
            const sourcePixelY = (y + 0.5) * isy
            let y1b = sourcePixelY - filterSize
            if (y1b < 0) y1b = 0
            let y1e = sourcePixelY + filterSize
            const y1et = y1e
            if (y1e != y1et) y1e = y1et + 1
            if (y1e > sh1) y1e = sh1
            const cy = y * ch - sourcePixelY
            const y3 = y * width
            let x = width
            while (x--) {
                const sourcePixelX = (x + 0.5) * isx
                let x1b = sourcePixelX - filterSize
                if (x1b < 0) x1b = 0
                let x1e = sourcePixelX + filterSize
                const x1et = x1e
                if (x1e != x1et) x1e = x1et + 1
                if (x1e > sw1) x1e = sw1
                const cx = x * cw - sourcePixelX
                let i = 0
                let total = 0
                for (let y1 = y1b >> 0; y1 <= y1e; y1++) {
                    const distanceY = (y1 + cy) * (y1 + cy) * csy
                    for (let x1 = x1b >> 0; x1 <= x1e; x1++) {
                        total += values[i++] = cache[((x1 + cx) * (x1 + cx) * csx + distanceY) * cachePrecision >> 0] || 0
                    }
                }
                total = 1.0 / total
                i = 0
                let a = 0
                let r = 0
                let g = 0
                let b = 0
                for (let y1 = y1b >> 0; y1 <= y1e; y1++) {
                    const y2 = y1 * cwidth
                    for (let x1 = x1b >> 0; x1 <= x1e; x1++) {
                        const value = values[i++] * total
                        const idxi = ((y2 + x1) >> 0) * 4
                        r += sdata[idxi] * value
                        g += sdata[idxi + 1] * value
                        b += sdata[idxi + 2] * value
                        a += sdata[idxi + 3] * value
                    }
                }
                const idx = ((x + y3) >> 0) * 4
                ddata[idx] = r
                ddata[idx + 1] = g
                ddata[idx + 2] = b
                ddata[idx + 3] = a
            }
        }
    }

    return dst
}
