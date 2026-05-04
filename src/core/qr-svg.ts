import { QRCodeMinimal } from '@liquid-js/qrcode-generator/lib/qrcode/QRCodeMinimal.js'
import { QRUtil } from '@liquid-js/qrcode-generator/lib/qrcode/QRUtil.js'
import { drawPluginCornerDot, getQrCornerDotFigure } from '../figures/corner-dot.js'
import { drawPluginCornerSquare, getQrCornerSquareFigure } from '../figures/corner-square.js'
import { getQrDotFigure } from '../figures/dot.js'
import { browserImageTools } from '../tools/browser-image-tools.js'
import { DrawArgs } from '../types/helper.js'
import { ColorElementValue, createColor } from '../utils/color.js'
import { Gradient } from '../utils/gradient.js'
import { calculateImageSize } from '../utils/image.js'
import { CornerDotType, CornerSquareType, DotType, ImageMode, Options, ShapeType } from '../utils/options.js'
import { getRng } from '../utils/random.js'
import { numToAttr } from '../utils/svg.js'

const squareMask = [
    [1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1]
]

const cornerSquareTypes = new Set<string>(Object.values(CornerSquareType))
function isCornerSquareType(val?: string): val is `${CornerSquareType}` {
    return !!(val && cornerSquareTypes.has(val))
}

const dotMask = [
    [0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0],
    [0, 0, 1, 1, 1, 0, 0],
    [0, 0, 1, 1, 1, 0, 0],
    [0, 0, 1, 1, 1, 0, 0],
    [0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0]
]

const cornerDotTypes = new Set<string>(Object.values(CornerDotType))
function isCornerDotType(val?: string): val is `${CornerDotType}` {
    return !!(val && cornerDotTypes.has(val))
}

export class QRSVG {
    private _element: SVGSVGElement
    private _fakeMatrix?: Array<Array<boolean | undefined>>
    private _dotsColor?: ColorElementValue
    private _backgroundColor?: ColorElementValue

    get element() {
        return this._element
    }

    get dotsColor() {
        return this._dotsColor
    }

    get backgroundColor() {
        return this._backgroundColor
    }

    private defs: SVGElement

    private backgroundMask?: SVGElement
    private dotsMask?: SVGElement
    private lightDotsMask?: SVGElement

    private qr?: QRCodeMinimal
    private document: Document
    private imageTools: typeof browserImageTools

    constructor(
        private options: Pick<
            Options,
            | 'width'
            | 'height'
            | 'size'
            | 'document'
            | 'imageTools'
            | 'image'
            | 'imageOptions'
            | 'dotsOptions'
            | 'cornersDotOptions'
            | 'cornersSquareOptions'
            | 'backgroundOptions'
            | 'shape'
            | 'plugins'
        > & { errorCorrectionPercent: number }
    ) {
        this.document = options.document
        this._element = this.document.createElementNS('http://www.w3.org/2000/svg', 'svg')
        const size = numToAttr(options.size)
        this._element.setAttribute('width', size)
        this._element.setAttribute('height', size)
        this._element.setAttribute('viewBox', `0 0 ${size} ${size}`)
        this.defs = this.document.createElementNS('http://www.w3.org/2000/svg', 'defs')
        this._element.appendChild(this.defs)
        this.imageTools = options.imageTools || browserImageTools
    }

    get width(): number {
        return this.options.size
    }

    get height(): number {
        return this.options.size
    }

