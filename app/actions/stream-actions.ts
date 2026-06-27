"use server"

const DEFAULT_STREAMS = [
    "https://bein1.goalflare.net/live/stream1/output1.m3u8",
    "https://bein1.goalflare.net/live/stream2/output2.m3u8",
    "https://bein1.goalflare.net/live/stream3/output3.m3u8",
    "https://bein1.goalflare.net/live/streambase/playlist.m3u8",
    "https://bein1.goalflare.net/live/streammedium/playlist.m3u8",
    "https://bein1.goalflare.net/live/streamhd/playlist.m3u8",
    "https://bein1.goalflare.net/live/b/output2.m3u8",
    "https://bein1.goalflare.net/live/c/output3.m3u8",
    "https://bein1.goalflare.net/live/a/output1.m3u8"
];

const STREAMS = process.env.STREAMS_LIST ? process.env.STREAMS_LIST.split(',') : DEFAULT_STREAMS;

const RED_FLAGS = ['#EXT-X-ENDLIST', '#EXT-X-DISCONTINUITY'];

export interface StreamStatus {
    name: string
    url: string
    http: number
    status: 'ok' | 'warning' | 'error'
    flags: string[]
}

export async function checkStreamsAction(): Promise<StreamStatus[]> {
    const results = await Promise.all(STREAMS.map(async (url) => {
        try {
            const response = await fetch(url, {
                cache: 'no-store',
                headers: {
                    'User-Agent': 'Mozilla/5.0'
                },
                next: { revalidate: 0 }
            })

            const httpCode = response.status
            const text = await response.text()

            const nameMatch = url.match(/live\/([^\/]+)\//)
            const name = nameMatch ? nameMatch[1].charAt(0).toUpperCase() + nameMatch[1].slice(1) : 'Stream'

            const stream: StreamStatus = {
                name,
                url,
                http: httpCode,
                status: 'ok',
                flags: []
            }

            if (httpCode !== 200) {
                stream.status = 'error'
            } else {
                for (const flag of RED_FLAGS) {
                    if (text.includes(flag)) {
                        stream.status = 'warning'
                        stream.flags.push(flag)
                    }
                }
            }

            return stream
        } catch (error) {
            const nameMatch = url.match(/live\/([^\/]+)\//)
            return {
                name: nameMatch ? nameMatch[1].charAt(0).toUpperCase() + nameMatch[1].slice(1) : 'Stream',
                url,
                http: 0,
                status: 'error',
                flags: []
            } as StreamStatus
        }
    }))

    return results
}

export async function fetchStreamContentAction(url: string): Promise<string> {
    try {
        const response = await fetch(url, {
            cache: 'no-store',
            headers: { 'User-Agent': 'Mozilla/5.0' }
        })
        return await response.text()
    } catch (error) {
        return "Failed to load stream content from server."
    }
}
