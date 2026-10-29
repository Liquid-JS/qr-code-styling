import { parsePath } from '../../utils/svg.js'

export type Point = [number, number]
export type FillRule = 'nonzero' | 'evenodd'

export interface Square {
    x: number
    y: number
    size: number
}

/** Curve segments when no tolerance is given */
const CURVE_STEPS = 16
const MAX_CURVE_STEPS = 512

/**
 * Flatten path data into polygons (one per subpath), approximating curves with line segments
 *
 * @param tolerance Maximum deviation of the approximation; a fixed number of segments if not positive
 * @returns Polygons, or undefined if the path data is invalid
 */
export function pathToPolygons(d: string, tolerance = 0): Point[][] | undefined {
    const segments = parsePath(d)
    if (!segments) return undefined

    // Wang's formula
    const curveSteps = (factor: number, ...diffs: number[]) => {
        if (!(tolerance > 0)) return CURVE_STEPS
        let max = 0
        for (let i = 0; i < diffs.length; i += 2) max = Math.max(max, Math.hypot(diffs[i], diffs[i + 1]))
        return Math.min(MAX_CURVE_STEPS, Math.max(1, Math.ceil(Math.sqrt((factor * max) / tolerance))))
    }

    const polygons: Point[][] = []
    let polygon: Point[] = []
    let x = 0
    let y = 0
    let startX = 0
    let startY = 0
    // Last control point, reflected by S / T commands
    let ctrlX = 0
    let ctrlY = 0
    let prev = ''

    const flush = () => {
        if (polygon.length > 2) polygons.push(polygon)
        polygon = []
    }
    const lineTo = (px: number, py: number) => {
        polygon.push([px, py])
        x = px
        y = py
    }
    const cubicTo = (x1: number, y1: number, x2: number, y2: number, ex: number, ey: number) => {
        const sx = x
        const sy = y
        const steps = curveSteps(0.75, sx - 2 * x1 + x2, sy - 2 * y1 + y2, x1 - 2 * x2 + ex, y1 - 2 * y2 + ey)
        for (let s = 1; s <= steps; s++) {
            const t = s / steps
            const u = 1 - t
            lineTo(
                u * u * u * sx + 3 * u * u * t * x1 + 3 * u * t * t * x2 + t * t * t * ex,
                u * u * u * sy + 3 * u * u * t * y1 + 3 * u * t * t * y2 + t * t * t * ey
            )
        }
        ctrlX = x2
        ctrlY = y2
    }
    const quadTo = (x1: number, y1: number, ex: number, ey: number) => {
        const sx = x
        const sy = y
        const steps = curveSteps(0.25, sx - 2 * x1 + ex, sy - 2 * y1 + ey)
        for (let s = 1; s <= steps; s++) {
            const t = s / steps
            const u = 1 - t
            lineTo(u * u * sx + 2 * u * t * x1 + t * t * ex, u * u * sy + 2 * u * t * y1 + t * t * ey)
        }
        ctrlX = x1
        ctrlY = y1
    }
    const arcTo = (rx: number, ry: number, rotation: number, largeArc: number, sweep: number, ex: number, ey: number) => {
        const sx = x
        const sy = y
        rx = Math.abs(rx)
        ry = Math.abs(ry)
        if (!rx || !ry || (sx == ex && sy == ey)) {
            lineTo(ex, ey)
            return
        }

        // Endpoint to center parameterization, see SVG implementation notes F.6.5
        const phi = (rotation * Math.PI) / 180
        const cos = Math.cos(phi)
        const sin = Math.sin(phi)
        const dx = (sx - ex) / 2
        const dy = (sy - ey) / 2
        const x1 = cos * dx + sin * dy
        const y1 = -sin * dx + cos * dy
        const lambda = (x1 * x1) / (rx * rx) + (y1 * y1) / (ry * ry)
        if (lambda > 1) {
            rx *= Math.sqrt(lambda)
            ry *= Math.sqrt(lambda)
        }
        const num = rx * rx * ry * ry - rx * rx * y1 * y1 - ry * ry * x1 * x1
        const den = rx * rx * y1 * y1 + ry * ry * x1 * x1
        const coef = (largeArc != sweep ? 1 : -1) * Math.sqrt(Math.max(0, num / den))
        const cx1 = (coef * rx * y1) / ry
        const cy1 = (-coef * ry * x1) / rx
        const cx = cos * cx1 - sin * cy1 + (sx + ex) / 2
        const cy = sin * cx1 + cos * cy1 + (sy + ey) / 2

        const angle = (ux: number, uy: number, vx: number, vy: number) => {
            const sign = ux * vy - uy * vx < 0 ? -1 : 1
            const dot = ux * vx + uy * vy
            const len = Math.sqrt((ux * ux + uy * uy) * (vx * vx + vy * vy))
            return sign * Math.acos(Math.max(-1, Math.min(1, dot / len)))
        }
        const theta = angle(1, 0, (x1 - cx1) / rx, (y1 - cy1) / ry)
        let delta = angle((x1 - cx1) / rx, (y1 - cy1) / ry, (-x1 - cx1) / rx, (-y1 - cy1) / ry)
        if (!sweep && delta > 0) delta -= 2 * Math.PI
        else if (sweep && delta < 0) delta += 2 * Math.PI

        // Angle per segment keeping the sagitta within the tolerance
        const step = tolerance > 0
            ? 2 * Math.acos(Math.max(-1, 1 - tolerance / Math.max(rx, ry)))
            : Math.PI / CURVE_STEPS
        const steps = Math.min(MAX_CURVE_STEPS, Math.max(1, Math.ceil(Math.abs(delta) / step)))
        for (let s = 1; s <= steps; s++) {
            const a = theta + (delta * s) / steps
            lineTo(
                cos * rx * Math.cos(a) - sin * ry * Math.sin(a) + cx,
                sin * rx * Math.cos(a) + cos * ry * Math.sin(a) + cy
            )
        }
    }

    for (const [cmd, args] of segments) {
        const upper = cmd.toUpperCase()
        const rel = cmd != upper
        const ox = rel ? x : 0
        const oy = rel ? y : 0
        // Arguments alternate between x and y
        const abs = (i: number) => (i % 2 ? oy : ox) + args[i]

        switch (upper) {
            case 'M':
                flush()
                lineTo(abs(0), abs(1))
                startX = x
                startY = y
                break
            case 'Z':
                flush()
                lineTo(startX, startY)
                break
            case 'L':
                lineTo(abs(0), abs(1))
                break
            case 'H':
                lineTo(ox + args[0], y)
                break
            case 'V':
                lineTo(x, oy + args[0])
                break
            case 'C':
                cubicTo(abs(0), abs(1), abs(2), abs(3), abs(4), abs(5))
                break
            case 'S': {
                const reflect = prev == 'C' || prev == 'S'
                cubicTo(reflect ? 2 * x - ctrlX : x, reflect ? 2 * y - ctrlY : y, abs(0), abs(1), abs(2), abs(3))
                break
            }
            case 'Q':
                quadTo(abs(0), abs(1), abs(2), abs(3))
                break
            case 'T': {
                const reflect = prev == 'Q' || prev == 'T'
                quadTo(reflect ? 2 * x - ctrlX : x, reflect ? 2 * y - ctrlY : y, abs(0), abs(1))
                break
            }
            case 'A':
                arcTo(args[0], args[1], args[2], args[3], args[4], ox + args[5], oy + args[6])
                break
            default:
                break
        }
        prev = upper
    }
    flush()
    return polygons
}

