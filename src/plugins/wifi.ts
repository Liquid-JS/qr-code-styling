import { Options, Plugin } from '../utils/options.js'

export enum EncryptionType {
    wep = 'WEP',
    wpa = 'WPA',
    wpaEap = 'WPA2-EAP'
}

export type WiFiPluginOptions = {
    ssid: string
    hidden?: boolean
} & ({
    encryption: `${EncryptionType.wep | EncryptionType.wpa}`
    password: string
} | {}) & (({
    encryption: `${EncryptionType.wpaEap}`
    password?: string
    /** EAP method, like PEAP, TTLS or PWD */
    eapMethod?: string
    /** EAP identity */
    eapIdentity?: string
    /** EAP anonymous identity */
    eapAnonymousIdentity?: string
    /** EAP phase 2 method, like MSCHAPV2 or TLS */
    eapPhase2Method?: string
} & {}) | {})

export default class WiFiPlugin implements Plugin {

    constructor(
        private readonly pluginOptions: WiFiPluginOptions
    ) { }

    configure(options: Options): Options | undefined | void {
        options.data = this.generateWiFi()
        // Auto mode
        options.qrOptions.mode = undefined
        return options
    }

    private generateWiFi() {
        // https://github.com/zxing/zxing/wiki/Barcode-Contents#wi-fi-network-config-android-ios-11

        const { ssid, hidden } = this.pluginOptions

        const parts = new Array<{ key: 'T' | 'S' | 'P' | 'H' | 'E' | 'A' | 'I' | 'PH2', value: string }>()
        parts.push({
            key: 'S',
            value: escape_string(ssid || '', true)
        })
        if ('encryption' in this.pluginOptions && this.pluginOptions.encryption) {
            parts.push({
                key: 'T',
                value: escape_string(this.pluginOptions.encryption)
            }, {
                key: 'P',
                value: escape_string(this.pluginOptions.password || '', true)
            })
            if (this.pluginOptions.encryption == EncryptionType.wpaEap) {
                if (this.pluginOptions.eapMethod)
                    parts.push({
                        key: 'E',
                        value: escape_string(this.pluginOptions.eapMethod)
                    })
                if (this.pluginOptions.eapIdentity)
                    parts.push({
                        key: 'I',
                        value: escape_string(this.pluginOptions.eapIdentity)
                    })
                if (this.pluginOptions.eapAnonymousIdentity)
                    parts.push({
                        key: 'A',
                        value: escape_string(this.pluginOptions.eapAnonymousIdentity)
                    })
                if (this.pluginOptions.eapPhase2Method)
                    parts.push({
                        key: 'PH2',
                        value: escape_string(this.pluginOptions.eapPhase2Method)
                    })
            }
        } else
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
