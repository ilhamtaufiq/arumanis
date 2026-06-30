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

export type ActiveVisitorsDisabledResponse = {
    enabled: false
}

export type ActiveVisitorsEnabledResponse = {
    enabled: true
    data: ActiveVisitorsData
}

export type ActiveVisitorsResponse = ActiveVisitorsDisabledResponse | ActiveVisitorsEnabledResponse