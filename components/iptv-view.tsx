"use client"

import { useState, useEffect, useRef } from "react"
import { Search, Tv, Play, Copy, Check, X, Signal, ChevronDown, Satellite } from "lucide-react"

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

export function IPTVView() {
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

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setShowCategoryDropdown(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

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

    const filteredChannels = channels.filter(ch => {
        const matchesSearch = searchTerm === "" || ch.name.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesCategory = selectedCategory === "all" || ch.category_id === selectedCategory
        return matchesSearch && matchesCategory
    })

    const getStreamUrl = (ch: Channel) =>
        `${DOMAIN}/live/${USERNAME}/${PASSWORD}/${ch.stream_id}.ts`

    const getM3U8Url = (ch: Channel) =>
        `${DOMAIN}/live/${USERNAME}/${PASSWORD}/${ch.stream_id}.m3u8`

    // Proxy URLs for playback (avoids 403 from direct browser requests)
    const getProxyM3U8 = (ch: Channel) =>
        `/api/iptv-proxy?id=${ch.stream_id}&format=m3u8`

    const getProxyTS = (ch: Channel) =>
        `/api/iptv-proxy?id=${ch.stream_id}&format=ts`

    const copyToClipboard = async (text: string, id: number) => {
        try {
            await navigator.clipboard.writeText(text)
            setCopiedId(id)
            setTimeout(() => setCopiedId(null), 2000)
        } catch {
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

    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === "Escape") setPlayingChannel(null)
        }
        window.addEventListener("keydown", handler)
        return () => window.removeEventListener("keydown", handler)
    }, [])

    return (
        <div className="space-y-6">
            {/* Stats Header */}
            <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-violet-500/10 to-cyan-500/10 border border-violet-500/20">
                    <Satellite className="w-5 h-5 text-violet-500" />
                    <div>
                        <p className="text-xs text-gray-500 font-medium">Total Channels</p>
                        <p className="text-lg font-black text-gray-900">{loading ? "..." : channelCount.toLocaleString()}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200">
                    <Signal className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="text-xs font-bold text-emerald-600">Connected</span>
                </div>
                {!loading && (
                    <span className="text-xs text-gray-400 font-medium ml-auto">
                        {filteredChannels.length === channels.length
                            ? `Showing all ${filteredChannels.length.toLocaleString()}`
                            : `${filteredChannels.length.toLocaleString()} of ${channels.length.toLocaleString()}`}
                    </span>
                )}
            </div>

            {/* Search & Filter Bar */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative group">
                    <div className="relative flex items-center bg-white border border-gray-200 rounded-2xl overflow-hidden transition-all duration-300 group-focus-within:border-orange-400 group-focus-within:shadow-lg group-focus-within:shadow-orange-500/10">
                        <Search className="w-5 h-5 text-gray-400 ml-4 shrink-0" />
                        <input
                            ref={searchInputRef}
                            type="text"
                            placeholder="Search channels by name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-transparent px-4 py-3.5 text-gray-900 placeholder:text-gray-400 focus:outline-none text-sm font-medium"
                        />
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm("")}
                                className="mr-3 p-1 rounded-full hover:bg-gray-100 transition-colors"
                            >
                                <X className="w-4 h-4 text-gray-400" />
                            </button>
                        )}
                    </div>
                </div>

                <div className="relative" ref={dropdownRef}>
                    <button
                        onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                        className="flex items-center gap-2 px-5 py-3.5 bg-white border border-gray-200 rounded-2xl hover:border-orange-300 transition-all duration-300 text-sm min-w-[180px] justify-between font-medium"
                    >
                        <span className="text-gray-600">
                            {selectedCategory === "all" ? "All Categories" : `Category ${selectedCategory}`}
                        </span>
                        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${showCategoryDropdown ? "rotate-180" : ""}`} />
                    </button>
                    {showCategoryDropdown && (
                        <div className="absolute top-full mt-2 left-0 right-0 sm:w-64 bg-white border border-gray-200 rounded-2xl shadow-2xl max-h-80 overflow-y-auto z-50">
                            <div className="p-2">
                                <button
                                    onClick={() => { setSelectedCategory("all"); setShowCategoryDropdown(false) }}
                                    className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm transition-colors ${selectedCategory === "all" ? "bg-orange-50 text-orange-600 font-bold" : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"}`}
                                >
                                    <span>All Categories</span>
                                    <span className="text-xs text-gray-400">{channelCount}</span>
                                </button>
                                {categories.map(cat => (
                                    <button
                                        key={cat.id}
                                        onClick={() => { setSelectedCategory(cat.id); setShowCategoryDropdown(false) }}
                                        className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm transition-colors ${selectedCategory === cat.id ? "bg-orange-50 text-orange-600 font-bold" : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"}`}
                                    >
                                        <span>Category {cat.id}</span>
                                        <span className="text-xs text-gray-400">{cat.count}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Content */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-24">
                    <div className="relative">
                        <div className="w-14 h-14 rounded-full border-[3px] border-orange-200 border-t-orange-600 animate-spin" />
                        <Tv className="w-5 h-5 text-orange-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                    </div>
                    <p className="mt-5 text-gray-400 text-sm font-medium">Loading live channels...</p>
                </div>
            ) : error ? (
                <div className="flex flex-col items-center justify-center py-24">
                    <div className="w-14 h-14 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center mb-4">
                        <X className="w-7 h-7 text-red-400" />
                    </div>
                    <p className="text-red-500 font-bold">Connection Error</p>
                    <p className="mt-1 text-gray-400 text-sm">{error}</p>
                </div>
            ) : filteredChannels.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24">
                    <div className="w-14 h-14 rounded-2xl bg-gray-50 border border-gray-200 flex items-center justify-center mb-4">
                        <Search className="w-7 h-7 text-gray-300" />
                    </div>
                    <p className="text-gray-500 font-bold">No channels found</p>
                    <p className="mt-1 text-gray-400 text-sm">Try adjusting your search or filters</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {filteredChannels.slice(0, 150).map((ch) => (
                        <div
                            key={ch.stream_id}
                            className="group bg-white hover:bg-orange-50/30 border border-gray-200 hover:border-orange-300 rounded-2xl p-4 transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/5"
                        >
                            <div className="flex items-start gap-3">
                                {/* Channel Icon */}
                                <div className="shrink-0 w-11 h-11 rounded-xl overflow-hidden bg-gray-100 border border-gray-200 flex items-center justify-center">
                                    {ch.stream_icon ? (
                                        <img
                                            src={ch.stream_icon}
                                            alt=""
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).style.display = "none";
                                                const parent = (e.target as HTMLImageElement).parentElement;
                                                if (parent) {
                                                    const el = document.createElement("div");
                                                    el.className = "w-5 h-5 flex items-center justify-center text-gray-300";
                                                    el.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-5 h-5"><rect x="2" y="7" width="20" height="15" rx="2" ry="2"/><polyline points="17 2 12 7 7 2"/></svg>';
                                                    parent.appendChild(el);
                                                }
                                            }}
                                        />
                                    ) : (
                                        <Tv className="w-5 h-5 text-gray-300" />
                                    )}
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-bold text-sm text-gray-900 truncate group-hover:text-orange-700 transition-colors">
                                        {ch.name}
                                    </h3>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <span className="text-[11px] text-gray-400 font-mono">ID: {ch.stream_id}</span>
                                        {ch.tv_archive === 1 && (
                                            <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-amber-50 text-amber-600 border border-amber-200 font-bold">
                                                DVR
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Live badge */}
                                <div className="shrink-0 flex items-center gap-1.5 px-2 py-1 rounded-lg bg-red-50 border border-red-200">
                                    <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                                    <span className="text-[10px] font-black text-red-500 uppercase tracking-wider">Live</span>
                                </div>
                            </div>

                            {/* Stream URL */}
                            <div className="mt-3 flex items-center gap-1 px-3 py-2 rounded-xl bg-gray-50 border border-gray-200">
                                <code className="text-[10px] text-gray-400 truncate flex-1 font-mono">
                                    {getStreamUrl(ch)}
                                </code>
                            </div>

                            {/* Actions */}
                            <div className="mt-3 flex gap-2">
                                <button
                                    onClick={() => setPlayingChannel(ch)}
                                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold transition-all duration-300 shadow-md shadow-orange-600/20 hover:shadow-orange-600/30 active:scale-[0.98]"
                                >
                                    <Play className="w-3.5 h-3.5" />
                                    Play
                                </button>
                                <button
                                    onClick={() => copyToClipboard(getStreamUrl(ch), ch.stream_id)}
                                    className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 border border-gray-200 text-gray-600 hover:text-gray-800 text-xs font-bold transition-all duration-300 active:scale-[0.98]"
                                >
                                    {copiedId === ch.stream_id ? (
                                        <>
                                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                                            <span className="text-emerald-600">Copied!</span>
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
                                    className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 border border-gray-200 text-gray-600 text-xs font-bold transition-all duration-300 active:scale-[0.98]"
                                    title="Copy M3U8 URL"
                                >
                                    {copiedId === ch.stream_id + 100000 ? (
                                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                                    ) : (
                                        <span className="text-[10px] font-black">M3U8</span>
                                    )}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {!loading && filteredChannels.length > 150 && (
                <div className="text-center py-4">
                    <p className="text-sm text-gray-400 font-medium">
                        Showing first 150 of {filteredChannels.length.toLocaleString()} channels. Use search to narrow results.
                    </p>
                </div>
            )}

            {/* Video Player Modal */}
            {playingChannel && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-xl p-4">
                    <div className="relative w-full max-w-4xl bg-white rounded-3xl border border-gray-200 shadow-2xl overflow-hidden">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                                <h3 className="font-bold text-gray-900 truncate">{playingChannel.name}</h3>
                                <span className="text-xs text-gray-400 font-mono">ID: {playingChannel.stream_id}</span>
                            </div>
                            <button
                                onClick={() => setPlayingChannel(null)}
                                className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
                            >
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>

                        <div className="relative aspect-video bg-black flex items-center justify-center">
                            <video
                                ref={videoRef}
                                controls
                                autoPlay
                                className="w-full h-full"
                            />
                            <PlayerInit channel={playingChannel} videoRef={videoRef} />
                        </div>

                        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                                <code className="text-xs text-gray-400 font-mono truncate flex-1">{getStreamUrl(playingChannel)}</code>
                                <div className="flex gap-2 shrink-0">
                                    <button
                                        onClick={() => copyToClipboard(getStreamUrl(playingChannel), playingChannel.stream_id)}
                                        className="px-3 py-1.5 rounded-lg bg-white hover:bg-gray-100 border border-gray-200 text-xs text-gray-500 hover:text-gray-700 font-bold transition-colors"
                                    >
                                        Copy .TS
                                    </button>
                                    <button
                                        onClick={() => copyToClipboard(getM3U8Url(playingChannel), playingChannel.stream_id + 100000)}
                                        className="px-3 py-1.5 rounded-lg bg-white hover:bg-gray-100 border border-gray-200 text-xs text-gray-500 hover:text-gray-700 font-bold transition-colors"
                                    >
                                        Copy .M3U8
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