    async drawQR(qr: QRCodeMinimal): Promise<void> {
        const count = qr.getModuleCount()
        const typeNumber = parseInt(((count - 17) / 4).toFixed(0), 10)
        const dotSize = this.options.dotsOptions.size
        let drawImageSize = {
            hideXDots: 0,
            hideYDots: 0,
            width: 0,
            height: 0
        }

        this.qr = qr

        if (this.options.image) {
            //We need it to get image size
            const size = await this.imageTools.getSize(this.options.image, this.options.imageOptions.crossOrigin)
            const { imageOptions, errorCorrectionPercent } = this.options

            if (imageOptions.mode == ImageMode.background) {
                const margin = (this.options.backgroundOptions && this.options.backgroundOptions.margin) || 0
                const maxSize = (this.options.size - 2 * margin * dotSize) * imageOptions.imageSize
                let { width, height } = size

                height = (height / width) * maxSize
                width = maxSize

                if (height > maxSize) {
                    width = (width / height) * maxSize
                    height = maxSize
                }

                drawImageSize = {
                    hideXDots: 0,
                    hideYDots: 0,
                    width,
                    height
                }
            } else {
                const coverLevel = imageOptions.imageSize * errorCorrectionPercent
                const alignment = QRUtil.getPatternPosition(typeNumber)
                const maxHiddenDots = Math.floor(
                    coverLevel * (count * count - 3 * 8 * 8 - 2 * (count - 16) - alignment.length ** 2 * 25)
                )

                drawImageSize = calculateImageSize({
                    originalWidth: size.width,
                    originalHeight: size.height,
                    maxHiddenDots,
                    maxHiddenAxisDots: count - 14,
                    dotSize,
                    margin: imageOptions.margin
                })
            }
        }

        this.drawBackground()

        if (
            this.options.imageOptions.mode != ImageMode.overlay &&
            this.options.image &&
            drawImageSize.width > 0 &&
            drawImageSize.height > 0
        ) {
            await this.drawImage({ width: drawImageSize.width, height: drawImageSize.height, count, dotSize })
        }

        this.drawDots((i: number, j: number): boolean => {
            if (this.options.imageOptions.mode == ImageMode.center) {
                if (
                    i >= (count - drawImageSize.hideXDots) / 2 &&
                    i < (count + drawImageSize.hideXDots) / 2 &&
                    j >= (count - drawImageSize.hideYDots) / 2 &&
                    j < (count + drawImageSize.hideYDots) / 2
                ) {
                    return false
                }
            }

            if ((i < 8 && j < 8) || (i >= count - 8 && j < 8) || (j >= count - 8 && i < 8)) return false

            return true
        })

        if (
            this.options.imageOptions.mode == ImageMode.overlay &&
            this.options.image &&
            drawImageSize.width > 0 &&
            drawImageSize.height > 0
        ) {
            await this.drawImage({ width: drawImageSize.width, height: drawImageSize.height, count, dotSize })
        }

        this.drawCorners()
    }

    drawBackground(): void {
        const options = this.options

        if (this._element && options.backgroundOptions) {
            const gradientOptions = options.backgroundOptions.gradient
            const color = options.backgroundOptions.color

            this._backgroundColor = this.createColor({
                options: gradientOptions,
                color,
                additionalRotation: 0,
                x: 0,
                y: 0,
                height: options.size,
                width: options.size,
                name: 'background-color'
            })

            const element = this.document.createElementNS('http://www.w3.org/2000/svg', 'rect')
            this.backgroundMask = this.createMask('mask-background-color')
            this.defs.appendChild(this.backgroundMask)

            element.setAttribute('x', numToAttr(0))
            element.setAttribute('y', numToAttr(0))
            element.setAttribute('width', numToAttr(options.size))
            element.setAttribute('height', numToAttr(options.size))
            element.setAttribute('rx', numToAttr((options.size / 2) * (options.backgroundOptions.round || 0)))

            this.backgroundMask.appendChild(element)
        }
    }

