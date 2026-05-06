import VCard from 'vcards-js'
import vcf from 'vcf'
import { Options, Plugin } from '../utils/options.js'

export interface Address {
    streetAddress?: string
    locality?: string
    postalCode?: string
    stateProvince?: string
    region?: string
    country?: string
}

export enum AddressType {
    Home = 'home',
    Work = 'work'
}

export enum PhoneType {
    Home = 'home',
    Work = 'work',
    Cell = 'cell',
    Pager = 'pager'
}

export enum SocialType {
    Messenger = 'messenger',
    Twitter = 'twitter',
    Facebook = 'facebook',
    LinkedIn = 'linkedin',
    SinaWeibo = 'weibo',
    Jabber = 'jabber',
    QQ = 'qq',
    GaduGadu = 'gadu-gadu'
}

export interface Image {
    /** URL where photo can be found */
    url: string
    /** the media type */
    mediaType: string
}

export interface VCardPluginOptions {
    data: {
        fullName: string
        name?: {
            first?: string
            last?: string
            middle?: string
            prefix?: string
            suffix?: string
            nick?: string
        }
        title?: string
        birthday?: Date
        photo?: Image
        phone?: Array<{ type?: `${PhoneType}`, value: string }>
        email?: Array<{ type?: `${AddressType}`, value: string }>

        address?: {
            work?: Address
            home?: Address
        }

        logo?: Image
        note?: string
        company?: string
        social?: Array<{ type: `${SocialType}`, value: string }>

        website?: {
            personal?: string
            company?: string
        }
    }
}

export default class VCardPlugin implements Plugin {

    constructor(
        private readonly pluginOptions: VCardPluginOptions,
        private readonly uuid?: string
    ) { }

    configure(options: Options): Options | undefined | void {
        options.data = this.generateVCard()
        return options
    }

