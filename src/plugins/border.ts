import { Options, Plugin } from '../utils/options.js'
import { extendSVG, numToAttr, svgPath } from './utils.js'

enum TextPosition {
    top = 'top',
    bottom = 'bottom',
    left = 'left',
    right = 'right'
}

export interface TextConfig {
    font?: string
    color?: string
    size?: number
    fontWeight?: 'normal' | 'bold' | number
    fontStyle?: 'normal' | 'italic' | 'oblique'
}

export interface BorderPluginOptions {
    /** Border roundnes, from 0 (square) to 1 (circle) */
    round?: number
    size: number
    color: string
    dasharray?: string
    margin?: number
    /**
     * If true, all dimensions are proportional to the code size,
     * i.e. `size: 0.1` means the border thickness is 1/10 of the QR code size
     *
     * This is useful to keep the border visually consistent regardless of the amount of data
     *
     * Note: if using dasharray, use percentage values to maintain consistency
     */
    proportional?: boolean
    text?: TextConfig & {
        [key in TextPosition]?: TextConfig & {
            content: string
        }
    }
    /**
     * A string of embedded CSS \@font-face rules
     *
     * @deprecated Use @liquid-js/qr-code-styling/font-faces-plugin
     */
    fontFaces?: string
}

export default class BorderPlugin implements Plugin {

    constructor(
        private readonly pluginOptions: BorderPluginOptions,
        /** @ignore Create unique id for SVG elements to prevent naming collisions; specify your own if neccesary e.g. for testing */
        private readonly idSuffix = Math.random().toFixed(10).substring(2)
    ) { }

