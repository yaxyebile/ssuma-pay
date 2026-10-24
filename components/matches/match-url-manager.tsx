"use client"

import { useState } from "react"
import { toast } from "sonner"
import { bulkUpdateMatchCategory5, updateMatchCategory5ById } from "@/app/actions/match-actions"
import {
    CATEGORY5_CHANNELS,
    CATEGORY5_CHANNEL_LABELS,
    isValidCategory5Value,
} from "@/lib/match-category5"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Globe, Hash, Link2, Loader2, Save, Tv, Zap } from "lucide-react"

const PLAYER_STATUS_OPTIONS = [
    { value: "player", label: "Player" },
    { value: "token", label: "Token" },
    { value: "browser", label: "Browser" },
] as const

function Category5Picker({
    mode,
    customUrl,
    onModeChange,
    onCustomUrlChange,
    idPrefix,
}: {
    mode: string
    customUrl: string
    onModeChange: (mode: string) => void
    onCustomUrlChange: (url: string) => void
    idPrefix: string
}) {
    return (
        <div className="space-y-3">
            <div className="space-y-2">
                <Label htmlFor={`${idPrefix}-mode`} className="text-xs font-black uppercase tracking-widest text-orange-600">
                    Category 5 (App / M3U8 / Link)
                </Label>
                <Select value={mode} onValueChange={onModeChange}>
                    <SelectTrigger id={`${idPrefix}-mode`} className="h-11 rounded-xl border-orange-200 font-bold">
                        <SelectValue placeholder="Select channel" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                        {CATEGORY5_CHANNELS.map((ch) => (
                            <SelectItem key={ch} value={ch} className="font-bold">
                                {CATEGORY5_CHANNEL_LABELS[ch]}
                            </SelectItem>
                        ))}
                        <SelectItem value="others" className="font-bold">
                            Others (Browser / custom link)
                        </SelectItem>
                    </SelectContent>
                </Select>
            </div>
            {mode === "others" && (
                <div className="space-y-2">
                    <Label htmlFor={`${idPrefix}-url`} className="text-xs font-black uppercase tracking-widest text-gray-500 flex items-center gap-2">
                        <Globe className="h-3 w-3" /> Stream or page URL
                    </Label>
                    <Input
                        id={`${idPrefix}-url`}
                        value={customUrl}
                        onChange={(e) => onCustomUrlChange(e.target.value)}
                        placeholder="https://example.com/stream.m3u8"
                        className="h-11 rounded-xl border-orange-200 font-bold"
                    />
                </div>
            )}
        </div>
    )
}

function resolvedCategory5Value(mode: string, customUrl: string): string {
    return mode === "others" ? customUrl.trim() : mode
}

