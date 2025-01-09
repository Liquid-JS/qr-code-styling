const rx = /\.?0+$/

export function numToAttr(value: number) {
    return value.toFixed(7).replace(rx, '')
}

export function svgPath(strings: TemplateStringsArray, ...values: unknown[]) {
    return strings
        .reduce((t, v, i) => {
            let p: unknown = ''
            if (i) p = values[i - 1]
            if (typeof p == 'number') p = numToAttr(p)
            return `${t}${p}${v}`
        }, '')
        .trim()
        .replace(/[\s\n\r]+/gim, ' ')
}
