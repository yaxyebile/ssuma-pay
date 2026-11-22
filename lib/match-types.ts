export type MatchSource = "orangegas" | "zentova"
export type MatchSourceIds = Partial<Record<MatchSource, string | number>>
export type MatchSourceRecords = Partial<Record<MatchSource, Record<string, unknown>>>
