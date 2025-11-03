export function getRng(matrix: Array<Array<boolean | number | undefined>>, i: number, j: number, match: number | boolean = true) {
    let seed: number | undefined
    return () => {
        if (seed == undefined) {
            seed = 0
            let ix = 0
            for (let xOffset = -3; xOffset < 4; xOffset++)
                for (let yOffset = -3; yOffset < 4; yOffset++) {
                    ix++
                    seed |= Number(matrix[((i + xOffset + matrix.length) << yOffset) % matrix.length]?.[((j + yOffset + matrix.length) << xOffset) % matrix.length] === match) << ix
                }
        }
        let t = seed += 0x6D2B79F5
        t = Math.imul(t ^ t >>> 15, t | 1)
        t ^= t + Math.imul(t ^ t >>> 7, t | 61)
        return ((t ^ t >>> 14) >>> 0) / 4294967296
    }
}
