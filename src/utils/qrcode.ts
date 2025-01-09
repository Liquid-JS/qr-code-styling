import { ErrorCorrectionLevel, Mode } from '@liquid-js/qrcode-generator/lib/qrcode/QRCodeMinimal.js'

export const ErrorCorrectionPercents = {
    [ErrorCorrectionLevel.L]: 0.07,
    [ErrorCorrectionLevel.M]: 0.15,
    [ErrorCorrectionLevel.Q]: 0.25,
    [ErrorCorrectionLevel.H]: 0.3
}

export function getMode(data: string): Mode {
    switch (true) {
        case /^[0-9]*$/.test(data):
            return Mode.numeric
        case /^[0-9A-Z $%*+\-./:]*$/.test(data):
            return Mode.alphanumeric

        case /[^\u0000-\u00ff]/.test(data):
            return Mode.unicode
        default:
            return Mode.byte
    }
}
