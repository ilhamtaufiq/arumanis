import { useState, type ReactNode } from 'react'
import { getHttpCatImageUrl, HTTP_CAT_ATTRIBUTION_URL } from '@/lib/http-cat'

type HttpCatImageProps = {
    status: number
    className?: string
    fallback?: ReactNode
    showAttribution?: boolean
}

export function HttpCatImage({
    status,
    className,
    fallback = null,
    showAttribution = true,
}: HttpCatImageProps) {
    const [failed, setFailed] = useState(false)
    const src = getHttpCatImageUrl(status)

    if (!src || failed) {
        return <>{fallback}</>
    }

    return (
        <div className={className}>
            <img
                src={src}
                alt={`HTTP ${status}`}
                loading="lazy"
                decoding="async"
                className="mx-auto max-h-56 w-auto max-w-full rounded-2xl border border-white/10 shadow-2xl shadow-black/40"
                onError={() => setFailed(true)}
            />
            {showAttribution ? (
                <p className="mt-3 text-[10px] text-slate-600">
                    Ilustrasi dari{' '}
                    <a
                        href={HTTP_CAT_ATTRIBUTION_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-slate-500 underline-offset-2 hover:text-slate-400 hover:underline"
                    >
                        HTTP Cats
                    </a>
                </p>
            ) : null}
        </div>
    )
}