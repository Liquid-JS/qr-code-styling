export enum GradientType {
    radial = 'radial',
    linear = 'linear'
}

export interface Gradient {
    /**
     * Type of gradient spread
     *
     * @default GradientType.linear
     */
    type: `${GradientType}`
    /**
     * Rotation of gradient (in radians, Math.PI === 180 degrees)
     *
     * @default 0
     */
    rotation?: number
    /** Gradient colors. */
    colorStops: Array<{
        /** Position of color in gradient range */
        offset: number
        /** Color of stop in gradient range */
        color: string
    }>
}

export function sanitizeGradient(gradient: Gradient): Gradient {
    const newGradient = { ...gradient }

    if (!newGradient.colorStops || !newGradient.colorStops.length) {
        throw new Error("Field 'colorStops' is required in gradient")
    }

    if (newGradient.rotation) {
        newGradient.rotation = Number(newGradient.rotation)
    } else {
        newGradient.rotation = 0
    }

    newGradient.colorStops = newGradient.colorStops.map((colorStop: { offset: number, color: string }) => ({
        ...colorStop,
        offset: Number(colorStop.offset)
    }))

    return newGradient
}
