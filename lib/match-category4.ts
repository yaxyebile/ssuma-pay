export const CATEGORY4_PRESETS = [
    "not.php",
    "play1.php",
    "play2.php",
    "play3.php",
    "play4.php",
    "play5.php",
    "play6.php",
] as const

export const CATEGORY4_PRESET_LABELS: Record<(typeof CATEGORY4_PRESETS)[number], string> = {
    "not.php": "Not on Time",
    "play1.php": "Channel 1",
    "play2.php": "Channel 2",
    "play3.php": "Channel 3",
    "play4.php": "Channel 4",
    "play5.php": "Channel 5",
    "play6.php": "Channel 6",
}

export function resolveCategory4Mode(url: string): { mode: string; customUrl: string } {
    if ((CATEGORY4_PRESETS as readonly string[]).includes(url)) {
        return { mode: url, customUrl: "" }
    }
    if (!url) {
        return { mode: "not.php", customUrl: "" }
    }
    return { mode: "others", customUrl: url }
}

export function isValidCategory4Value(val: string): boolean {
    if (!val.trim()) return false
    if ((CATEGORY4_PRESETS as readonly string[]).includes(val)) return true
    try {
        new URL(val)
        return true
    } catch {
        return false
    }
}

export function category4LiveUrl(stored: string): string {
    try {
        new URL(stored)
        return stored
    } catch {
        return `https://zentova.net/${stored}`
    }
}
