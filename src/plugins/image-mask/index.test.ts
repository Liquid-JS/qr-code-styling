import { suite, test } from '@testdeck/mocha'
import { expect } from 'chai'
import { QRCodeStyling } from '../../core/qr-code-styling.js'
import type { browserImageTools } from '../../tools/browser-image-tools.js'
import type { Options, Plugin } from '../../utils/options.js'
import { findSquare, pathToPolygons, rasterizePolygons } from './raster.js'
import ImageMaskPlugin from './index.js'

const image = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAQAAAAnOwc2AAAAEUlEQVR42mNk+M+AARiHsiAAcCIKAYwFoQ8AAAAASUVORK5CYII='

@suite('Test ImageMaskPlugin')
export class ImageMaskPluginTest {
    @test('Find the largest square in a rectangle')
    rectangle() {
        const square = findSquare(pathToPolygons('M 0 0 H 200 V 100 H 0 Z')!, 'nonzero', 200, 0, 0)!
        expect(square.size).to.be.closeTo(100, 1)
        // Squares touching the edge are preferred
        expect(Math.min(square.x, 100 - square.x)).to.be.closeTo(0, 1)
        expect(square.y).to.be.closeTo(0, 1)
    }

    @test('Respect the fill rule')
    fillRule() {
        const polygons = pathToPolygons('M 0 0 H 100 V 100 H 0 Z M 40 40 H 60 V 60 H 40 Z')!
        expect(findSquare(polygons, 'nonzero', 200, 0, 0)!.size).to.be.closeTo(100, 1)
        expect(findSquare(polygons, 'evenodd', 200, 0, 0)!.size).to.be.closeTo(40, 1)
    }

    @test('Ignore hairline gaps as noise')
    noise() {
        // Two cells wide gap
        const polygons = pathToPolygons('M 0 0 H 74.25 V 100 H 0 Z M 75.75 0 H 150 V 100 H 75.75 Z')!
        expect(findSquare(polygons, 'nonzero', 200, 0, 0)!.size).to.be.closeTo(74, 1.5)
        expect(findSquare(polygons, 'nonzero', 200, 0, 0.02)!.size).to.be.closeTo(100, 1)
    }

    @test('Honour zero option values')
    zeroOptions() {
        // Gap below the default noise threshold
        const path = 'M 0 0 H 74.5 V 100 H 0 Z M 75.5 0 H 150 V 100 H 75.5 Z'
        expect(new ImageMaskPlugin({ image, path, noise: 0 }).getSquare().size).to.be.closeTo(74.5, 1)
        expect(new ImageMaskPlugin({ image, path }).getSquare().size).to.be.closeTo(100, 1)
        const heart = 'M 256 464 C 120 360 32 280 32 176 A 112 112 0 0 1 256 128 A 112 112 0 0 1 480 176 C 480 280 392 360 256 464 Z'
        const largest = new ImageMaskPlugin({ image, path: heart, sizeTolerance: 0 }).getSquare().size
        expect(largest).to.be.at.least(new ImageMaskPlugin({ image, path: heart, sizeTolerance: 0.1 }).getSquare().size)
        expect(largest).to.be.greaterThan(new ImageMaskPlugin({ image, path: heart, sizeTolerance: 0.1 }).getSquare().size)
    }

    @test('Handle overlapping subpaths according to the fill rule')
    overlaps() {
        // nonzero fills the union, evenodd cuts the overlap out
        const polygons = pathToPolygons('M 0 0 H 100 V 100 H 0 Z M 50 50 H 150 V 150 H 50 Z')!
        expect(findSquare(polygons, 'nonzero', 200, 0, 0)!.size).to.be.closeTo(100, 1)
        expect(findSquare(polygons, 'evenodd', 200, 0, 0)!.size).to.be.closeTo(50, 1)
    }

    @test('Treat an opposite winding subpath as a hole')
    winding() {
        // Inner square wound the other way
        const polygons = pathToPolygons('M 0 0 H 100 V 100 H 0 Z M 40 40 V 60 H 60 V 40 Z')!
        expect(findSquare(polygons, 'nonzero', 200, 0, 0)!.size).to.be.closeTo(40, 1)
    }