export function polygonBounds(polygons: Point[][]) {
    let minX = Infinity
    let minY = Infinity
    let maxX = -Infinity
    let maxY = -Infinity
    for (const polygon of polygons)
        for (const [px, py] of polygon) {
            if (px < minX) minX = px
            if (px > maxX) maxX = px
            if (py < minY) minY = py
            if (py > maxY) maxY = py
        }
    return { minX, minY, maxX, maxY }
}

/** Cells (0 / 1) indexed as data[column * rows + row] */
interface Grid {
    cols: number
    rows: number
    data: Uint8Array
}

function rasterize(polygons: Point[][], rule: FillRule, x0: number, y0: number, cell: number, cols: number, rows: number): Grid {
    const data = new Uint8Array(cols * rows)

    const edges: Array<[Point, Point]> = []
    for (const polygon of polygons)
        for (let i = 0; i < polygon.length; i++) {
            const a = polygon[i]
            const b = polygon[(i + 1) % polygon.length]
            if (a[1] != b[1]) edges.push([a, b])
        }

    for (let j = 0; j < rows; j++) {
        const y = y0 + (j + 0.5) * cell
        // Scanline crossings as [x, direction]
        const crossings: Array<[number, number]> = []
        for (const [a, b] of edges) {
            if ((a[1] <= y) == (b[1] <= y)) continue
            crossings.push([a[0] + ((y - a[1]) * (b[0] - a[0])) / (b[1] - a[1]), b[1] > a[1] ? 1 : -1])
        }
        crossings.sort((p, q) => p[0] - q[0])

        let k = 0
        let winding = 0
        let count = 0
        for (let i = 0; i < cols; i++) {
            const x = x0 + (i + 0.5) * cell
            while (k < crossings.length && crossings[k][0] <= x) {
                winding += crossings[k][1]
                count++
                k++
            }
            if (rule == 'evenodd' ? count % 2 == 1 : winding != 0) data[i * rows + j] = 1
        }
    }
    return { cols, rows, data }
}

