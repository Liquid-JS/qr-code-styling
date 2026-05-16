import { generateIcsEvent } from 'ts-ics'
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
        options.data = generateIcsEvent({
            ...this.pluginOptions,
            stamp: { date: toDate(this.pluginOptions.start)!, type: this.pluginOptions.allDay ? 'DATE' : 'DATE-TIME' },
            start: { date: toDate(this.pluginOptions.start)!, type: this.pluginOptions.allDay ? 'DATE' : 'DATE-TIME' },
            end: { date: toDate(this.pluginOptions.end)!, type: this.pluginOptions.allDay ? 'DATE' : 'DATE-TIME' },
            geo: this.pluginOptions.geo ? `${this.pluginOptions.geo.lat}:${this.pluginOptions.geo.lon}` : undefined,
            uid: this.uuid || ''
        })
        return options
    }

}