    private generateVCard() {
        const { data } = this.pluginOptions
        const card = VCard()
        card.version = '3.0'

        card.formattedName = data.fullName

        const extraProps = new Array<vcf.Property>()
        let groupCounter = 1
        const getGroup = () => `item${groupCounter++}`

        if (data.name) {
            const n = data.name
            if (n.first)
                card.firstName = n.first
            if (n.last)
                card.lastName = n.last
            if (n.middle)
                card.middleName = n.middle
            if (n.nick) {
                card.nickname = n.nick
                extraProps.push(vcf.Property.fromJSON([
                    'xAndroidCustom',
                    {},
                    'text',
                    ['vnd.android.cursor.item/nickname', n.nick, '1', '', '', '', '', '', '', '', '', '', '', '', '', '']
                ]))
            }
            if (n.prefix)
                card.namePrefix = n.prefix
            if (n.suffix)
                card.nameSuffix = n.suffix
        }

        if (data.title)
            card.title = data.title

        if (data.birthday)
            card.birthday = data.birthday

        if (data.photo)
            card.photo.attachFromUrl(data.photo.url, data.photo.mediaType)

        data.phone?.forEach(el => {
            let key: 'workPhone' | 'cellPhone' | 'pagerPhone' | 'homePhone' | 'otherPhone' = 'otherPhone'
            switch (el.type) {
                case PhoneType.Work:
                    key = 'workPhone'
                    break

                case PhoneType.Cell:
                    key = 'cellPhone'
                    break

                case PhoneType.Pager:
                    key = 'pagerPhone'
                    break

                case PhoneType.Home:
                    key = 'homePhone'
                    break
            }
            const v = card[key]
            if (Array.isArray(v))
                v.push(el.value)
            else
                card[key] = [el.value]
        })

        data.email?.forEach(el => {
            let key: 'workEmail' | 'email' | 'otherEmail' = 'otherEmail'
            switch (el.type) {
                case AddressType.Work:
                    key = 'workEmail'
                    break

                case AddressType.Home:
                    key = 'email'
                    break
            }
            const v = card[key]
            if (Array.isArray(v))
                v.push(el.value)
            else
                card[key] = [el.value]
        })

        if (data.address) {
            Object.entries(data.address).forEach(([k, v]) => {
                let key: 'workAddress' | 'homeAddress' = 'homeAddress'
                switch (k) {
                    case 'home':
                        key = 'homeAddress'
                        break

                    case 'work':
                        key = 'workAddress'
                        break
                }
                if (v.streetAddress)
                    card[key].street = v.streetAddress
                if (v.locality)
                    card[key].city = v.locality
                if (v.postalCode)
                    card[key].postalCode = v.postalCode
                if (v.stateProvince)
                    card[key].stateProvince = v.stateProvince

                const cr = new Array<string>()
                if (v.region)
                    cr.push(v.region)

                if (v.country)
                    cr.push(v.country)

                const countryRegion = cr
                    .map(p => p.trim())
                    .filter(p => !!p)
                    .join(', ')

                if (countryRegion)
                    card[key].countryRegion = countryRegion
            })
        }

        if (data.logo)
            card.logo.attachFromUrl(data.logo.url, data.logo.mediaType)

        if (data.note)
            card.note = data.note

        if (data.company)
            card.organization = data.company

        const pushMsgProtocol = (username: string, type: string, protocol: string, service: string) => {
            let group = getGroup()
            extraProps.push(vcf.Property.fromJSON([
                type,
                {
                    group
                },
                'text',
                username
            ]))
            extraProps.push(vcf.Property.fromJSON([
                'xAbLabel',
                {
                    group
                },
                'text',
                service
            ]))

            group = getGroup()
            extraProps.push(vcf.Property.fromJSON([
                'impp',
                {
                    group,
                    xServiceType: service
                },
                'text',
                `${protocol}:${username}`
            ]))
            extraProps.push(vcf.Property.fromJSON([
                'xAbLabel',
                {
                    group
                },
                'text',
                service
            ]))
        }

        if (data.social)
            data.social.forEach((v) => {
                switch (v.type) {
                    case SocialType.Messenger:
                        extraProps.push(vcf.Property.fromJSON([
                            'xSocialprofile',
                            {
                                type: 'messenger',
                                xUser: v.value
                            },
                            'text',
                            'x-apple:messenger'
                        ]))
                        const group = getGroup()
                        extraProps.push(vcf.Property.fromJSON([
                            'impp',
                            {
                                group,
                                xServiceType: 'Facebook'
                            },
                            'text',
                            `xmpp:${v.value}`
                        ]))
                        extraProps.push(vcf.Property.fromJSON([
                            'xAbLabel',
                            {
                                group
                            },
                            'text',
                            'Facebook'
                        ]))
                        break

                    case SocialType.Twitter:
                    case SocialType.Facebook:
                    case SocialType.LinkedIn:
                    case SocialType.SinaWeibo:
                        const surl = getSocialUrl(v)
                        if (surl)
                            card.socialUrls[v.type] = surl
                        break

                    case SocialType.Jabber:
                        pushMsgProtocol(v.value, 'xJabber', 'xmpp', 'Jabber')
                        break

                    case SocialType.QQ:
                        pushMsgProtocol(v.value, 'xQq', 'x-apple', 'QQ')
                        break

                    case SocialType.GaduGadu:
                        pushMsgProtocol(v.value, 'xGaduGadu', 'x-apple', 'GaduGadu')
                        break
                }
            })

        if (data.website?.company)
            card.workUrl = data.website.company

        if (data.website?.personal)
            card.url = data.website.personal

        if (this.uuid)
            card.uid = this.uuid

        const parsed = vcf.parse(card.getFormattedString())[0]
        extraProps.forEach(prop => parsed.addProperty(prop))

        return parsed.toString('3.0')
            .replace(/X-SOCIALPROFILE;CHARSET=UTF-8;/gi, 'X-SOCIALPROFILE;')
            .replace(/X-AB-LABEL/gi, 'X-ABLabel')
            .replace(/X-SOCIALPROFILE;(TYPE=[^:]*?):/gi, (tx, m) => tx.replace(m, m.toLowerCase().replace('type=messenger', 'type=Messenger')))
            .replace(/;TYPE=OTHER[^;:]*?([;:])/ig, (_, m) => m)
    }
}

const socialUrls = {
    [SocialType.Twitter]: 'https://x.com/',
    [SocialType.Facebook]: 'https://www.facebook.com/',
    [SocialType.LinkedIn]: 'https://www.linkedin.com/in/',
    [SocialType.SinaWeibo]: 'https://weibo.com/n/',
    [SocialType.Messenger]: 'https://www.messenger.com/t/'
}

function getSocialUrl({ value, type }: { value: string, type: `${SocialType}` }) {
    let val = value?.trim()
    if (!val.match(/^https?:\/\//im)) {
        try {
            const u = new URL(socialUrls[type as keyof typeof socialUrls])
            u.pathname = (u.pathname + '/' + val).replace(/[\/\\]+/g, '/')
            val = u.toString()
        } catch {
            return undefined
        }
    }
    return val
}