    @test('Pick the largest area of a split path')
    split() {
        const polygons = pathToPolygons('M 200 0 H 260 V 60 H 200 Z M 0 0 H 100 V 100 H 0 Z')!
        const square = findSquare(polygons, 'nonzero', 200, 0, 0)!
        expect(square.size).to.be.closeTo(100, 1.5)
        expect(square.x).to.be.closeTo(0, 1.5)
        expect(square.y).to.be.closeTo(0, 1.5)
    }

    @test('Keep the square inside a concave shape with sharp edges')
    star() {
        const points: string[] = []
        for (let i = 0; i < 10; i++) {
            const r = i % 2 ? 40 : 100
            const a = (i * Math.PI) / 5 - Math.PI / 2
            points.push(`${100 + r * Math.cos(a)} ${100 + r * Math.sin(a)}`)
        }
        const polygons = pathToPolygons(`M ${points.join(' L ')} Z`)!
        const square = findSquare(polygons, 'nonzero', 200, 0, 0)!
        expect(square.size).to.be.greaterThan(40)
        const n = 50
        const grid = rasterizePolygons(polygons, 'nonzero', square.x, square.y, square.size / n, n, n)
        expect(grid.every((col) => col.every((v) => v))).to.equal(true)
    }

    @test('Approximate arcs accurately')
    arcs() {
        const plugin = new ImageMaskPlugin({
            image,
            path: 'M 0 100 A 100 100 0 1 1 200 100 A 100 100 0 1 1 0 100 Z',
            resolution: 400,
            sizeTolerance: 0,
            noise: 0
        })
        expect(plugin.getSquare().size).to.be.closeTo(100 * Math.SQRT2, 1.5)
    }

    @test('Cache the mask and the image between runs')
    async cache() {
        const calls = { size: 0, url: 0 }
        const imageTools: typeof browserImageTools = {
            getSize: async () => {
                calls.size++
                return { width: 10, height: 10 }
            },
            toDataURL: async (src) => {
                calls.url++
                return typeof src == 'string' ? src : `data:image/png;base64,${Buffer.from(src as Buffer).toString('base64')}`
            }
        }
        // New instances share the global cache
        ImageMaskPlugin.clearCache()
        const create = () => new ImageMaskPlugin({ image, path: 'M 0 0 H 10 V 10 H 0 Z' })
        const first = create().applyMask(25)
        expect(create().applyMask(25).mask).to.equal(first.mask)
        expect(create().applyMask(29).mask).to.not.equal(first.mask)

        const qrCode = new QRCodeStyling({ data: 'TEST', imageTools, plugins: [create()] })
        await qrCode.serialize()
        qrCode.update({ data: 'TEST 2', plugins: [create()] })
        await qrCode.serialize()
        expect(calls).to.deep.equal({ size: 1, url: 1 })

        const buffer = Buffer.from(image.split(',')[1], 'base64')
        qrCode.update({ plugins: [new ImageMaskPlugin({ image: buffer, path: 'M 0 0 H 10 V 10 H 0 Z' })] })
        await qrCode.serialize()
        qrCode.update({ plugins: [new ImageMaskPlugin({ image: buffer, path: 'M 0 0 H 10 V 10 H 0 Z' })] })
        await qrCode.serialize()
        expect(calls).to.deep.equal({ size: 2, url: 2 })
    }

    @test('Receive the applied mask in postProcess and yield to an earlier mask')
    async appliedMask() {
        let applied: Options['mask']
        const recorder: Plugin = {
            postProcess: (_svg, options) => {
                applied = options.mask
            }
        }
        const plugin = new ImageMaskPlugin({ image, path: 'M 0 0 H 10 V 10 H 0 Z' })
        const qrCode = new QRCodeStyling({ data: 'TEST', dotsOptions: { size: 10 }, plugins: [plugin, recorder] })
        await qrCode.serialize()
        const mask = plugin.applyMask(applied!.count)
        expect(applied!.mask).to.equal(mask.mask)
        expect(applied!.dotSize).to.equal(10)
        // The code is drawn at [0, 0]
        expect(applied!.count).to.equal(21)
        expect(applied!.x).to.equal(-mask.startX * 10)
        expect(applied!.y).to.equal(-mask.startY * 10)
        // The code fills the path, so the outline lies outside the mask
        const outline: boolean[] = []
        for (let i = -1; i <= 21; i++)
            for (let j = -1; j <= 21; j++)
                if (i < 0 || i >= 21 || j < 0 || j >= 21) outline.push(mask.mask[mask.startX + i][mask.startY + j])
        expect(outline.some((v) => v)).to.equal(false)

        // An earlier plugin's mask takes precedence
        const other: Plugin = {
            applyMask: (count) => ({ mask: Array.from({ length: count }, () => new Array<boolean>(count).fill(true)), startX: 0, startY: 0 })
        }
        const svg = (await new QRCodeStyling({ data: 'TEST', plugins: [other, new ImageMaskPlugin({ image, path: 'M 0 0 H 10 V 10 H 0 Z' })] }).serialize())!
        expect(svg).to.not.contain('<image ')
        expect(svg).to.contain('viewBox="0 0 ')
    }