    drawDots(filter?: (i: number, j: number) => boolean): void {
        if (!this.qr) {
            throw new Error('QR code is not defined')
        }

        const options = this.options
        const count = this.qr.getModuleCount()

        if (count > options.size) {
            throw new Error('The canvas is too small')
        }

        const dotSize = this.options.dotsOptions.size
        let size = options.size
        if (options.imageOptions.mode == ImageMode.background) size -= 2 * dotSize * (options.imageOptions.margin || 0)
        const beginning = Math.floor((options.size - count * dotSize) / 2)
        let draw = getQrDotFigure(options.dotsOptions.type, options.plugins)
        const orgDarw = draw

        this.dotsMask = this.createMask('mask-dot-color')
        this.defs.appendChild(this.dotsMask)

        if (options.imageOptions.mode == ImageMode.background) {
            this.lightDotsMask = this.createMask('mask-light-dot-color')
            this.defs.appendChild(this.lightDotsMask)
        }

        let margin = 0
        let additionalDots = 0
        let fakeCount = count

        if (options.shape === ShapeType.circle) {
            margin = (this.options.backgroundOptions && this.options.backgroundOptions.margin) || 0
            additionalDots = Math.floor((size / dotSize - count - 2 * margin) / 2)
            fakeCount = count + additionalDots * 2
        } else if (options.imageOptions.mode == ImageMode.background) {
            additionalDots = 1
            fakeCount = count + additionalDots * 2
        }

        const fakeBeginning = beginning - additionalDots * dotSize
        const colorCount = count + additionalDots * 2
        this._fakeMatrix = new Array(fakeCount)
        const center = Math.floor(fakeCount / 2)

        const rng = getRng(this._fakeMatrix!, 0, 0, false)

        for (let i = 0; i < fakeCount; i++) {
            this._fakeMatrix[i] = new Array(fakeCount)
            for (let j = 0; j < fakeCount; j++) {
                if (
                    i > additionalDots - 1 &&
                    i < fakeCount - additionalDots &&
                    j > additionalDots - 1 &&
                    j < fakeCount - additionalDots
                ) {
                    const ii = i - additionalDots
                    const jj = j - additionalDots
                    if (filter && !filter(ii, jj)) this._fakeMatrix[i][j] = undefined
                    else this._fakeMatrix[i][j] = !!this.qr.isDark(jj, ii)
                    continue
                }

                if (
                    options.shape === ShapeType.circle &&
                    Math.sqrt((i - center) * (i - center) + (j - center) * (j - center)) > center
                ) {
                    this._fakeMatrix[i][j] = undefined
                    continue
                }

                if (
                    i == additionalDots - 1 ||
                    i == fakeCount - additionalDots ||
                    j == additionalDots - 1 ||
                    j == fakeCount - additionalDots
                ) {
                    if (
                        (j == additionalDots - 1 && (i < additionalDots + 8 || i > fakeCount - additionalDots - 9)) ||
                        (j == fakeCount - additionalDots && i < additionalDots + 8) ||
                        (i == additionalDots - 1 && (j < additionalDots + 8 || j > fakeCount - additionalDots - 9)) ||
                        (i == fakeCount - additionalDots && j < additionalDots + 8)
                    )
                        this._fakeMatrix[i][j] = undefined
                    else this._fakeMatrix[i][j] = false
                    continue
                }

                // Get random dots from QR code to show it outside of QR code
                this._fakeMatrix[i][j] = this.qr.isDark(
                    Math.floor(rng() * count),
                    Math.floor(rng() * count)
                )
            }
        }

        const typeNr = (count - 17) / 4
        const alignment = QRUtil.getPatternPosition(typeNr)

        // Create a mask of alignment squares, where each
        const alignmentMatrix = new Array(fakeCount)
        for (let i = 0; i < fakeCount; i++) {
            alignmentMatrix[i] = new Array(fakeCount)
            const iAlign = alignment.find((v) => i - additionalDots > v - 3 && i - additionalDots < v + 3)
            for (let j = 0; j < fakeCount; j++) {
                const jAlign = alignment.find((v) => j - additionalDots > v - 3 && j - additionalDots < v + 3)

                alignmentMatrix[i][j] = undefined
                if (this._fakeMatrix[i][j] == undefined) continue

                if (this.lightDotsMask &&
                    iAlign &&
                    jAlign &&
                    ((iAlign != alignment[0] && jAlign != alignment[0]) ||
                        (jAlign != alignment[0] && jAlign != alignment[alignment.length - 1]) ||
                        (iAlign != alignment[0] && iAlign != alignment[alignment.length - 1])))
                    alignmentMatrix[i][j] = this._fakeMatrix[i][j]
            }
        }

        for (let i = 0; i < fakeCount; i++) {
            for (let j = 0; j < fakeCount; j++) {
                if (this._fakeMatrix[i][j] == undefined) continue

                if (this.lightDotsMask) {
                    draw = alignmentMatrix[i][j] != undefined
                        ? orgDarw
                        : getQrDotFigure(DotType.tinySquare)
                }

                const alignmentNb = options.imageOptions.mode == ImageMode.background && alignmentMatrix[i][j] != undefined

                if (!this._fakeMatrix[i][j]) {
                    if (this.lightDotsMask) {
                        if (this.lightDotsMask) {
                            this.lightDotsMask.appendChild(draw({
                                x: fakeBeginning + i * dotSize,
                                y: fakeBeginning + j * dotSize,
                                size: dotSize,
                                document: this.options.document,
                                getNeighbor: (xOffset: number, yOffset: number): boolean => {
                                    const ii = i + xOffset
                                    const jj = j + yOffset
                                    if (alignmentNb) {
                                        return alignmentMatrix![ii]?.[jj] === false
                                    }
                                    return this._fakeMatrix![ii]?.[jj] === false
                                },
                                getPRandom: getRng(this._fakeMatrix, i, j, false)
                            }))
                        }
                    }
                    continue
                }

                if (this.dotsMask) {
                    this.dotsMask.appendChild(draw({
                        x: fakeBeginning + i * dotSize,
                        y: fakeBeginning + j * dotSize,
                        size: dotSize,
                        document: this.options.document,
                        getNeighbor: (xOffset: number, yOffset: number): boolean => {
                            const ii = i + xOffset
                            const jj = j + yOffset
                            if (alignmentNb) {
                                return alignmentMatrix![ii]?.[jj] === true
                            }
                            return this._fakeMatrix![ii]?.[jj] === true
                        },
                        getPRandom: getRng(this._fakeMatrix, i, j)
                    }))
                }
            }
        }

        if (this.lightDotsMask) {
            this.createColor({
                options: options.imageOptions.fill.gradient,
                color: options.imageOptions.fill.color,
                additionalRotation: 0,
                x: fakeBeginning,
                y: fakeBeginning,
                height: colorCount * dotSize,
                width: colorCount * dotSize,
                name: 'light-dot-color'
            })
        }

        this._dotsColor = this.createColor({
            options: options.dotsOptions?.gradient,
            color: options.dotsOptions.color,
            additionalRotation: 0,
            x: fakeBeginning,
            y: fakeBeginning,
            height: colorCount * dotSize,
            width: colorCount * dotSize,
            name: 'dot-color'
        })
    }

