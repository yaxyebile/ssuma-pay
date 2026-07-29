"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Search, Tv, Radio, Play, Copy, Check, Loader2, Satellite, Signal, ChevronDown, X, Volume2 } from "lucide-react"

interface Channel {
    num: number
    name: string
    stream_type: string
    stream_id: number
    stream_icon: string
    epg_channel_id: string | null
    added: string
    category_id: string
    custom_sid: string
    tv_archive: number
    direct_source: string
    tv_archive_duration: number
}

interface CategoryGroup {
    id: string
    name: string
    count: number
}

const DOMAIN = "http://primaprotv.us"
const USERNAME = "5a91b4b14364"
const PASSWORD = "f75ea245c0"

export default function IPTVSearchPage() {
    const [channels, setChannels] = useState<Channel[]>([])
    const [searchTerm, setSearchTerm] = useState("")
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [copiedId, setCopiedId] = useState<number | null>(null)
    const [selectedCategory, setSelectedCategory] = useState<string>("all")
    const [showCategoryDropdown, setShowCategoryDropdown] = useState(false)
    const [playingChannel, setPlayingChannel] = useState<Channel | null>(null)
    const [channelCount, setChannelCount] = useState(0)
    const searchInputRef = useRef<HTMLInputElement>(null)
    const dropdownRef = useRef<HTMLDivElement>(null)
    const videoRef = useRef<HTMLVideoElement>(null)

    // Fetch channels
    useEffect(() => {
        const fetchChannels = async () => {
            try {
                setLoading(true)
                const apiUrl = `${DOMAIN}/player_api.php?username=${USERNAME}&password=${PASSWORD}&action=get_live_streams`
                const res = await fetch(apiUrl)
                if (!res.ok) throw new Error("Failed to fetch channels")
                const data = await res.json()
                setChannels(data)
                setChannelCount(data.length)
            } catch (err: any) {
                setError(err.message || "Failed to load channels")
            } finally {
                setLoading(false)
            }
        }
        fetchChannels()
    }, [])

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setShowCategoryDropdown(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    // Get unique categories
    const categories: CategoryGroup[] = (() => {
        const map = new Map<string, number>()
        channels.forEach(ch => {
            const catId = ch.category_id || "uncategorized"
            map.set(catId, (map.get(catId) || 0) + 1)
        })
        return Array.from(map.entries()).map(([id, count]) => ({
            id,
            name: `Category ${id}`,
            count
        }))
    })()

    // Filter channels
    const filteredChannels = channels.filter(ch => {
        const matchesSearch = searchTerm === "" || ch.name.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesCategory = selectedCategory === "all" || ch.category_id === selectedCategory
        return matchesSearch && matchesCategory
    })

    const getStreamUrl = (ch: Channel) =>
        `${DOMAIN}/live/${USERNAME}/${PASSWORD}/${ch.stream_id}.ts`

    const getM3U8Url = (ch: Channel) =>
        `${DOMAIN}/live/${USERNAME}/${PASSWORD}/${ch.stream_id}.m3u8`

    const copyToClipboard = async (text: string, id: number) => {
        try {
            await navigator.clipboard.writeText(text)
            setCopiedId(id)
            setTimeout(() => setCopiedId(null), 2000)
        } catch {
            // fallback
            const ta = document.createElement("textarea")
            ta.value = text
            document.body.appendChild(ta)
            ta.select()
            document.execCommand("copy")
            document.body.removeChild(ta)
            setCopiedId(id)
            setTimeout(() => setCopiedId(null), 2000)
        }
    }

    const handlePlay = (ch: Channel) => {
        setPlayingChannel(ch)
    }

    const handleClosePlayer = () => {
        setPlayingChannel(null)
    }

    // Keyboard shortcut
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === "/" && !e.ctrlKey && !e.metaKey) {
                const active = document.activeElement
                if (active?.tagName !== "INPUT" && active?.tagName !== "TEXTAREA") {
                    e.preventDefault()
                    searchInputRef.current?.focus()
                }
            }
            if (e.key === "Escape") {
                setPlayingChannel(null)
            }
        }
        window.addEventListener("keydown", handler)
        return () => window.removeEventListener("keydown", handler)
    }, [])

    return (
        <div className="min-h-screen bg-[#0a0a1a] text-white relative overflow-hidden">
            {/* Animated background */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-50%] left-[-30%] w-[80%] h-[80%] rounded-full bg-gradient-to-r from-purple-900/20 to-blue-900/20 blur-[120px] animate-pulse" />
                <div className="absolute bottom-[-40%] right-[-20%] w-[70%] h-[70%] rounded-full bg-gradient-to-r from-cyan-900/15 to-indigo-900/15 blur-[100px] animate-pulse" style={{ animationDelay: "1s" }} />
                <div className="absolute top-[20%] right-[10%] w-[40%] h-[40%] rounded-full bg-gradient-to-r from-fuchsia-900/10 to-pink-900/10 blur-[80px] animate-pulse" style={{ animationDelay: "2s" }} />
            </div>

            {/* Header */}
            <header className="relative z-10 border-b border-white/5 backdrop-blur-2xl bg-white/[0.02]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="relative">
                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-violet-500/25">
                                    <Satellite className="w-6 h-6 text-white" />
                                </div>
                                <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-[#0a0a1a] animate-pulse" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold bg-gradient-to-r from-white via-violet-200 to-cyan-200 bg-clip-text text-transparent">
                                    IPTV Stream Hub
                                </h1>
                                <p className="text-sm text-white/40 mt-0.5">
                                    {loading ? "Loading channels..." : `${channelCount.toLocaleString()} live channels available`}
                                </p>
                            </div>
                        </div>
                        <div className="hidden sm:flex items-center gap-3">
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                                <Signal className="w-3.5 h-3.5 text-emerald-400" />
                                <span className="text-xs font-medium text-emerald-400">Connected</span>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Search Section */}
            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-4">
                <div className="flex flex-col sm:flex-row gap-3">
                    {/* Search Input */}
                    <div className="flex-1 relative group">
                        <div className="absolute inset-0 bg-gradient-to-r from-violet-500/20 to-cyan-500/20 rounded-2xl blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />
                        <div className="relative flex items-center bg-white/[0.06] border border-white/10 rounded-2xl overflow-hidden backdrop-blur-xl transition-all duration-300 group-focus-within:border-violet-500/40 group-focus-within:bg-white/[0.08]">
                            <Search className="w-5 h-5 text-white/30 ml-5 shrink-0" />
                            <input
                                ref={searchInputRef}
                                type="text"
                                placeholder="Search channels... (press / to focus)"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-transparent px-4 py-4 text-white placeholder:text-white/30 focus:outline-none text-base"
                            />
                            {searchTerm && (
                                <button
                                    onClick={() => setSearchTerm("")}
                                    className="mr-4 p-1 rounded-full hover:bg-white/10 transition-colors"
                                >
                                    <X className="w-4 h-4 text-white/40" />
                                </button>
                            )}
                            <div className="hidden sm:flex mr-4 px-2 py-1 rounded-md bg-white/5 border border-white/10">
                                <span className="text-[11px] text-white/30 font-mono">/</span>
                            </div>
                        </div>
                    </div>

                    {/* Category Filter */}
                    <div className="relative" ref={dropdownRef}>
                        <button
                            onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                            className="flex items-center gap-2 px-5 py-4 bg-white/[0.06] border border-white/10 rounded-2xl backdrop-blur-xl hover:bg-white/[0.08] transition-all duration-300 text-sm min-w-[180px] justify-between"
                        >
                            <span className="text-white/70">
                                {selectedCategory === "all" ? "All Categories" : `Category ${selectedCategory}`}
                            </span>
                            <ChevronDown className={`w-4 h-4 text-white/30 transition-transform duration-200 ${showCategoryDropdown ? "rotate-180" : ""}`} />
                        </button>
                        {showCategoryDropdown && (
                            <div className="absolute top-full mt-2 left-0 right-0 sm:w-64 bg-[#1a1a2e]/95 border border-white/10 rounded-2xl backdrop-blur-2xl shadow-2xl shadow-black/50 max-h-80 overflow-y-auto z-50">
                                <div className="p-2">
                                    <button
                                        onClick={() => { setSelectedCategory("all"); setShowCategoryDropdown(false) }}
                                        className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm transition-colors ${selectedCategory === "all" ? "bg-violet-500/20 text-violet-300" : "text-white/60 hover:bg-white/5 hover:text-white/80"}`}
                                    >
                                        <span>All Categories</span>
                                        <span className="text-xs text-white/30">{channelCount}</span>
                                    </button>
                                    {categories.map(cat => (
                                        <button
                                            key={cat.id}
                                            onClick={() => { setSelectedCategory(cat.id); setShowCategoryDropdown(false) }}
                                            className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm transition-colors ${selectedCategory === cat.id ? "bg-violet-500/20 text-violet-300" : "text-white/60 hover:bg-white/5 hover:text-white/80"}`}
                                        >
                                            <span>Category {cat.id}</span>
                                            <span className="text-xs text-white/30">{cat.count}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Results count */}
                {!loading && (
                    <div className="mt-4 flex items-center gap-2">
                        <div className="h-px flex-1 bg-gradient-to-r from-white/5 via-white/10 to-white/5" />
                        <span className="text-xs text-white/30 px-3">
                            {filteredChannels.length === channels.length
                                ? `Showing all ${filteredChannels.length.toLocaleString()} channels`
                                : `${filteredChannels.length.toLocaleString()} of ${channels.length.toLocaleString()} channels`}
                        </span>
                        <div className="h-px flex-1 bg-gradient-to-r from-white/5 via-white/10 to-white/5" />
                    </div>
                )}
            </div>

            {/* Content */}
            <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-32">
                        <div className="relative">
                            <div className="w-16 h-16 rounded-full border-2 border-violet-500/20 border-t-violet-500 animate-spin" />
                            <Tv className="w-6 h-6 text-violet-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                        </div>
                        <p className="mt-6 text-white/40 text-sm">Loading live channels...</p>
                    </div>
                ) : error ? (
                    <div className="flex flex-col items-center justify-center py-32">
                        <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-4">
                            <X className="w-8 h-8 text-red-400" />
                        </div>
                        <p className="text-red-300 font-medium">Connection Error</p>
                        <p className="mt-2 text-white/40 text-sm">{error}</p>
                    </div>
                ) : filteredChannels.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-32">
                        <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4">
                            <Search className="w-8 h-8 text-white/20" />
                        </div>
                        <p className="text-white/50 font-medium">No channels found</p>
                        <p className="mt-2 text-white/30 text-sm">Try adjusting your search or filters</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                        {filteredChannels.slice(0, 150).map((ch, i) => (
                            <div
                                key={ch.stream_id}
                                className="group relative bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] hover:border-violet-500/20 rounded-2xl p-4 backdrop-blur-xl transition-all duration-300 hover:shadow-lg hover:shadow-violet-500/5"
                                style={{ animationDelay: `${Math.min(i * 20, 500)}ms` }}
                            >
                                <div className="flex items-start gap-3">
                                    {/* Channel Icon */}
                                    <div className="shrink-0 w-12 h-12 rounded-xl overflow-hidden bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 flex items-center justify-center">
                                        {ch.stream_icon ? (
                                            <img
                                                src={ch.stream_icon}
                                                alt=""
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).style.display = "none";
                                                    (e.target as HTMLImageElement).parentElement!.innerHTML = '<svg class="w-5 h-5 text-white/20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="15" rx="2" ry="2"/><polyline points="17 2 12 7 7 2"/></svg>'
                                                }}
                                            />
                                        ) : (
                                            <Tv className="w-5 h-5 text-white/20" />
                                        )}
                                    </div>

                                    {/* Channel Info */}
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-semibold text-sm text-white/90 truncate group-hover:text-white transition-colors">
                                            {ch.name}
                                        </h3>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-[11px] text-white/30 font-mono">ID: {ch.stream_id}</span>
                                            {ch.tv_archive === 1 && (
                                                <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                                    DVR
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Live indicator */}
                                    <div className="shrink-0 flex items-center gap-1.5 px-2 py-1 rounded-lg bg-red-500/10 border border-red-500/15">
                                        <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                                        <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider">Live</span>
                                    </div>
                                </div>

                                {/* Stream URL */}
                                <div className="mt-3 flex items-center gap-1 px-3 py-2 rounded-xl bg-black/30 border border-white/5">
                                    <code className="text-[11px] text-white/25 truncate flex-1 font-mono">
                                        {getStreamUrl(ch)}
                                    </code>
                                </div>

                                {/* Actions */}
                                <div className="mt-3 flex gap-2">
                                    <button
                                        onClick={() => handlePlay(ch)}
                                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white text-xs font-semibold transition-all duration-300 shadow-lg shadow-violet-500/20 hover:shadow-violet-500/30 active:scale-[0.98]"
                                    >
                                        <Play className="w-3.5 h-3.5" />
                                        Play
                                    </button>
                                    <button
                                        onClick={() => copyToClipboard(getStreamUrl(ch), ch.stream_id)}
                                        className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/10 text-white/60 hover:text-white text-xs font-medium transition-all duration-300 active:scale-[0.98]"
                                    >
                                        {copiedId === ch.stream_id ? (
                                            <>
                                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                                                <span className="text-emerald-400">Copied!</span>
                                            </>
                                        ) : (
                                            <>
                                                <Copy className="w-3.5 h-3.5" />
                                                Copy URL
                                            </>
                                        )}
                                    </button>
                                    <button
                                        onClick={() => copyToClipboard(getM3U8Url(ch), ch.stream_id + 100000)}
                                        className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/10 text-white/60 hover:text-white text-xs font-medium transition-all duration-300 active:scale-[0.98]"
                                        title="Copy M3U8 URL"
                                    >
                                        {copiedId === ch.stream_id + 100000 ? (
                                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                                        ) : (
                                            <span className="text-[10px] font-bold">M3U8</span>
                                        )}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Show more notice */}
                {!loading && filteredChannels.length > 150 && (
                    <div className="mt-6 text-center">
                        <p className="text-sm text-white/30">
                            Showing first 150 of {filteredChannels.length.toLocaleString()} channels. Use search to narrow results.
                        </p>
                    </div>
                )}
            </main>

            {/* Video Player Modal */}
            {playingChannel && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xl p-4">
                    <div className="relative w-full max-w-4xl bg-[#0f0f1f] rounded-3xl border border-white/10 shadow-2xl overflow-hidden">
                        {/* Player Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                                <h3 className="font-semibold text-white/90 truncate">{playingChannel.name}</h3>
                                <span className="text-xs text-white/30 font-mono">ID: {playingChannel.stream_id}</span>
                            </div>
                            <button
                                onClick={handleClosePlayer}
                                className="p-2 rounded-xl hover:bg-white/10 transition-colors"
                            >
                                <X className="w-5 h-5 text-white/50" />
                            </button>
                        </div>

                        {/* Video Area */}
                        <div className="relative aspect-video bg-black flex items-center justify-center">
                            <video
                                ref={videoRef}
                                src={getM3U8Url(playingChannel)}
                                controls
                                autoPlay
                                className="w-full h-full"
                                onError={() => {
                                    // Try TS format if M3U8 fails
                                    if (videoRef.current) {
                                        videoRef.current.src = getStreamUrl(playingChannel)
                                    }
                                }}
                            />
                        </div>

                        {/* Player Footer */}
                        <div className="px-6 py-4 border-t border-white/5">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                                <code className="text-xs text-white/20 font-mono truncate flex-1">{getStreamUrl(playingChannel)}</code>
                                <div className="flex gap-2 shrink-0">
                                    <button
                                        onClick={() => copyToClipboard(getStreamUrl(playingChannel), playingChannel.stream_id)}
                                        className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-white/50 hover:text-white transition-colors"
                                    >
                                        Copy .TS
                                    </button>
                                    <button
                                        onClick={() => copyToClipboard(getM3U8Url(playingChannel), playingChannel.stream_id + 100000)}
                                        className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-white/50 hover:text-white transition-colors"
                                    >
                                        Copy .M3U8
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Footer */}
            <footer className="relative z-10 border-t border-white/5 py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-white/20">
                        <Satellite className="w-3.5 h-3.5" />
                        <span>IPTV Stream Hub</span>
                    </div>
                    <span className="text-xs text-white/15">Powered by PrimaProTV</span>
                </div>
            </footer>
        </div>
    )
}