    @test('Nudge the code against the edge of the area to shorten the outline')
    nudge() {
        // Taller than wide: the code hugs the top or bottom edge
        const plugin = new ImageMaskPlugin({ image, path: 'M 0 0 H 100 V 106 H 0 Z' })
        const mask = plugin.applyMask(21)
        const row = (j: number) => Array.from({ length: 21 }, (_v, i) => mask.mask[mask.startX + i][mask.startY + j])
        const above = row(-1).filter((v) => v).length
        const below = row(21).filter((v) => v).length
        expect(Math.min(above, below)).to.equal(0)
        expect(Math.max(above, below)).to.equal(21)
    }

    @test('Receive the QR code count and the required padding')
    async backgroundMode() {
        const calls: Array<[number, number]> = []
        const recorder: Plugin = {
            applyMask: (count, padding) => {
                calls.push([count, padding])
            }
        }
        const plugin = new ImageMaskPlugin({ image, path: 'M 0 0 H 100 V 100 H 0 Z' })
        for (const mode of ['center', 'background'] as const) {
            const svg = (await new QRCodeStyling({ data: 'TEST', image, imageOptions: { mode }, plugins: [recorder, plugin] }).serialize())!
            expect(svg).to.contain('<image ')
        }
        expect(calls).to.deep.equal([[21, 0], [21, 1]])

        const tight: Plugin = {
            applyMask: (count) => ({ mask: Array.from({ length: count }, () => new Array<boolean>(count).fill(true)), startX: 0, startY: 0 })
        }
        const padded: Plugin = {
            applyMask: (count, padding) => ({
                mask: Array.from({ length: count + 2 * padding }, () => new Array<boolean>(count + 2 * padding).fill(true)),
                startX: padding,
                startY: padding
            })
        }
        expect(() => new QRCodeStyling({ data: 'TEST', imageOptions: { mode: 'center' }, plugins: [tight] })).to.not.throw()
        expect(() => new QRCodeStyling({ data: 'TEST', imageOptions: { mode: 'background' }, plugins: [tight] })).to.throw(/1 segment/)
        expect(() => new QRCodeStyling({ data: 'TEST', imageOptions: { mode: 'background' }, plugins: [padded] })).to.not.throw()
    }

    @test('Fit the QR code into a circle and draw the image behind it')
    async plugin() {
        const plugin = new ImageMaskPlugin({
            image,
            path: 'M 5 0 A 5 5 0 1 1 5 10 A 5 5 0 1 1 5 0 Z'
        })
        const qrCode = new QRCodeStyling({
            data: 'TEST',
            image,
            imageOptions: { mode: 'center', imageSize: 0.3 },
            plugins: [plugin]
        })

        const square = plugin.getSquare()
        expect(square.size).to.be.closeTo(5 * Math.SQRT2, 0.2)
        expect(square.x).to.be.closeTo(5 - square.size / 2, 0.2)

        const svg = (await qrCode.serialize())!
        // Plugin image first, the code's own image kept
        expect(svg.match(/<image /g)).to.have.length(2)
        expect(svg.indexOf('<image ')).to.be.lessThan(svg.indexOf('<path '))
        // The SVG is extended to the image bounds
        const vb = svg.match(/viewBox="([^"]*)"/)![1]
        const img = svg.match(/<image [^>]*x="([^"]*)" y="([^"]*)" width="([^"]*)px" height="([^"]*)px"/)!
        expect(vb).to.equal(`${img[1]} ${img[2]} ${img[3]} ${img[4]}`)
        expect(svg).to.contain(`width="${img[3]}" height="${img[4]}"`)
        expect(svg).to.not.contain('clipPath')
    }
}