export function MatchUrlManager() {
    const [singleId, setSingleId] = useState("")
    const [singleMode, setSingleMode] = useState("bein1")
    const [singleCustomUrl, setSingleCustomUrl] = useState("")
    const [singleStatus, setSingleStatus] = useState("token")
    const [singleSubmitting, setSingleSubmitting] = useState(false)

    const [bulkMode, setBulkMode] = useState("bein1")
    const [bulkCustomUrl, setBulkCustomUrl] = useState("")
    const [bulkStatus, setBulkStatus] = useState("token")
    const [bulkSubmitting, setBulkSubmitting] = useState(false)

    const onSingleModeChange = (val: string) => {
        setSingleMode(val)
        if (val === "others") setSingleStatus("browser")
        else if (singleStatus === "browser" && val !== "others") setSingleStatus("token")
    }

    const onBulkModeChange = (val: string) => {
        setBulkMode(val)
        if (val === "others") setBulkStatus("browser")
        else if (bulkStatus === "browser" && val !== "others") setBulkStatus("token")
    }

    const handleSingleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        const category5_url = resolvedCategory5Value(singleMode, singleCustomUrl)
        if (!singleId.trim()) {
            toast.error("Enter a match ID")
            return
        }
        if (!isValidCategory5Value(category5_url)) {
            toast.error("Choose a channel or enter a valid URL")
            return
        }

        setSingleSubmitting(true)
        try {
            const res = await updateMatchCategory5ById(singleId.trim(), category5_url, singleStatus)
            if (res.success) {
                toast.success(res.message || `Match ID ${singleId} updated successfully!`)
            } else {
                toast.error(res.message || "Update failed")
            }
        } catch {
            toast.error("An error occurred")
        } finally {
            setSingleSubmitting(false)
        }
    }

    const handleBulkSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        const category5_url = resolvedCategory5Value(bulkMode, bulkCustomUrl)
        if (!isValidCategory5Value(category5_url)) {
            toast.error("Choose a channel or enter a valid URL")
            return
        }
        if (!confirm("Update Category 5 and player status for ALL matches? This cannot be undone easily.")) {
            return
        }

        setBulkSubmitting(true)
        const loading = toast.loading("Updating all matches...")
        try {
            const res = await bulkUpdateMatchCategory5(category5_url, bulkStatus)
            if (res.success) {
                toast.success(res.message || "All matches updated!", { id: loading })
            } else {
                toast.error(res.message || "Bulk update failed", { id: loading })
            }
        } catch {
            toast.error("An error occurred", { id: loading })
        } finally {
            setBulkSubmitting(false)
        }
    }

    const legacyPhpUrl = process.env.NEXT_PUBLIC_MATCH_URL_MANAGER_PHP_URL

    return (
        <div className="space-y-8 pb-10">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-2xl bg-orange-600 flex items-center justify-center text-white shadow-lg">
                        <Tv className="h-6 w-6" />
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-gray-900 tracking-tight">Match URL Manager</h2>
                        <p className="text-sm text-muted-foreground font-medium">
                            Update Category 5 URLs and player status (single or bulk)
                        </p>
                    </div>
                </div>
                {legacyPhpUrl ? (
                    <Button variant="outline" className="rounded-xl border-orange-200 font-bold" asChild>
                        <a href={legacyPhpUrl} target="_blank" rel="noopener noreferrer">
                            <Link2 className="h-4 w-4 mr-2" />
                            Open PHP tool
                        </a>
                    </Button>
                ) : null}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="border-orange-100 shadow-xl shadow-orange-500/5">
                    <CardHeader className="border-b border-orange-50 bg-orange-50/40">
                        <CardTitle className="flex items-center gap-2 text-lg font-black">
                            <Save className="h-5 w-5 text-orange-600" />
                            Single match update
                        </CardTitle>
                        <CardDescription>Update one match by ID</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <form onSubmit={handleSingleSubmit} className="space-y-5">
                            <div className="space-y-2">
                                <Label htmlFor="match-id" className="text-xs font-black uppercase tracking-widest text-gray-500 flex items-center gap-2">
                                    <Hash className="h-3 w-3" /> Match ID
                                </Label>
                                <Input
                                    id="match-id"
                                    type="number"
                                    value={singleId}
                                    onChange={(e) => setSingleId(e.target.value)}
                                    placeholder="Enter match ID"
                                    className="h-11 rounded-xl border-orange-100 font-bold"
                                    required
                                />
                            </div>

                            <Category5Picker
                                idPrefix="single"
                                mode={singleMode}
                                customUrl={singleCustomUrl}
                                onModeChange={onSingleModeChange}
                                onCustomUrlChange={setSingleCustomUrl}
                            />

                            <div className="space-y-2">
                                <Label className="text-xs font-black uppercase tracking-widest text-gray-500">Player status</Label>
                                <Select value={singleStatus} onValueChange={setSingleStatus}>
                                    <SelectTrigger className="h-11 rounded-xl border-orange-100 font-bold">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl">
                                        {PLAYER_STATUS_OPTIONS.map((opt) => (
                                            <SelectItem key={opt.value} value={opt.value} className="font-bold">
                                                {opt.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <Button
                                type="submit"
                                disabled={singleSubmitting}
                                className="w-full h-12 rounded-xl bg-orange-600 hover:bg-orange-700 font-black"
                            >
                                {singleSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : "Update match"}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                <Card className="border-orange-100 shadow-xl shadow-orange-500/5">
                    <CardHeader className="border-b border-orange-50 bg-orange-50/40">
                        <CardTitle className="flex items-center gap-2 text-lg font-black">
                            <Zap className="h-5 w-5 text-orange-600" />
                            Bulk update
                        </CardTitle>
                        <CardDescription>Apply the same URL and status to every match</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <form onSubmit={handleBulkSubmit} className="space-y-5">
                            <Category5Picker
                                idPrefix="bulk"
                                mode={bulkMode}
                                customUrl={bulkCustomUrl}
                                onModeChange={onBulkModeChange}
                                onCustomUrlChange={setBulkCustomUrl}
                            />

                            <div className="space-y-2">
                                <Label className="text-xs font-black uppercase tracking-widest text-gray-500">Player status</Label>
                                <Select value={bulkStatus} onValueChange={setBulkStatus}>
                                    <SelectTrigger className="h-11 rounded-xl border-orange-100 font-bold">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl">
                                        {PLAYER_STATUS_OPTIONS.map((opt) => (
                                            <SelectItem key={opt.value} value={opt.value} className="font-bold">
                                                {opt.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <Button
                                type="submit"
                                disabled={bulkSubmitting}
                                variant="destructive"
                                className="w-full h-12 rounded-xl font-black"
                            >
                                {bulkSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : "Update all matches"}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