    drawCorners(): void {
        if (!this.qr) {
            throw new Error('QR code is not defined')
        }

        const element = this._element
        const options = this.options

        if (!element) {
            throw new Error('Element code is not defined')
        }

        const count = this.qr.getModuleCount()
        const dotSize = this.options.dotsOptions.size
        const cornersSquareSize = dotSize * 7
        const cornersDotSize = dotSize * 3
        const beginning = Math.floor((options.size - count * dotSize) / 2);

        [
            [0, 0, 0],
            [1, 0, Math.PI / 2],
            [0, 1, -Math.PI / 2]
        ].forEach(([column, row, rotation]) => {
            const x = beginning + column * dotSize * (count - 7)
            const y = beginning + row * dotSize * (count - 7)
            let cornersSquareMask = this.dotsMask
            let cornersDotMask = this.dotsMask

            if (options.cornersSquareOptions?.gradient || options.cornersSquareOptions?.color) {
                cornersSquareMask = this.createMask(`mask-corners-square-color-${column}-${row}`)
                this.defs.appendChild(cornersSquareMask)
                cornersDotMask = cornersSquareMask
                cornersDotMask = cornersSquareMask

                this.createColor({
                    options: options.cornersSquareOptions?.gradient,
                    color: options.cornersSquareOptions?.color,
                    additionalRotation: rotation,
                    x,
                    y,
                    height: cornersSquareSize,
                    width: cornersSquareSize,
                    name: `corners-square-color-${column}-${row}`
                })
            }

            const squareArgs: DrawArgs = {
                x,
                y,
                size: cornersSquareSize,
                document: this.options.document,
                rotation
            }
            const pluinCornerSquare = options.plugins?.length ? drawPluginCornerSquare(options.plugins)(squareArgs) : undefined

            if (pluinCornerSquare) {
                const [cornerElement, cornerFill] = pluinCornerSquare

                if (cornersSquareMask) {
                    cornersSquareMask.appendChild(cornerElement)
                }

                if (this.lightDotsMask) {
                    this.lightDotsMask.appendChild(cornerFill)
                }
            } else if (isCornerSquareType(options.cornersSquareOptions?.type)) {
                const draw = getQrCornerSquareFigure(options.cornersSquareOptions.type)

                const [cornerElement, cornerFill] = draw(squareArgs)

                if (cornersSquareMask) {
                    cornersSquareMask.appendChild(cornerElement)
                }

                if (this.lightDotsMask) {
                    this.lightDotsMask.appendChild(cornerFill)
                }
            } else {
                const draw = getQrDotFigure(options.cornersSquareOptions?.type || options.dotsOptions.type, options.plugins)

                for (let i = 0; i < squareMask.length; i++) {
                    for (let j = 0; j < squareMask[i].length; j++) {
                        if (!squareMask[i]?.[j]) {
                            if (this.lightDotsMask && !dotMask[i]?.[j]) {
                                if (this.lightDotsMask) {
                                    this.lightDotsMask.appendChild(draw({
                                        x: x + i * dotSize,
                                        y: y + j * dotSize,
                                        size: dotSize,
                                        document: this.options.document,
                                        getNeighbor: (xOffset: number, yOffset: number): boolean =>
                                            !squareMask[i + xOffset]?.[j + yOffset] && !dotMask[i + xOffset]?.[j + yOffset],
                                        getPRandom: getRng(this._fakeMatrix!, x / dotSize + i, y / dotSize + j, false)
                                    }))
                                }
                            }
                            continue
                        }

                        if (cornersSquareMask) {
                            cornersSquareMask.appendChild(draw({
                                x: x + i * dotSize,
                                y: y + j * dotSize,
                                size: dotSize,
                                document: this.options.document,
                                getNeighbor: (xOffset: number, yOffset: number): boolean => !!squareMask[i + xOffset]?.[j + yOffset],
                                getPRandom: getRng(this._fakeMatrix!, x / dotSize + i, y / dotSize + j, false)
                            }))
                        }
                    }
                }

                if (this.lightDotsMask)
                    for (let i = -1; i < 8; i++) {
                        for (let j = -1; j < 8; j++) {
                            if (i == -1 || i == 7 || j == -1 || j == 7) {
                                if (this.lightDotsMask) {
                                    this.lightDotsMask.appendChild(draw({
                                        x: x + i * dotSize,
                                        y: y + j * dotSize,
                                        size: dotSize,
                                        document: this.options.document,
                                        getNeighbor: (xOffset: number, yOffset: number): boolean => {
                                            const ii = i + xOffset
                                            const jj = j + yOffset
                                            return ii >= -1 && ii <= 7 && jj >= -1 && jj <= 7 && (ii == -1 || ii == 7 || jj == -1 || jj == 7)
                                        },
                                        getPRandom: getRng(this._fakeMatrix!, x / dotSize + i, y / dotSize + j, false)
                                    }))
                                }
                            }
                        }
                    }
            }

            if (options.cornersDotOptions?.gradient || options.cornersDotOptions?.color) {
                cornersDotMask = this.createMask(`mask-corners-dot-color-${column}-${row}`)
                this.defs.appendChild(cornersDotMask)

                this.createColor({
                    options: options.cornersDotOptions?.gradient,
                    color: options.cornersDotOptions?.color,
                    additionalRotation: rotation,
                    x: x + dotSize * 2,
                    y: y + dotSize * 2,
                    height: cornersDotSize,
                    width: cornersDotSize,
                    name: `corners-dot-color-${column}-${row}`
                })
            }

            const dotArgs: DrawArgs = {
                x: x + dotSize * 2,
                y: y + dotSize * 2,
                size: cornersDotSize,
                document: this.document,
                rotation
            }
            const pluinCornerDot = options.plugins?.length ? drawPluginCornerDot(options.plugins)(dotArgs) : undefined

            if (pluinCornerDot) {
                if (cornersDotMask) {
                    cornersDotMask.appendChild(pluinCornerDot)
                }
            } else if (isCornerDotType(options.cornersDotOptions?.type)) {
                const draw = getQrCornerDotFigure(options.cornersDotOptions.type)

                if (cornersDotMask) {
                    cornersDotMask.appendChild(draw(dotArgs))
                }
            } else {
                const draw = getQrDotFigure(options.cornersDotOptions?.type || options.dotsOptions.type, options.plugins)

                for (let i = 0; i < dotMask.length; i++) {
                    for (let j = 0; j < dotMask[i].length; j++) {
                        if (!dotMask[i]?.[j]) {
                            continue
                        }

                        if (cornersDotMask) {
                            cornersDotMask.appendChild(draw({
                                x: x + i * dotSize,
                                y: y + j * dotSize,
                                size: dotSize,
                                document: this.options.document,
                                getNeighbor: (xOffset: number, yOffset: number): boolean => !!dotMask[i + xOffset]?.[j + yOffset],
                                getPRandom: getRng(this._fakeMatrix!, x / dotSize + i, y / dotSize + j, false)
                            }))
                        }
                    }
                }
            }
        })
    }

