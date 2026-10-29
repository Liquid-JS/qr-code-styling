import { browserImageTools } from '../../tools/browser-image-tools.js'
import { createImageElement } from '../../utils/image.js'
import type { GeneratorMask, Options, Plugin } from '../../utils/options.js'
import { extendSVG } from '../utils.js'
import { analyzeArea, AreaWindow, closeGrid, FillRule, pathToPolygons, Point, polygonBounds, rasterizePolygons, Square, squareFits } from './raster.js'

export interface ImageMaskPluginOptions {
    /** Image drawn behind the QR code */
    image: string | Buffer | Blob
    /** Path data (in the image coordinate space) outlining the area to fill with QR code segments */
    path: string
    /**
     * Fill rule of the path
     *
     * @default 'nonzero'
     */
    fillRule?: FillRule
    /**
     * Prefer squares up to this fraction smaller than the largest one if they touch the edge of the area
     * more, or are closer to its center
     *
     * @default 0.02
     */
    sizeTolerance?: number
    /**
     * Sampling cells along the longer side of the area
     *
     * @default 2000
     */
    resolution?: number
    /**
     * Gaps and edge irregularities smaller than this fraction of the area size are ignored
     *
     * @default 0.01
     */
    noise?: number
    /** See GeneratorMask.fitGradient */
    fitGradient?: boolean
    /**
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLImageElement/crossOrigin)
     */
    crossOrigin?: string
}

interface PathAnalysis {
    polygons: Point[][]
    bounds: ReturnType<typeof polygonBounds>
    square: Square
    window: AreaWindow
    /** By `count:margin` */
    masks: Map<string, { mask: GeneratorMask, origin: Point }>
}

type ImageData = Promise<[{ width: number, height: number }, string]>

// Global caches, as users likely create a new instance on every update; the oldest entries are evicted
const MAX_CACHE_SIZE = 32
const pathCache = new Map<string, PathAnalysis>()
const imageCache = new Map<string, ImageData>()
const imageObjectCache = new WeakMap<object, ImageData>()

function cached<T>(cache: Map<string, T>, key: string, create: () => T): T {
    let value = cache.get(key)
    if (value === undefined) {
        value = create()
        cache.set(key, value)
        if (cache.size > MAX_CACHE_SIZE) cache.delete(cache.keys().next().value!)
    }
    return value
}

/**
 * Fit the QR code into an area of an image outlined by a path, and draw the image behind the code
 */
export default class ImageMaskPlugin implements Plugin {
    private readonly fillRule: FillRule
    private readonly resolution: number
    private readonly sizeTolerance: number
    private readonly noise: number
    private analysis?: PathAnalysis

    constructor(private readonly pluginOptions: ImageMaskPluginOptions) {
        const clamp = (value: number | undefined, min: number, max: number, fallback: number) =>
            Number.isFinite(value) ? Math.min(max, Math.max(min, value!)) : fallback
        this.fillRule = pluginOptions.fillRule == 'evenodd' ? 'evenodd' : 'nonzero'
        this.resolution = Math.round(clamp(pluginOptions.resolution, 16, 4000, 2000))
        this.sizeTolerance = clamp(pluginOptions.sizeTolerance, 0, 0.9, 0.02)
        this.noise = clamp(pluginOptions.noise, 0, 0.5, 0.01)
    }

    /**
     * Drop the cached path analyses and images
     */
    static clearCache() {
        pathCache.clear()
        imageCache.clear()
    }

    /**
     * Square (in image coordinates) the QR code is fitted into, before nudging
     */
    getSquare() {
        return this.getAnalysis().square
    }

    private getAnalysis() {
        if (this.analysis) return this.analysis

        const { path } = this.pluginOptions
        const key = JSON.stringify([path, this.fillRule, this.resolution, this.sizeTolerance, this.noise])
        this.analysis = cached(pathCache, key, () => {
            // Coarse pass for the size, then flatten to within a quarter of a sampling cell
            const coarse = pathToPolygons(path)
            if (!coarse) throw new Error('Invalid path')
            const { minX, minY, maxX, maxY } = polygonBounds(coarse)
            const polygons = pathToPolygons(path, Math.max(maxX - minX, maxY - minY) / this.resolution / 4)!
            const area = analyzeArea(polygons, this.fillRule, this.resolution, this.sizeTolerance, this.noise)
            if (!area) throw new Error('The path has no filled area')
            return { polygons, bounds: polygonBounds(polygons), ...area, masks: new Map() }
        })
        return this.analysis
    }