/**
 * Sample the filled area at cell centers, as grid[column][row]
 */
export function rasterizePolygons(
    polygons: Point[][],
    rule: FillRule,
    x0: number,
    y0: number,
    cell: number,
    cols: number,
    rows: number
): boolean[][] {
    const { data } = rasterize(polygons, rule, x0, y0, cell, cols, rows)
    return Array.from({ length: cols }, (_col, i) => Array.from({ length: rows }, (_cell, j) => data[i * rows + j] == 1))
}

/**
 * Separable max (dilate) or min (erode) filter using running sums; cells outside the grid are ignored
 */
function filterGrid({ cols, rows, data }: Grid, radius: number, max: boolean): Grid {
    const pass = (source: Uint8Array, length: number, count: number, stride: number, step: number) => {
        const out = new Uint8Array(source.length)
        const sums = new Int32Array(length + 1)
        for (let n = 0; n < count; n++) {
            const base = n * stride
            for (let i = 0; i < length; i++) sums[i + 1] = sums[i] + source[base + i * step]
            for (let i = 0; i < length; i++) {
                const from = Math.max(0, i - radius)
                const to = Math.min(length, i + radius + 1)
                const ones = sums[to] - sums[from]
                if (max ? ones > 0 : ones == to - from) out[base + i * step] = 1
            }
        }
        return out
    }
    const vertical = pass(data, rows, cols, rows, 1)
    return { cols, rows, data: pass(vertical, cols, rows, 1, rows) }
}

function closeFlat(grid: Grid, radius: number) {
    if (radius < 1) return grid
    return filterGrid(filterGrid(grid, radius, true), radius, false)
}

/**
 * Close gaps smaller than about twice the radius (in cells)
 */
export function closeGrid(grid: boolean[][], radius: number) {
    if (radius < 1) return grid
    const cols = grid.length
    const rows = grid[0]?.length || 0
    const data = new Uint8Array(cols * rows)
    for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) if (grid[i][j]) data[i * rows + j] = 1
    const closed = closeFlat({ cols, rows, data }, radius).data
    return Array.from({ length: cols }, (_col, i) => Array.from({ length: rows }, (_cell, j) => closed[i * rows + j] == 1))
}

/**
 * Label 4-connected areas: each cell's label (-1 if empty) and the areas' centers
 */
function labelAreas({ cols, rows, data }: Grid) {
    const labels = new Int32Array(cols * rows).fill(-1)
    const centers: Point[] = []
    const stack: number[] = []
    for (let idx = 0; idx < data.length; idx++) {
        if (!data[idx] || labels[idx] >= 0) continue
        const label = centers.length
        let sumX = 0
        let sumY = 0
        let n = 0
        labels[idx] = label
        stack.push(idx)
        while (stack.length) {
            const c = stack.pop()!
            const ci = Math.floor(c / rows)
            const cj = c - ci * rows
            sumX += ci + 0.5
            sumY += cj + 0.5
            n++
            const neighbours = [cj > 0 ? c - 1 : -1, cj < rows - 1 ? c + 1 : -1, ci > 0 ? c - rows : -1, ci < cols - 1 ? c + rows : -1]
            for (const nb of neighbours)
                if (nb >= 0 && data[nb] && labels[nb] < 0) {
                    labels[nb] = label
                    stack.push(nb)
                }
        }
        centers.push([sumX / n, sumY / n])
    }
    return { labels, centers }
}

/** Sampled area around the square, for validating nudges */
export interface AreaWindow {
    x0: number
    y0: number
    cell: number
    cols: number
    rows: number
    data: Uint8Array
}

export interface AreaAnalysis {
    square: Square
    window: AreaWindow
}

/**
 * Whether all window cells centered within the square are inside the area
 */
export function squareFits({ x0, y0, cell, cols, rows, data }: AreaWindow, x: number, y: number, size: number) {
    const i0 = Math.ceil((x - x0) / cell - 0.5)
    const i1 = Math.floor((x + size - x0) / cell - 0.5)
    const j0 = Math.ceil((y - y0) / cell - 0.5)
    const j1 = Math.floor((y + size - y0) / cell - 0.5)
    if (i0 < 0 || j0 < 0 || i1 >= cols || j1 >= rows) return false
    for (let i = i0; i <= i1; i++)
        for (let j = j0; j <= j1; j++)
            if (!data[i * rows + j]) return false
    return true
}

