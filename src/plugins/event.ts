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
    organizer?: {
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
        const { start, end, location, geo: _geo, organizer, ...cfg } = this.pluginOptions
        const geo = typeof _geo?.lat == 'number' && typeof _geo.lon == 'number' ? (_geo as { lat: number, lon: number }) : undefined
        return calendar.createEvent({
            ...cfg,
            start: toDate(start)!,
            end: toDate(end),
            location: location
                ? {
                    title: location,
                    geo
                }
                : geo
                    ? {
                        geo
                    }
                    : undefined,
            organizer: organizer?.email
                ? {
                    name: organizer.name || organizer.email,
                    email: organizer.email
                }
                : undefined,
            id: this.uuid
        }).toString()
            .split(/[\r\n]+/g)
            .filter(v => !v.startsWith('SEQUENCE:') && !v.startsWith('DTSTAMP:') && (this.uuid || !v.startsWith('UID:')))
            .join('\n')
    }

}
