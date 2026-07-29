import { NextRequest, NextResponse } from "next/server"

const DOMAIN = "http://primaprotv.us"
const USERNAME = "5a91b4b14364"
const PASSWORD = "f75ea245c0"

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url)
    const streamId = searchParams.get("id")
    const format = searchParams.get("format") || "m3u8" // m3u8 or ts
    const segment = searchParams.get("seg") // for proxying HLS segments

    if (!streamId && !segment) {
        return NextResponse.json({ error: "Missing stream id" }, { status: 400 })
    }

    try {
        let targetUrl: string

        if (segment) {
            // Proxy an HLS segment — the segment param is the full relative path
            // Segments can be relative or absolute URLs in the m3u8 playlist
            if (segment.startsWith("http")) {
                targetUrl = segment
            } else {
                targetUrl = `${DOMAIN}${segment.startsWith("/") ? "" : "/"}${segment}`
            }
        } else if (format === "ts") {
            targetUrl = `${DOMAIN}/live/${USERNAME}/${PASSWORD}/${streamId}.ts`
        } else {
            targetUrl = `${DOMAIN}/live/${USERNAME}/${PASSWORD}/${streamId}.m3u8`
        }

        const response = await fetch(targetUrl, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                "Referer": DOMAIN + "/",
                "Origin": DOMAIN,
                "Accept": "*/*",
            },
            // @ts-ignore
            cache: "no-store",
        })

        if (!response.ok) {
            return NextResponse.json(
                { error: `Upstream error: ${response.status} ${response.statusText}` },
                { status: response.status }
            )
        }

        const contentType = response.headers.get("content-type") || "application/octet-stream"

        // If it's an M3U8 playlist, rewrite segment URLs to go through our proxy
        if (format === "m3u8" && !segment) {
            const text = await response.text()
            const rewrittenPlaylist = rewriteM3U8(text, streamId!)
            return new NextResponse(rewrittenPlaylist, {
                headers: {
                    "Content-Type": "application/vnd.apple.mpegurl",
                    "Access-Control-Allow-Origin": "*",
                    "Cache-Control": "no-cache, no-store, must-revalidate",
                },
            })
        }

        // For binary segments (.ts), stream them through
        const body = response.body
        return new NextResponse(body, {
            headers: {
                "Content-Type": contentType,
                "Access-Control-Allow-Origin": "*",
                "Cache-Control": "no-cache",
            },
        })
    } catch (err: any) {
        console.error("IPTV Proxy error:", err)
        return NextResponse.json(
            { error: err.message || "Proxy error" },
            { status: 500 }
        )
    }
}

/**
 * Rewrite M3U8 playlist segment URLs to route through our proxy
 */
function rewriteM3U8(playlist: string, streamId: string): string {
    const lines = playlist.split("\n")
    const rewritten = lines.map((line) => {
        const trimmed = line.trim()
        // Skip comments/tags
        if (trimmed.startsWith("#") || trimmed === "") {
            return line
        }
        // This is a segment URL — rewrite it to our proxy
        const segUrl = trimmed.startsWith("http")
            ? trimmed
            : trimmed.startsWith("/")
                ? trimmed
                : `/hls/${USERNAME}/${PASSWORD}/${trimmed}`

        return `/api/iptv-proxy?seg=${encodeURIComponent(segUrl)}&id=${streamId}`
    })
    return rewritten.join("\n")
}