/**
 * Largest square inside the filled area; among squares within the tolerance of the largest, prefer those
 * touching the edge the most, then the one closest to the center of its connected area
 *
 * @param resolution Sampling cells along the longer side of the area
 * @param noise Gaps and edge irregularities smaller than this fraction of the area size are ignored
 * @returns Square and the sampled area around it, or undefined if the area is empty
 */
export function analyzeArea(polygons: Point[][], rule: FillRule, resolution = 2000, tolerance = 0.02, noise = 0.01): AreaAnalysis | undefined {
    const { minX, minY, maxX, maxY } = polygonBounds(polygons)
    const cell = Math.max(maxX - minX, maxY - minY) / resolution
    if (!(cell > 0)) return undefined
    const cols = Math.ceil((maxX - minX) / cell)
    const rows = Math.ceil((maxY - minY) / cell)
    const grid = closeFlat(rasterize(polygons, rule, minX, minY, cell, cols, rows), Math.round((noise * resolution) / 2))
    const { data } = grid

    // Size of the largest square with its bottom-right cell at [i, j]
    const sizes = new Uint16Array(cols * rows)
    let max = 0
    for (let i = 0; i < cols; i++)
        for (let j = 0; j < rows; j++) {
            const idx = i * rows + j
            if (!data[idx]) continue
            const size = i && j ? 1 + Math.min(sizes[idx - rows], sizes[idx - 1], sizes[idx - rows - 1]) : 1
            sizes[idx] = size
            if (size > max) max = size
        }
    if (!max) return undefined

    // Running sums, to count filled cells along a square's sides
    const colSums = new Int32Array(cols * (rows + 1))
    const rowSums = new Int32Array((cols + 1) * rows)
    for (let i = 0; i < cols; i++)
        for (let j = 0; j < rows; j++) {
            colSums[i * (rows + 1) + j + 1] = colSums[i * (rows + 1) + j] + data[i * rows + j]
            rowSums[(i + 1) * rows + j] = rowSums[i * rows + j] + data[i * rows + j]
        }
    const alongColumn = (i: number, j0: number, j1: number) => i < 0 || i >= cols ? 0 : colSums[i * (rows + 1) + Math.min(rows, j1)] - colSums[i * (rows + 1) + Math.max(0, j0)]
    const alongRow = (j: number, i0: number, i1: number) => j < 0 || j >= rows ? 0 : rowSums[Math.min(cols, i1) * rows + j] - rowSums[Math.max(0, i0) * rows + j]

    const { labels, centers } = labelAreas(grid)
    const threshold = max * (1 - tolerance)
    let best: { i: number, j: number, size: number, edge: number, dist: number } | undefined
    for (let i = 0; i < cols; i++)
        for (let j = 0; j < rows; j++) {
            const idx = i * rows + j
            const size = sizes[idx]
            if (size < threshold) continue
            const i0 = i + 1 - size
            const j0 = j + 1 - size
            const edge = alongRow(j0 - 1, i0, i + 1) + alongRow(j + 1, i0, i + 1) + alongColumn(i0 - 1, j0, j + 1) + alongColumn(i + 1, j0, j + 1)
            const [centerX, centerY] = centers[labels[idx]]
            const dist = Math.hypot(i + 1 - size / 2 - centerX, j + 1 - size / 2 - centerY)
            if (
                !best ||
                edge < best.edge ||
                (edge == best.edge && (dist < best.dist || (dist == best.dist && size > best.size)))
            )
                best = { i, j, size, edge, dist }
        }

    const square = {
        x: minX + (best!.i + 1 - best!.size) * cell,
        y: minY + (best!.j + 1 - best!.size) * cell,
        size: best!.size * cell
    }

    // Window of 10% around the square
    const pad = Math.ceil(best!.size * 0.1)
    const wi0 = Math.max(0, best!.i + 1 - best!.size - pad)
    const wj0 = Math.max(0, best!.j + 1 - best!.size - pad)
    const wi1 = Math.min(cols, best!.i + 1 + pad)
    const wj1 = Math.min(rows, best!.j + 1 + pad)
    const wcols = wi1 - wi0
    const wrows = wj1 - wj0
    const wdata = new Uint8Array(wcols * wrows)
    for (let i = 0; i < wcols; i++) wdata.set(data.subarray((wi0 + i) * rows + wj0, (wi0 + i) * rows + wj1), i * wrows)
    return { square, window: { x0: minX + wi0 * cell, y0: minY + wj0 * cell, cell, cols: wcols, rows: wrows, data: wdata } }
}

/**
 * See analyzeArea
 */
export function findSquare(polygons: Point[][], rule: FillRule, resolution?: number, tolerance?: number, noise?: number): Square | undefined {
    return analyzeArea(polygons, rule, resolution, tolerance, noise)?.square
}
