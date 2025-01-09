import { QRCodeStyling } from '../core/qr-code-styling.js'
import { RecursivePartial } from '../types/helper.js'
import { CanvasOptions, defaultCanvasOptions, sanitizeCanvasOptions } from '../utils/canvas-options.js'
import { mergeDeep } from '../utils/merge.js'

export enum FileExtension {
    svg = 'svg',
    png = 'png',
    jpeg = 'jpeg',
    webp = 'webp'
}

export function drawToCanvas(
    qrCode: QRCodeStyling,
    options?: RecursivePartial<CanvasOptions>
): { canvas: HTMLCanvasElement, canvasDrawingPromise: Promise<void> | undefined } | undefined {
    const { width, height, margin } = options
        ? sanitizeCanvasOptions(mergeDeep(defaultCanvasOptions, options) as CanvasOptions)
        : defaultCanvasOptions

    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height

    const size = Math.min(width, height) - 2 * margin

    const canvasDrawingPromise = qrCode.serialize().then((xml) => {
        if (!xml) return
        const svg64 = btoa(xml)
        const image64 = 'data:image/svg+xml;base64,' + svg64
        const image = new Image()

        return new Promise<void>((resolve, reject) => {
            image.onload = (): void => {
                // Ensure pixel-perfect rendering of SVG to avoid artefact, then downscale to requested size
                const aaFactor = Math.ceil((2 * size) / Math.min(image.width, image.height))
                let aaCanvas: HTMLCanvasElement | OffscreenCanvas
                try {
                    aaCanvas = new OffscreenCanvas(image.width * aaFactor, image.height * aaFactor)
                } catch (_) {
                    // Fallback to regular canvas element
                    aaCanvas = document.createElement('canvas')
                    aaCanvas.width = image.width * aaFactor
                    aaCanvas.height = image.height * aaFactor
                }
                aaCanvas.getContext('2d')?.drawImage(image, 0, 0, aaCanvas.width, aaCanvas.height)

                canvas?.getContext('2d')?.drawImage(aaCanvas, (width - size) / 2, (height - size) / 2, size, size)
                resolve()
            }
            image.onerror = image.onabort = reject

            image.src = image64
        })
    })

    return { canvas, canvasDrawingPromise }
}

export async function download(
    qrCode: QRCodeStyling,
    downloadOptions?: { name?: string, extension: `${FileExtension}` },
    options?: RecursivePartial<CanvasOptions>
): Promise<void> {
    let extension: `${FileExtension}` = FileExtension.png
    let name = 'qr'

    if (downloadOptions) {
        if (downloadOptions.name) {
            name = downloadOptions.name
        }
        if (downloadOptions.extension) {
            extension = downloadOptions.extension
        }
    }

    if (extension.toLowerCase() === 'svg') {
        const source = await qrCode.serialize()
        if (!source) return
        const url = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(source)
        downloadURI(url, `${name}.svg`)
    } else {
        const res = drawToCanvas(qrCode, options)
        if (!res) return
        const { canvas, canvasDrawingPromise } = res
        await canvasDrawingPromise
        const url = canvas.toDataURL(`image/${extension}`)
        downloadURI(url, `${name}.${extension}`)
    }
}

export function downloadURI(uri: string, name: string): void {
    const link = document.createElement('a')
    link.download = name
    link.href = uri
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
}
