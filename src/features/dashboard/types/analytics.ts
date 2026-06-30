export type ActiveVisitorPage = {
    path: string
    views: number
}

export type ActiveVisitorsData = {
    visitorCount: number
    viewCount: number
    eventCount: number
    topPages: ActiveVisitorPage[]
    timestamp: number
}

export type UmamiConfigGap = 'missing_token' | 'missing_website_id' | 'missing_api_url'

export type ActiveVisitorsDisabledResponse = {
    enabled: false
    reason?: UmamiConfigGap
}

export type ActiveVisitorsEnabledResponse = {
    enabled: true
    data: ActiveVisitorsData
}

export type ActiveVisitorsResponse = ActiveVisitorsDisabledResponse | ActiveVisitorsEnabledResponse