"use server"

const API_KEY = process.env.MATCHES_API_KEY
const MATCHES_URL = "https://zentova.net/action.php"

const BROWSER_HEADERS = {
    'Content-Type': 'application/json',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'application/json',
    'Origin': 'https://zentova.net',
    'Referer': 'https://zentova.net/'
}

export async function fetchMatches() {
    try {
        const response = await fetch(MATCHES_URL, {
            method: 'POST',
            headers: BROWSER_HEADERS,
            body: JSON.stringify({
                api_key: API_KEY,
                action: "list"
            }),
            cache: 'no-store'
        })
        const data = await response.json()

        if (data.success && Array.isArray(data.matches)) {
            data.matches = data.matches.map((match: any) => ({
                ...match,
                team1_logo: match.team1_logo?.startsWith('http') ? match.team1_logo : `https://zentova.net/${match.team1_logo}`,
                team2_logo: match.team2_logo?.startsWith('http') ? match.team2_logo : `https://zentova.net/${match.team2_logo}`
            }))
        }

        return data
    } catch (error) {
        console.error("Fetch Matches Error:", error)
        return { success: false, error: "Failed to fetch matches" }
    }
}

export async function addMatch(data: any) {
    try {
        const response = await fetch(MATCHES_URL, {
            method: 'POST',
            headers: BROWSER_HEADERS,
            body: JSON.stringify({
                api_key: API_KEY,
                action: "add",
                data
            })
        })
        return await response.json()
    } catch (error) {
        return { success: false, error: "Failed to add match" }
    }
}

export async function updateMatch(id: number | string, data: any) {
    try {
        const response = await fetch(MATCHES_URL, {
            method: 'POST',
            headers: BROWSER_HEADERS,
            body: JSON.stringify({
                api_key: API_KEY,
                action: "update",
                id,
                data
            })
        })
        return await response.json()
    } catch (error) {
        return { success: false, error: "Failed to update match" }
    }
}

export async function deleteMatch(id: number | string) {
    try {
        const response = await fetch(MATCHES_URL, {
            method: 'POST',
            headers: BROWSER_HEADERS,
            body: JSON.stringify({
                api_key: API_KEY,
                action: "delete",
                id
            })
        })
        return await response.json()
    } catch (error) {
        return { success: false, error: "Failed to delete match" }
    }
}