    applyMask(count: number, padding = 0): GeneratorMask {
        const { polygons, bounds, square, window, masks } = this.getAnalysis()
        // Room around the code for the outline and nudging
        const margin = Math.max(2, Math.ceil(padding) || 0)
        const key = `${count}:${margin}`
        let entry = masks.get(key)
        if (!entry) {
            const { minX, minY, maxX, maxY } = bounds
            const cell = square.size / count
            const cells = (distance: number) => Math.max(margin, Math.ceil(distance / cell - 1e-6))
            // [s0, t0]: first segment of the code
            const s0 = cells(square.x - minX)
            const t0 = cells(square.y - minY)
            const cols = s0 + count + cells(maxX - square.x - square.size)
            const rows = t0 + count + cells(maxY - square.y - square.size)
            const origin: Point = [square.x - s0 * cell, square.y - t0 * cell]

            const grid = closeGrid(
                rasterizePolygons(polygons, this.fillRule, origin[0], origin[1], cell, cols, rows),
                Math.round((this.noise * Math.max(maxX - minX, maxY - minY)) / cell / 2)
            )

            // Nudge by up to one segment to minimize the drawn outline
            let best = { s: s0, t: t0, cost: Infinity }
            for (const [dx, dy] of [[0, 0], [-1, 0], [1, 0], [0, -1], [0, 1], [-1, -1], [1, -1], [-1, 1], [1, 1]]) {
                const si = s0 + dx
                const tj = t0 + dy
                if ((dx || dy) && !squareFits(window, origin[0] + si * cell, origin[1] + tj * cell, square.size)) continue
                let cost = 0
                for (let i = -1; i <= count; i++)
                    for (let j = -1; j <= count; j++)
                        if ((i < 0 || i >= count || j < 0 || j >= count) && grid[si + i][tj + j]) cost++
                if (cost < best.cost) best = { s: si, t: tj, cost }
            }

            const { s, t } = best
            // Sampling must not hide code segments
            for (let i = 0; i < count; i++)
                for (let j = 0; j < count; j++)
                    grid[s + i][t + j] = true

            entry = { mask: { mask: grid, startX: s, startY: t }, origin }
            masks.set(key, entry)
        }
        return { ...entry.mask, fitGradient: this.pluginOptions.fitGradient }
    }

    private getImageData(options: Options): ImageData {
        const { image, crossOrigin } = this.pluginOptions
        const imageTools = options.imageTools || browserImageTools
        const load = (): ImageData => Promise.all([imageTools.getSize(image, crossOrigin), imageTools.toDataURL(image)])

        if (typeof image == 'string')
            return cached(imageCache, JSON.stringify([crossOrigin, image]), load).catch((e: unknown) => {
                // Retry on the next run
                imageCache.delete(JSON.stringify([crossOrigin, image]))
                throw e
            })

        let data = imageObjectCache.get(image)
        if (!data) {
            data = load().catch((e: unknown) => {
                imageObjectCache.delete(image)
                throw e
            })
            imageObjectCache.set(image, data)
        }
        return data
    }

    async postProcess(svg: SVGSVGElement, options: Options) {
        const { mask } = options
        const { square, masks } = this.getAnalysis()
        // An earlier plugin's mask takes precedence
        const entry = mask && Array.from(masks.values()).find((m) => m.mask.mask === mask.mask)
        if (!mask || !entry) return
        const [{ width, height }, href] = await this.getImageData(options)

        // Image units per segment
        const cell = square.size / mask.count
        const scale = mask.dotSize / cell
        const x = mask.x - entry.origin[0] * scale
        const y = mask.y - entry.origin[1] * scale
        const w = width * scale
        const h = height * scale

        // Extend the SVG to the image bounds
        const vb = (svg.getAttribute('viewBox') || '').split(' ').map(parseFloat)
        extendSVG(svg, { left: vb[0] - x, top: vb[1] - y, right: x + w - vb[0] - vb[2], bottom: y + h - vb[1] - vb[3] })

        const element = createImageElement(options.document, href, { x, y, width: w, height: h })
        const defs = svg.getElementsByTagName('defs')[0]
        svg.insertBefore(element, defs ? defs.nextSibling : svg.firstChild)
    }
}
