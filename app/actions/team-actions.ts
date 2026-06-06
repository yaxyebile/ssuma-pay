const API_KEY = process.env.MATCHES_API_KEY
const TEAMS_URL = "https://zentova.net/teams.php"

const BROWSER_HEADERS = {
    'Content-Type': 'application/json',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'application/json',
    'Origin': 'https://zentova.net',
    'Referer': 'https://zentova.net/'
}

export async function fetchTeams() {
    "use server"
    try {
        const response = await fetch(TEAMS_URL, {
            method: 'POST',
            headers: BROWSER_HEADERS,
            body: JSON.stringify({
                api_key: API_KEY,
                action: "list"
            }),
            cache: 'no-store'
        })
        const data = await response.json()

        if (data.success && Array.isArray(data.teams)) {
            data.teams = data.teams.map((team: any) => ({
                ...team,
                logo: team.logo?.startsWith('http') ? team.logo : `https://zentova.net/${team.logo}`
            }))
        }

        return data
    } catch (error) {
        console.error("Fetch Teams Error:", error)
        return { success: false, error: "Failed to fetch teams" }
    }
}

export async function addTeam(name: string, logo: string) {
    "use server"
    try {
        const response = await fetch(TEAMS_URL, {
            method: 'POST',
            headers: BROWSER_HEADERS,
            body: JSON.stringify({
                api_key: API_KEY,
                action: "add",
                name,
                logo
            })
        })
        return await response.json()
    } catch (error) {
        return { success: false, error: "Failed to add team" }
    }
}

export async function editTeam(id: number | string, name: string, logo: string) {
    "use server"
    try {
        const response = await fetch(TEAMS_URL, {
            method: 'POST',
            headers: BROWSER_HEADERS,
            body: JSON.stringify({
                api_key: API_KEY,
                action: "edit",
                id,
                name,
                logo
            })
        })
        return await response.json()
    } catch (error) {
        return { success: false, error: "Failed to update team" }
    }
}