    async drawImage({
        width,
        height,
        count,
        dotSize
    }: {
        width: number
        height: number
        count: number
        dotSize: number
    }): Promise<void> {
        const options = this.options
        const beginning = Math.floor((options.size - count * dotSize) / 2)
        let margin = options.imageOptions.margin * dotSize
        if (options.imageOptions.mode == ImageMode.background) margin = 0
        const dx = beginning + margin + (count * dotSize - width) / 2
        const dy = beginning + margin + (count * dotSize - height) / 2
        const dw = width - margin * 2
        const dh = height - margin * 2

        const imageUrl = await this.imageTools.toDataURL(options.image || '')
        let image: SVGElement = this.document.createElementNS('http://www.w3.org/2000/svg', 'image')
        image.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', imageUrl || '')

        if (imageUrl.startsWith('data:image/svg+xml;')) {
            let data = imageUrl.substring(19)
            const i = data.indexOf(',')
            const encoding = data.substring(0, i)
            data = data.substring(i + 1)

            switch (encoding) {
                case 'base64':
                    data = typeof atob == 'function' ? atob(data) : Buffer.from(data, 'base64').toString('utf8')
                    break
                default:
                    data = ''
                    break
            }

            if (data) {
                const container = new DOMParser().parseFromString(data, 'text/xml')
                const rootEl = Array.from(container.getElementsByTagName('svg'))
                if (rootEl.length) {
                    image = rootEl[0]
                    image.setAttribute('overflow', 'visible')
                }
            }
        }

        image.setAttribute('x', numToAttr(dx))
        image.setAttribute('y', numToAttr(dy))
        image.setAttribute('width', `${numToAttr(dw)}px`)
        image.setAttribute('height', `${numToAttr(dh)}px`)

        this._element.appendChild(image)
    }

