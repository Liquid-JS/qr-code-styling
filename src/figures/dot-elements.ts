import { BasicFigureDrawArgs } from '../types/helper.js'
import { numToAttr, scalePath, svgPath } from '../utils/svg.js'

export const DotElements = {
    dot: (args: BasicFigureDrawArgs) => {
        const { size, x, y, document } = args

        const element = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
        element.setAttribute('cx', numToAttr(x + size / 2))
        element.setAttribute('cy', numToAttr(y + size / 2))
        element.setAttribute('r', numToAttr(size / 2))

        return element
    },
    square: (args: BasicFigureDrawArgs) => {
        const { size, x, y, document } = args

        const element = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
        element.setAttribute('x', numToAttr(x))
        element.setAttribute('y', numToAttr(y))
        element.setAttribute('width', numToAttr(size))
        element.setAttribute('height', numToAttr(size))

        return element
    },
    //if rotation === 0 - right side is rounded
    sideRounded: (args: BasicFigureDrawArgs) => {
        const { size, x, y, document } = args

        const element = document.createElementNS('http://www.w3.org/2000/svg', 'path')
        element.setAttribute(
            'd',
            svgPath`M ${x} ${y}
                  v ${size}
                  h ${size / 2}
                  a ${size / 2} ${size / 2}, 0, 0, 0, 0 ${-size}
                  z`
        )

        return element
    },
    //if rotation === 0 - top right corner is rounded
    cornerRounded: (args: BasicFigureDrawArgs) => {
        const { size, x, y, document } = args

        const element = document.createElementNS('http://www.w3.org/2000/svg', 'path')
        element.setAttribute(
            'd',
            svgPath`M ${x} ${y}
          v ${size}
          h ${size}
          v ${-size / 2}
          a ${size / 2} ${size / 2}, 0, 0, 0, ${-size / 2} ${-size / 2}
          z`
        )

        return element
    },
    //if rotation === 0 - top right corner is rounded
    cornerExtraRounded: (args: BasicFigureDrawArgs) => {
        const { size, x, y, document } = args

        const element = document.createElementNS('http://www.w3.org/2000/svg', 'path')
        element.setAttribute(
            'd',
            svgPath`M ${x} ${y}
          v ${size}
          h ${size}
          a ${size} ${size}, 0, 0, 0, ${-size} ${-size}
          z`
        )

        return element
    },
    //if rotation === 0 - left bottom and right top corners are rounded
    cornersRounded: (args: BasicFigureDrawArgs) => {
        const { size, x, y, document } = args

        const element = document.createElementNS('http://www.w3.org/2000/svg', 'path')
        element.setAttribute(
            'd',
            svgPath`M ${x} ${y}
          v ${size / 2}
          a ${size / 2} ${size / 2}, 0, 0, 0, ${size / 2} ${size / 2}
          h ${size / 2}
          v ${-size / 2}
          a ${size / 2} ${size / 2}, 0, 0, 0, ${-size / 2} ${-size / 2}
          z`
        )

        return element
    },
    wave: (args: BasicFigureDrawArgs) => {
        const { size, x, y, document } = args

        const a1 = 5 * Math.PI / 180
        const a2 = 65 * Math.PI / 180
        const s1 = 0.95
        const s2 = 0.65

        const c23x = size * (s1 - s2 * Math.cos(a1))
        const c23y = size * (1 - s2 * Math.sin(a1))

        const c31x = -size * Math.cos(a2) / 2
        const c31y = -size * Math.sin(a2) / 2

        const element = document.createElementNS('http://www.w3.org/2000/svg', 'path')
        element.setAttribute(
            'd',
            svgPath`M ${x} ${y}
          c 0 ${size * s2} ${c23x} ${c23y} ${size * s1} ${size}
          c ${c31x} ${c31y} ${size * (1 - s1)} ${-size / 2} ${size * (1 - s1)} ${-size}
          z`
        )

        return element
    },
    heart: (args: BasicFigureDrawArgs) => {
        const { size, x, y, document } = args

        const element = document.createElementNS('http://www.w3.org/2000/svg', 'path')
        element.setAttribute(
            'd',
            scalePath([
                'M',
                1,
                0.31629,
                'c',
                -0.00086,
                0.15702,
                -0.10534,
                0.26323,
                -0.21876,
                0.38123,
                'c',
                -0.06736,
                0.06834,
                -0.18938,
                0.17948,
                -0.28124,
                0.26126,
                'c',
                -0.09188,
                -0.08178,
                -0.2139,
                -0.19292,
                -0.28124,
                -0.26126,
                'c',
                -0.11344,
                -0.118,
                -0.2179,
                -0.22422,
                -0.21876,
                -0.38123,
                'c',
                -0.00096,
                -0.27136,
                0.33154,
                -0.36842,
                0.5,
                -0.17,
                'c',
                0.16844,
                -0.19842,
                0.50094,
                -0.10136,
                0.5,
                0.17,
                'z'
            ], { x, y, size })
        )

        return element
    },
    rounded: (args: BasicFigureDrawArgs) => {
        const { size, x, y, document } = args

        const element = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
        element.setAttribute('x', numToAttr(x))
        element.setAttribute('y', numToAttr(y))
        element.setAttribute('width', numToAttr(size))
        element.setAttribute('height', numToAttr(size))
        element.setAttribute('rx', numToAttr(size / 4))
        element.setAttribute('ry', numToAttr(size / 4))

        return element
    },
    classy: (args: BasicFigureDrawArgs) => {
        const { size, x, y, document } = args
        const dotSize = size / 7

        const element = document.createElementNS('http://www.w3.org/2000/svg', 'path')
        element.setAttribute(
            'd',
            svgPath`M ${x} ${y + 2.5 * dotSize}
          v ${2 * dotSize}
          a ${2.5 * dotSize} ${2.5 * dotSize}, 0, 0, 0, ${dotSize * 2.5} ${dotSize * 2.5}
          h ${4.5 * dotSize}
          v ${-4.5 * dotSize}
          a ${2.5 * dotSize} ${2.5 * dotSize}, 0, 0, 0, ${-dotSize * 2.5} ${-dotSize * 2.5}
          h ${-2 * dotSize}
          H ${x}
          z`
        )

        return element
    },
    inpoint: (args: BasicFigureDrawArgs) => {
        const { size, x, y, document } = args

        const element = document.createElementNS('http://www.w3.org/2000/svg', 'path')
        element.setAttribute(
            'd',
            svgPath`M ${x} ${y + size / 2}
          v ${size / 4}
          a ${size / 4}, ${size / 4} 0 0 0 ${size / 4}, ${size / 4}
          h ${(size / 4) * 3}
          v ${(-size / 4) * 3}
          a ${size / 4}, ${size / 4} 0 0 0 ${-size / 4}, ${-size / 4}
          h ${-size / 2}
          a ${size / 4}, ${size / 4} 0 0 0 ${-size / 4}, ${size / 4}
          z`
        )

        return element
    }
}
