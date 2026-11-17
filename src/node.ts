import { DOMImplementation, DOMParser, XMLSerializer } from '@xmldom/xmldom'
import { QRCodeStyling as _QRCodeStyling } from './core/qr-code-styling.js'
import type * as _browserUtils from './tools/browser-utils.js'
import { RecursivePartial } from './types/helper.js'
import { Options } from './utils/options.js'
export { ErrorCorrectionLevel, Mode, TypeNumber } from '@liquid-js/qrcode-generator/lib/qrcode/QRCodeMinimal.js'
export { type ExtensionFunction } from './core/qr-code-styling.js'
export { FileExtension } from './tools/browser-utils.js'
export { type RecursivePartial } from './types/helper.js'
export { type CanvasOptions } from './utils/canvas-options.js'
export { type ColorElementValue } from './utils/color.js'
export { GradientType, type Gradient } from './utils/gradient.js'
export { CornerDotType, CornerSquareType, DotType, ImageMode, ShapeType, type AppliedMask, type GeneratorMask, type Options, type Plugin } from './utils/options.js'
export { ErrorCorrectionPercents } from './utils/qrcode.js'

export const browserUtils: typeof _browserUtils | undefined = undefined

// sharp and file-type are only needed for images, so they load when an image first does: codes without images render
// without them installed, and a bundle that includes this file doesn't need them to resolve.
let fileTypeModule: Promise<typeof import('file-type')> | undefined
let sharpModule: Promise<typeof import('sharp')> | undefined

const missing = (name: string, cause: unknown) =>
    new Error(`Rendering images on the server needs ${name}: install it next to @liquid-js/qr-code-styling`, { cause })

const mimeOf = async (data: Buffer) => {
    fileTypeModule ??= import('file-type').catch((err: unknown) => {
        fileTypeModule = undefined
        throw missing('file-type', err)
    })
    const { fileTypeFromBuffer } = await fileTypeModule
    return fileTypeFromBuffer(data).then((r) => r?.mime)
}

const sizeOf = async (data: Buffer) => {
    sharpModule ??= import('sharp').catch((err: unknown) => {
        sharpModule = undefined
        throw missing('sharp', err)
    })
    const { default: sharp } = await sharpModule
    return sharp(data).metadata()
}

export class QRCodeStyling extends _QRCodeStyling {
    constructor(options: RecursivePartial<Options>) {
        const dom = new DOMImplementation().createDocument(null, '')
        const imageCache = new Map<string, Promise<{ contentType?: string | null, data: Buffer }>>()

        const loadImage = async (url: string | Buffer | Blob) => {
            if (typeof url == 'string') {
                let pr = imageCache.get(url)
                if (pr) return pr
                pr = fetch(url).then((res) =>
                    res
                        .arrayBuffer()
                        .then((buff) => Buffer.from(buff))
                        .then(async (data) => ({
                            contentType: res.headers.get('Content-Type') || (await mimeOf(data)),
                            data
                        }))
                )
                imageCache.set(url, pr)
                return pr
            } else {
                const buff = Buffer.from(url as Buffer)
                const mime = await mimeOf(buff)
                return {
                    contentType: mime,
                    data: buff
                }
            }
        }

        global.XMLSerializer = XMLSerializer as any

        global.DOMParser = DOMParser as any

        super({
            ...options,

            document: options.document || (dom as any),
            imageTools: options.imageTools || {
                toDataURL: (url: string | Buffer | Blob): Promise<string> => {
                    if (typeof url == 'string' && url.startsWith('data:')) return Promise.resolve(url)
                    return loadImage(url).then(
                        ({ contentType, data }) =>
                            `data:${contentType?.replace('application/xml', 'image/svg+xml')};base64,${data.toString('base64')}`
                    )
                },
                getSize: async (src: string | Blob | Buffer): Promise<{ width: number, height: number }> => {
                    const { data } = Buffer.isBuffer(src) ? { data: src } : await loadImage(src)
                    const meta = await sizeOf(data)
                    return {
                        width: meta.width!,

                        height: meta.height!
                    }
                }
            }
        })
    }
}