    private createColor(cfg: {
        options?: Gradient
        color?: string
        additionalRotation: number
        x: number
        y: number
        height: number
        width: number
        name: string
    }) {
        let { width, height, x, y } = cfg

        x -= this.options.dotsOptions.size
        y -= this.options.dotsOptions.size
        width += 2 * this.options.dotsOptions.size
        height += 2 * this.options.dotsOptions.size

        const rect = this.document.createElementNS('http://www.w3.org/2000/svg', 'rect')
        rect.setAttribute('x', numToAttr(x))
        rect.setAttribute('y', numToAttr(y))
        rect.setAttribute('height', numToAttr(height))
        rect.setAttribute('width', numToAttr(width))
        rect.setAttribute('clip-path', `url(#mask-${cfg.name})`)

        const value = createColor({
            ...cfg,
            dotSize: this.options.dotsOptions.size,
            document: this.document
        })

        if (value) {
            rect.setAttribute('fill', value.value)
            if (value.gradient)
                this.defs.appendChild(value.gradient)

            if (value.opacity < 1) rect.setAttribute('opacity', value.opacity.toFixed(7))
        }

        this._element.appendChild(rect)
        return value
    }

    private createMask(id: string) {
        const mask = this.document.createElementNS('http://www.w3.org/2000/svg', 'clipPath')
        mask.setAttribute('id', id)
        mask.setAttribute('clipPathUnits', 'userSpaceOnUse')

        return mask
    }
}
