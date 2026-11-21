"use server"

import type { MatchSource } from "@/lib/match-types"

type MatchEndpoint = {
    url: string
    origin: string
    logoBase: string
    apiKey?: string
}

const MATCH_ENDPOINTS: Record<MatchSource, MatchEndpoint> = {
    orangegas: {
        url: "https://orangegas.store/matches.php",
        origin: "https://orangegas.store",
        logoBase: "https://orangegas.store/",
        apiKey: process.env.MATCHES_API_KEY,
    },
    zentova: {
        url: "https://zentova.net/action.php",
        origin: "https://zentova.net",
        logoBase: "https://zentova.net/",
        apiKey: process.env.ZENTOVA_MATCHES_API_KEY || process.env.TEAMS_API_KEY,
    },
}

const MATCH_SOURCES: MatchSource[] = ["orangegas", "zentova"]

function getEndpoint(source?: MatchSource): MatchEndpoint {
    return source === "zentova" ? MATCH_ENDPOINTS.zentova : MATCH_ENDPOINTS.orangegas
}

function getHeaders(endpoint: MatchEndpoint) {
    return {
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "application/json",
        Origin: endpoint.origin,
        Referer: `${endpoint.origin}/`,
    }
}

function resolveLogo(value: unknown, base: string): string {
    if (typeof value !== "string" || !value.trim()) return ""
    try {
        return new URL(value, base).toString()
    } catch {
        return value
    }
}

function stripMatchSource(data: any) {
    if (!data || typeof data !== "object" || Array.isArray(data)) return data
    const { source: _source, ...apiData } = data
    return apiData
}

async function fetchMatchesFrom(source: MatchSource) {
    const endpoint = getEndpoint(source)
    if (!endpoint.apiKey) {
        return { source, matches: null as any[] | null, error: `${source} API key is not configured.` }
    }

    try {
        const response = await fetch(endpoint.url, {
            method: "POST",
            headers: getHeaders(endpoint),
            body: JSON.stringify({ api_key: endpoint.apiKey, action: "list" }),
            cache: "no-store",
        })
        const data = await response.json()
        if (!response.ok || !data.success || !Array.isArray(data.matches)) {
            return {
                source,
                matches: null as any[] | null,
                error: data.message || data.error || `${source} failed to load matches.`,
            }
        }

        return {
            source,
            error: null,
            matches: data.matches.map((match: any) => ({
                ...match,
                source,
                team1_logo: resolveLogo(match.team1_logo, endpoint.logoBase),
                team2_logo: resolveLogo(match.team2_logo, endpoint.logoBase),
            })),
        }
    } catch (error) {
        console.error(`Fetch ${source} Matches Error:`, error)
        return { source, matches: null as any[] | null, error: `Failed to fetch matches from ${source}.` }
    }
}

async function sendMatchAction(source: MatchSource, payload: Record<string, unknown>, fallbackError: string) {
    const endpoint = getEndpoint(source)
    if (!endpoint.apiKey) {
        return { success: false, message: `${source} API key is not configured.` }
    }

    try {
        const response = await fetch(endpoint.url, {
            method: "POST",
            headers: getHeaders(endpoint),
            body: JSON.stringify({ api_key: endpoint.apiKey, ...payload }),
        })
        return await response.json()
    } catch {
        return { success: false, message: fallbackError }
    }
}

export async function fetchMatches() {
    const results = await Promise.all(MATCH_SOURCES.map(fetchMatchesFrom))
    const available = results.filter((result) => Array.isArray(result.matches))
    const warnings = results.flatMap((result) => result.error ? [result.error] : [])

    if (available.length === 0) {
        return { success: false, error: warnings.join(" ") || "Failed to fetch matches." }
    }

    return {
        success: true,
        matches: available.flatMap((result) => result.matches ?? []),
        ...(warnings.length ? { warnings } : {}),
    }
}

export async function addMatch(data: any) {
    const results = await Promise.all(MATCH_SOURCES.map(async (source) => ({
        source,
        result: await sendMatchAction(source, { action: "add", data: stripMatchSource(data) }, "Failed to add match"),
    })))
    const succeeded = results.filter(({ result }) => result.success).map(({ source }) => source)
    const failed = results.filter(({ result }) => !result.success).map(({ source, result }) => ({
        source,
        message: result.message || "The endpoint rejected the match.",
    }))

    if (failed.length === 0) {
        return { success: true, message: "Match added to both endpoints." }
    }

    if (succeeded.length === 0) {
        return { success: false, message: failed.map(({ source, message }) => `${source}: ${message}`).join(" ") }
    }

    return {
        success: false,
        partial: true,
        message: `Match was added to ${succeeded.join(" and ")}, but failed on ${failed.map(({ source }) => source).join(" and ")}. ${failed.map(({ message }) => message).join(" ")}`,
    }
}

export async function updateMatch(id: number | string, data: any, source: MatchSource = "orangegas") {
    return sendMatchAction(source, { action: "update", id, data: stripMatchSource(data) }, "Failed to update match")
}

export async function updateMatchCategory5ById(
    id: number | string,
    category5_url: string,
    STATUS: string,
) {
    const list = await fetchMatches()
    if (!list.success || !Array.isArray(list.matches)) {
        return { success: false, message: list.error || "Failed to load matches" }
    }
    const matches = list.matches.filter((item: any) => String(item.id) === String(id))
    if (matches.length === 0) {
        return { success: false, message: `Match ${id} was not found.` }
    }

    const results = await Promise.all(matches.map((match: any) =>
        updateMatch(id, { ...match, category5_url, STATUS }, match.source)
    ))
    const updated = results.filter((result: any) => result.success).length
    if (updated === 0) return { success: false, message: `Failed to update match ${id}.` }
    if (updated < matches.length) {
        return { success: true, message: `Updated match ${id} in ${updated} of ${matches.length} endpoints.` }
    }
    return { success: true, message: `Match ${id} updated in ${matches.map((match: any) => match.source).join(" and ")}.` }
}

export async function bulkUpdateMatchCategory5(category5_url: string, STATUS: string) {
    const list = await fetchMatches()
    if (!list.success || !Array.isArray(list.matches)) {
        return { success: false, message: list.error || "Failed to load matches" }
    }
    const matches = list.matches as { id: string | number; source: MatchSource }[]
    if (matches.length === 0) {
        return { success: true, message: "No matches to update", count: 0 }
    }

    let updated = 0
    for (const match of matches) {
        const fullMatch = list.matches.find((item: any) =>
            String(item.id) === String(match.id) && item.source === match.source
        )
        if (!fullMatch) continue
        const res = await updateMatch(match.id, { ...fullMatch, category5_url, STATUS }, match.source)
        if (res.success) updated++
    }

    if (updated === 0) {
        return { success: false, message: "Failed to update any matches" }
    }
    if (updated < matches.length) {
        return {
            success: true,
            message: `Updated ${updated} of ${matches.length} matches`,
            count: updated,
        }
    }
    return { success: true, message: "All matches updated successfully!", count: updated }
}

export async function deleteMatch(id: number | string, source: MatchSource = "orangegas") {
    return sendMatchAction(source, { action: "delete", id }, "Failed to delete match")
}

