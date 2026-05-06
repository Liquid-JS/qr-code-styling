import { Options, Plugin } from '../utils/options.js'

export enum EncryptionType {
    wep = 'WEP',
    wpa = 'WPA'
}

export interface WiFiPluginOptions {
    ssid: string
    hidden?: boolean
    encryption?: `${EncryptionType}`
    password?: string
}

export default class WiFiPlugin implements Plugin {

    constructor(
        private readonly pluginOptions: WiFiPluginOptions
    ) { }

    configure(options: Options): Options | undefined | void {
        options.data = this.generateWiFi()
        return options
    }

    private generateWiFi() {
        // https://github.com/zxing/zxing/wiki/Barcode-Contents#wi-fi-network-config-android-ios-11

        const { ssid, encryption, password, hidden } = this.pluginOptions

        const parts = new Array<{ key: 'T' | 'S' | 'P' | 'H' | 'E' | 'A' | 'I' | 'PH2', value: string }>()
        parts.push({
            key: 'S',
            value: escape_string(ssid)
        })
        if (encryption)
            parts.push({
                key: 'T',
                value: encryption
            }, {
                key: 'P',
                value: escape_string(password || '', true)
            })
        else
            parts.push({
                key: 'T',
                value: 'nopass'
            })

        parts.push({
            key: 'H',
            value: hidden ? 'true' : 'false'
        })

        const content = parts.map(({ key, value }) => [key, value].join(':')).join(';')

        return `WIFI:${content};;`
    }

}

const to_escape = new Set(['\\', ';', ',', ':', '"'])

function escape_string(val: string, quoteHex = false) {
    const value = val.split('').map(v => to_escape.has(v) ? '\\' + v : v).join('')
    if (quoteHex && value.match(/^[0-9a-f]+$/i))
        return `"${value}"`
    return value
};
