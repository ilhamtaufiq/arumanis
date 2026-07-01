const HTTP_CAT_BASE = 'https://http.cat'

/** Status codes with illustrations on https://http.cat/ */
export const HTTP_CAT_STATUS_CODES = [
    100, 101, 102, 103,
    200, 201, 202, 203, 204, 205, 206, 207, 208, 226,
    300, 301, 302, 303, 304, 305, 307, 308,
    400, 401, 402, 403, 404, 405, 406, 407, 408, 409, 410,
    411, 412, 413, 414, 415, 416, 417, 418, 421, 422, 423, 424, 425, 426,
    428, 429, 431, 451,
    500, 501, 502, 503, 504, 505, 506, 507, 508, 510, 511,
] as const

export type HttpCatStatusCode = (typeof HTTP_CAT_STATUS_CODES)[number]

const HTTP_CAT_SET = new Set<number>(HTTP_CAT_STATUS_CODES)

export function isHttpCatStatusCode(status: number): status is HttpCatStatusCode {
    return HTTP_CAT_SET.has(status)
}

export function getHttpCatImageUrl(status: number): string | null {
    if (!isHttpCatStatusCode(status)) {
        return null
    }

    return `${HTTP_CAT_BASE}/${status}`
}

export const HTTP_CAT_ATTRIBUTION_URL = HTTP_CAT_BASE