    postProcess(svg: SVGSVGElement, options: Options) {
        const { document } = options
        const sizeFactor = this.pluginOptions.proportional ? options.size : 1

        const margin = (this.pluginOptions.margin || 0) * sizeFactor
        let thickness = (this.pluginOptions.size) * sizeFactor
        const drawArea = extendSVG(svg, thickness + margin)
        if (!drawArea)
            return

        thickness = Math.abs(thickness)

        const cx = (drawArea.left + drawArea.right) / 2
        const cy = (drawArea.top + drawArea.bottom) / 2
        const lineSize = options.size / 2 * (1 - (this.pluginOptions.round || 0))
        const r = (Math.min(drawArea.right - drawArea.left - 2 * thickness, drawArea.bottom - drawArea.top - 2 * thickness) / 2) - lineSize + thickness / 2

        let pathR = this.pluginOptions.round ? r : 0
        let pathL = this.pluginOptions.round ? lineSize : lineSize + r

        const borderEl = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
        borderEl.setAttribute('width', numToAttr((pathL + pathR) * 2))
        borderEl.setAttribute('height', numToAttr((pathL + pathR) * 2))
        borderEl.setAttribute('x', numToAttr(cx - pathL - pathR))
        borderEl.setAttribute('y', numToAttr(cy - pathL - pathR))
        borderEl.setAttribute('rx', numToAttr(pathR))
        borderEl.setAttribute('fill', 'none')
        borderEl.setAttribute('stroke', this.pluginOptions.color)
        borderEl.setAttribute('stroke-width', numToAttr(thickness))
        if (this.pluginOptions.dasharray) {
            borderEl.setAttribute('stroke-dasharray', this.pluginOptions.dasharray)
        }

        svg.appendChild(borderEl);

        [TextPosition.left, TextPosition.top, TextPosition.right, TextPosition.bottom].forEach(postion => {
            const textCfg = this.pluginOptions.text
            const config = textCfg?.[postion]
            if (config) {
                let defs = Array.from(svg.childNodes).find(v => (v as HTMLElement).tagName.toUpperCase() == 'DEFS')
                if (!defs) {
                    defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs')
                    svg.appendChild(defs)
                }
                const element = document.createElementNS('http://www.w3.org/2000/svg', 'path')
                const size = (config.size || textCfg.size || 1) * sizeFactor
                pathR = this.pluginOptions.round ? r - size / 3 : 0
                pathL = this.pluginOptions.round ? lineSize : lineSize + (r - size / 3)
                switch (postion) {
                    case TextPosition.top:
                        element.setAttribute(
                            'd',
                            svgPath`M ${cx} ${cy + pathR + pathL}
                          h ${-pathL}
                          a ${pathR} ${pathR} 0 0 1 ${-pathR} ${-pathR}
                          v ${-2 * pathL}
                          a ${pathR} ${pathR} 0 0 1 ${pathR} ${-pathR}
                          h ${2 * pathL}
                          a ${pathR} ${pathR} 0 0 1 ${pathR} ${pathR}
                          v ${2 * pathL}
                          a ${pathR} ${pathR} 0 0 1 ${-pathR} ${pathR}
                          h ${-pathL}`
                        )
                        break
                    case TextPosition.bottom:
                        if (this.pluginOptions.round)
                            pathR += size * 2 / 3
                        else
                            pathL += size * 2 / 3
                        element.setAttribute(
                            'd',
                            svgPath`M ${cx} ${cy - pathR - pathL}
                          h ${-pathL}
                          a ${pathR} ${pathR} 0 0 0 ${-pathR} ${pathR}
                          v ${2 * pathL}
                          a ${pathR} ${pathR} 0 0 0 ${pathR} ${pathR}
                          h ${2 * pathL}
                          a ${pathR} ${pathR} 0 0 0 ${pathR} ${-pathR}
                          v ${-2 * pathL}
                          a ${pathR} ${pathR} 0 0 0 ${-pathR} ${-pathR}
                          h ${-pathL}`
                        )
                        break
                    case TextPosition.left:
                        element.setAttribute(
                            'd',
                            svgPath`M ${cx + pathR + pathL} ${cy}
                          v ${pathL}
                          a ${pathR} ${pathR} 0 0 1 ${-pathR} ${pathR}
                          h ${-2 * pathL}
                          a ${pathR} ${pathR} 0 0 1 ${-pathR} ${-pathR}
                          v ${-2 * pathL}
                          a ${pathR} ${pathR} 0 0 1 ${pathR} ${-pathR}
                          h ${2 * pathL}
                          a ${pathR} ${pathR} 0 0 1 ${pathR} ${pathR}
                          v ${pathL}`
                        )
                        break
                    case TextPosition.right:
                        element.setAttribute(
                            'd',
                            svgPath`M ${cx - pathR - pathL} ${cy}
                          v ${-pathL}
                          a ${pathR} ${pathR} 0 0 1 ${pathR} ${-pathR}
                          h ${2 * pathL}
                          a ${pathR} ${pathR} 0 0 1 ${pathR} ${pathR}
                          v ${2 * pathL}
                          a ${pathR} ${pathR} 0 0 1 ${-pathR} ${pathR}
                          h ${-2 * pathL}
                          a ${pathR} ${pathR} 0 0 1 ${-pathR} ${-pathR}
                          v ${-pathL}`
                        )
                        break
                }
                const id = `border-text-${postion}-${this.idSuffix}`
                element.setAttribute('id', id)
                element.setAttribute('fill', 'none')

                const span = document.createElementNS('http://www.w3.org/2000/svg', 'tspan')
                span.setAttribute('font-family', config.font || textCfg.font || 'sans-serif')
                span.setAttribute('fill', config.color || textCfg.color || '#000')
                span.setAttribute('font-weight', numToAttr(config.fontWeight || textCfg.fontWeight || 'normal'))
                span.setAttribute('font-style', config.fontStyle || textCfg.fontStyle || 'normal')
                span.setAttribute('font-size', numToAttr(size))
                span.textContent = config.content

                const textPath = document.createElementNS('http://www.w3.org/2000/svg', 'textPath')
                textPath.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', '#' + id)
                textPath.setAttribute('startOffset', '50%')
                textPath.setAttribute('text-anchor', 'middle')
                textPath.appendChild(span)

                const text = document.createElementNS('http://www.w3.org/2000/svg', 'text')
                text.appendChild(textPath)

                defs.appendChild(element)
                svg.appendChild(text)
            }
        })

        // eslint-disable-next-line @typescript-eslint/no-deprecated
        if (this.pluginOptions.fontFaces) {
            let defs = Array.from(svg.childNodes).find(v => (v as HTMLElement).tagName.toUpperCase() == 'DEFS')
            if (!defs) {
                defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs')
                svg.appendChild(defs)
            }
            const style = document.createElementNS('http://www.w3.org/2000/svg', 'style')
            // eslint-disable-next-line @typescript-eslint/no-deprecated
            style.textContent = this.pluginOptions.fontFaces
            defs.appendChild(style)
        }
    }
}
