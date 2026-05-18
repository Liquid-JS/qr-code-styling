import ical from 'ical-generator'
import { Options, Plugin } from '../utils/options.js'

export interface EventPluginOptions {
    summary: string
    start: Date | string
    end: Date | string
    allDay?: boolean
    description?: string
    url?: string
    location?: string
    geo?: {
        lat: string
        lon: string
    }
    organizer: {
        name?: string
        email: string
    }
}

function toDate(val?: string | Date) {
    if (!val)
        return
    if (typeof val == 'string')
        return new Date(val)
    return val
}

export default class EventPlugin implements Plugin {

    constructor(
        private readonly pluginOptions: EventPluginOptions,
        private readonly uuid?: string
    ) { }

    configure(options: Options): Options | undefined | void {
        const calendar = ical({ name: 'QR calendar' })
        options.data = calendar.createEvent({
            ...this.pluginOptions,
            start: toDate(this.pluginOptions.start)!,
            end: toDate(this.pluginOptions.end),
            location: this.pluginOptions.location || this.pluginOptions.geo ? {
                title: this.pluginOptions.location,
                geo: this.pluginOptions.geo
            } as any : undefined,
            organizer: this.pluginOptions.organizer ? {
                name: this.pluginOptions.organizer.name || this.pluginOptions.organizer.email,
                email: this.pluginOptions.organizer.email
            } : undefined,
            id: this.uuid
        }).toString().split('\n').filter(v => !v.startsWith('SEQUENCE:') && !v.startsWith('DTSTAMP:') && (this.uuid || !v.startsWith('UID:'))).join('\n')
        // Auto mode
        options.qrOptions.mode = undefined
        return options
    }

}
