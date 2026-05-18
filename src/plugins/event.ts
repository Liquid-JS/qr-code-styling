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
        lat: number
        lon: number
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
        options.data = this.generateEvent()
        // Auto mode
        options.qrOptions.mode = undefined
        return options
    }

    private generateEvent() {
        const calendar = ical({ name: 'QR calendar' })
        return calendar.createEvent({
            ...this.pluginOptions,
            start: toDate(this.pluginOptions.start)!,
            end: toDate(this.pluginOptions.end),
            location: this.pluginOptions.location
                ? {
                    title: this.pluginOptions.location,
                    geo: this.pluginOptions.geo
                }
                : this.pluginOptions.geo
                    ? {
                        geo: this.pluginOptions.geo
                    }
                    : undefined,
            organizer: this.pluginOptions.organizer?.email
                ? {
                    name: this.pluginOptions.organizer.name || this.pluginOptions.organizer.email,
                    email: this.pluginOptions.organizer.email
                }
                : undefined,
            id: this.uuid
        }).toString()
            .split(/[\r\n]+/g)
            .filter(v => !v.startsWith('SEQUENCE:') && !v.startsWith('DTSTAMP:') && (this.uuid || !v.startsWith('UID:')))
            .join('\n')
    }

}
