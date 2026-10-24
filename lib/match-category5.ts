export const CATEGORY5_CHANNELS = ["bein1", "bein2", "bein3", "bein4", "bein5"] as const

export const CATEGORY5_CHANNEL_LABELS: Record<(typeof CATEGORY5_CHANNELS)[number], string> = {
    bein1: "Channel 1",
    bein2: "Channel 2",
    bein3: "Channel 3",
    bein4: "Channel 4",
    bein5: "Channel 5",
}

export function resolveCategory5Mode(url: string): { mode: string; customUrl: string } {
    if ((CATEGORY5_CHANNELS as readonly string[]).includes(url)) {
        return { mode: url, customUrl: "" }
    }
    if (!url) {
        return { mode: "bein1", customUrl: "" }
    }
    return { mode: "others", customUrl: url }
}

export function isValidCategory5Value(val: string): boolean {
    if (!val.trim()) return false
    if ((CATEGORY5_CHANNELS as readonly string[]).includes(val)) return true
    try {
        new URL(val)
        return true
    } catch {
        return false
    }
}
