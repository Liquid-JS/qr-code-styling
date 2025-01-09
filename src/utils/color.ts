export function parseColor(cstr: string) {
    let m: RegExpExecArray | null
    let parts: string[] | number[] = []
    let alpha = 1

    cstr = cstr.toLowerCase()

    if (cstr[0] === '#') {
        const base = cstr.slice(1)
        const size = base.length
        const isShort = size <= 4

        if (isShort) {
            parts = [parseInt(base[0] + base[0], 16), parseInt(base[1] + base[1], 16), parseInt(base[2] + base[2], 16)]
            if (size === 4) {
                alpha = parseInt(base[3] + base[3], 16) / 255
            }
        } else {
            parts = [parseInt(base[0] + base[1], 16), parseInt(base[2] + base[3], 16), parseInt(base[4] + base[5], 16)]
            if (size === 8) {
                alpha = parseInt(base[6] + base[7], 16) / 255
            }
        }

        if (!parts[0]) parts[0] = 0
        if (!parts[1]) parts[1] = 0
        if (!parts[2]) parts[2] = 0
    } else if ((m = /^((?:rgba?))\s*\(([^)]*)\)/.exec(cstr))) {
        const dims = 3
        parts = m[2].trim().split(/\s*[,/]\s*|\s+/)

        parts = parts.map((x, i) => {
            if (x[x.length - 1] === '%') {
                const v = parseFloat(x) / 100
                if (i === 3) return v
                return v * 255
            }

            if (x === 'none') return 0
            return parseFloat(x)
        })

        alpha = parts.length > dims ? parts.pop()! : 1
    } else {
        return {
            value: cstr,
            alpha
        }
    }

    const value = '#' + parts.map((v) => Math.max(0, Math.min(255, v)).toString(16).padStart(2, '0')).join('')
    return {
        value,
        alpha: Math.max(0, Math.min(1, alpha))
    }
}
