export const CATEGORY5_BEIN10_UUID = "f9047ba" as const

export const CATEGORY5_CHANNELS = [
    "bein1",
    "bein2",
    "bein3",
    "bein4",
    "bein5",
    CATEGORY5_BEIN10_UUID,
] as const

export const CATEGORY5_CHANNEL_LABELS: Record<(typeof CATEGORY5_CHANNELS)[number], string> = {
    bein1: "Channel 1",
    bein2: "Channel 2",
    bein3: "Channel 3",
    bein4: "Channel 4",
    bein5: "Channel 5",
    [CATEGORY5_BEIN10_UUID]: "BEIN 10",
}

const LEGACY_CATEGORY5_CHANNELS: Record<string, (typeof CATEGORY5_CHANNELS)[number]> = {
    bein10: CATEGORY5_BEIN10_UUID,
}

export function normalizeCategory5Value(value: string): string {
    return LEGACY_CATEGORY5_CHANNELS[value] ?? value
}

export function resolveCategory5Mode(url: string): { mode: string; customUrl: string } {
    const normalized = normalizeCategory5Value(url)
    if ((CATEGORY5_CHANNELS as readonly string[]).includes(normalized)) {
        return { mode: normalized, customUrl: "" }
    }
    if (!normalized) {
        return { mode: "bein1", customUrl: "" }
    }
    return { mode: "others", customUrl: normalized }
}

export function category5DisplayName(value: string): string {
    const normalized = normalizeCategory5Value(value)
    return CATEGORY5_CHANNEL_LABELS[normalized as keyof typeof CATEGORY5_CHANNEL_LABELS] ?? value
}

export function isValidCategory5Value(val: string): boolean {
    if (!val.trim()) return false
    if ((CATEGORY5_CHANNELS as readonly string[]).includes(normalizeCategory5Value(val))) return true
    try {
        new URL(val)
        return true
    } catch {
        return false
    }
}
