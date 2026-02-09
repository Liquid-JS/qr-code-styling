import { Options, Plugin } from '../utils/options.js'
import { TextConfig } from './border.js'

export interface FontFace extends Pick<TextConfig, 'font' | 'fontWeight' | 'fontStyle'> {
    /**
     * Base64 encoded font, e.g. `url(data:font/otf;base64,...)`
     */
    src: string
}

/**
 * Embed font faces into the generated SVG
 *
 * Use as the last plugin when using BorderPlugin({ text: { ... } })
 * or other plugins that insert text.
 */
export default class FontFacesPlugin implements Plugin {
    private readonly fontFaces: string
    constructor(fontFaces: Array<FontFace | string>) {
        this.fontFaces = fontFaces.map(v => {
            if (typeof v == 'string')
                return v
            return `@font-face { font-family: ${JSON.stringify(v.font)}; src: ${v.src}; ${v.fontStyle ? `font-style: ${v.fontStyle};` : ''} ${v.fontWeight ? `font-weight: ${v.fontWeight};` : ''} }`
        }).join('\n')
    }

    postProcess(svg: SVGSVGElement, options: Options) {
        const document = options.document
        let defs = Array.from(svg.childNodes).find(v => (v as HTMLElement).tagName.toUpperCase() == 'DEFS')
        if (!defs) {
            defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs')
            svg.appendChild(defs)
        }
        const style = document.createElementNS('http://www.w3.org/2000/svg', 'style')
        style.textContent = this.fontFaces
        defs.appendChild(style)
    }
}
