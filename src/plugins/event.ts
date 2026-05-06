import { generateIcsEvent } from 'ts-ics'
import { Options, Plugin } from '../utils/options.js'

export interface EventPluginOptions {
    summary: string
    start: Date
    end: Date
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

export default class EventPlugin implements Plugin {

    constructor(
        private readonly pluginOptions: EventPluginOptions,
        private readonly uuid?: string
    ) { }

    configure(options: Options): Options | undefined | void {
        options.data = generateIcsEvent({
            ...this.pluginOptions,
            stamp: { date: this.pluginOptions.start, type: this.pluginOptions.allDay ? 'DATE' : 'DATE-TIME' },
            start: { date: this.pluginOptions.start, type: this.pluginOptions.allDay ? 'DATE' : 'DATE-TIME' },
            end: { date: this.pluginOptions.end, type: this.pluginOptions.allDay ? 'DATE' : 'DATE-TIME' },
            geo: this.pluginOptions.geo ? `${this.pluginOptions.geo.lat}:${this.pluginOptions.geo.lon}` : undefined,
            uid: this.uuid || ''
        })
        return options
    }

}
