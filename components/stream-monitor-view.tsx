"use client"

import { useState, useEffect, useCallback } from "react"
import {
    Radio,
    Activity,
    CheckCircle2,
    AlertTriangle,
    XCircle,
    Eye,
    RefreshCcw,
    Zap,
    Globe,
    ArrowUpRight,
    ShieldCheck,
    Search,
    X,
    Play,
    Terminal,
    Clock,
    Layers
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { checkStreamsAction, fetchStreamContentAction, type StreamStatus } from "@/app/actions/stream-actions"

export function StreamMonitorView() {
    const [streams, setStreams] = useState<StreamStatus[]>([])
    const [loading, setLoading] = useState(true)
    const [lastUpdated, setLastUpdated] = useState<Date>(new Date())
    const [selectedStream, setSelectedStream] = useState<string | null>(null)
    const [modalContent, setModalContent] = useState<string>("")
    const [modalLoading, setModalLoading] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")

    const refreshStreams = useCallback(async () => {
        try {
            const data = await checkStreamsAction()
            setStreams(data)
            setLastUpdated(new Date())
        } catch (error) {
            console.error("Stream update failed:", error)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        refreshStreams()
        const interval = setInterval(refreshStreams, 4000)
        return () => clearInterval(interval)
    }, [refreshStreams])

    const handleViewContent = async (url: string, name: string) => {
        setSelectedStream(name)
        setModalLoading(true)
        setModalContent("Initializing protocol intercept...")
        try {
            const content = await fetchStreamContentAction(url)
            setModalContent(content)
        } catch (error) {
            setModalContent("Protocol Error: Connection failed.")
        } finally {
            setModalLoading(false)
        }
    }

    const filteredStreams = streams.filter(s =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.url.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <div className="flex flex-col gap-10 animate-in fade-in slide-in-from-bottom-10 duration-1000 ease-out">
            {/* Premium Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="space-y-2">
                    <div className="flex items-center gap-2 px-3 py-1 bg-orange-600 text-white rounded-full w-fit shadow-lg shadow-orange-600/20">
                        <Activity className="h-3 w-3 animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-widest leading-none">Live Monitoring Active</span>
                    </div>
                    <h2 className="text-5xl font-black text-gray-900 tracking-tighter leading-none italic uppercase">
                        Stream <span className="text-orange-600 underline underline-offset-8 decoration-orange-100 font-black">Sentinel</span>
                    </h2>
                    <p className="text-gray-400 font-bold tracking-tight">Govix TV Real-time Playlist Flag Analysis.</p>
                </div>

                <div className="flex items-center gap-4 bg-white/50 backdrop-blur-md p-3 rounded-[2.5rem] border border-orange-50 shadow-xl">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-hover:text-orange-600 transition-colors" />
                        <input
                            type="text"
                            placeholder="Search streams..."
                            className="pl-11 pr-4 py-3 bg-white border border-orange-50 rounded-2xl w-64 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-orange-600/20 shadow-sm"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="h-12 px-4 bg-gray-900 text-white rounded-2xl flex items-center gap-3 border border-gray-800 shadow-xl">
                        <Clock className="h-4 w-4 text-orange-500" />
                        <div className="flex flex-col">
                            <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest leading-none">Last Sync</p>
                            <p className="text-[10px] font-black">{lastUpdated.toLocaleTimeString()}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Extreme Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                    { label: "Active Nodes", value: streams.filter(s => s.status === 'ok').length, icon: <ShieldCheck className="h-8 w-8" />, color: "bg-green-500", shadow: "shadow-green-500/20" },
                    { label: "Stability Warnings", value: streams.filter(s => s.status === 'warning').length, icon: <AlertTriangle className="h-8 w-8" />, color: "bg-orange-600", shadow: "shadow-orange-600/20" },
                    { label: "Offline Critical", value: streams.filter(s => s.status === 'error').length, icon: <XCircle className="h-8 w-8" />, color: "bg-gray-900", shadow: "shadow-gray-900/20" },
                ].map((stat, i) => (
                    <div key={i} className="group relative bg-white p-10 rounded-[3.5rem] border border-orange-50 shadow-2xl shadow-orange-500/5 hover:scale-[1.03] transition-all duration-500 overflow-hidden">
                        <div className={`h-16 w-16 ${stat.color} rounded-3xl flex items-center justify-center text-white mb-8 shadow-2xl ${stat.shadow}`}>{stat.icon}</div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{stat.label}</p>
                        <p className="text-4xl font-black text-gray-900 mt-2 tracking-tight">{stat.value}</p>
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-150 transition-transform duration-700">{stat.icon}</div>
                    </div>
                ))}
            </div>

            {/* Main Analysis Area */}
            <div className="bg-white p-10 rounded-[4rem] border border-orange-50 shadow-2xl shadow-orange-500/5">
                <div className="flex items-center justify-between mb-12">
                    <div>
                        <h3 className="text-2xl font-black text-gray-900 tracking-tighter uppercase italic">Grid <span className="text-orange-600 underline decoration-orange-100">Intelligence</span></h3>
                        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mt-1">Multi-Stream Protocol Monitoring</p>
                    </div>
                    <div className="h-12 w-12 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-600 border border-orange-100">
                        <Layers className="h-6 w-6" />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {loading ? (
                        Array.from({ length: 9 }).map((_, i) => (
                            <div key={i} className="h-48 bg-gray-50 rounded-[2.5rem] animate-pulse border border-gray-100" />
                        ))
                    ) : filteredStreams.length === 0 ? (
                        <div className="col-span-full py-20 text-center flex flex-col items-center">
                            <div className="h-24 w-24 bg-orange-50 rounded-[2rem] flex items-center justify-center text-orange-200 mb-6 border border-dashed border-orange-200">
                                <Radio className="h-12 w-12" />
                            </div>
                            <h4 className="text-xl font-black text-gray-900 tracking-tight">No Active Signals</h4>
                            <p className="text-gray-400 font-bold max-w-xs mx-auto mt-2">The monitoring grid is currently quiet. Try adjusting your signal filters.</p>
                        </div>
                    ) : (
                        filteredStreams.map((stream, idx) => (
                            <div key={idx} className={cn(
                                "group relative bg-white border rounded-[2.5rem] p-8 hover:shadow-2xl transition-all duration-500 hover:-translate-y-1",
                                stream.status === 'ok' ? "border-green-100 hover:shadow-green-500/10" :
                                    stream.status === 'warning' ? "border-orange-100 hover:shadow-orange-500/10" :
                                        "border-red-100 hover:shadow-red-500/10"
                            )}>
                                <div className="flex flex-col gap-6">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className={cn(
                                                "h-12 w-12 rounded-2xl flex items-center justify-center text-white shadow-lg",
                                                stream.status === 'ok' ? "bg-green-500 shadow-green-500/20" :
                                                    stream.status === 'warning' ? "bg-orange-600 shadow-orange-600/20" :
                                                        "bg-gray-900 shadow-gray-900/20"
                                            )}>
                                                {stream.status === 'ok' ? <CheckCircle2 className="h-6 w-6" /> :
                                                    stream.status === 'warning' ? <AlertTriangle className="h-6 w-6" /> :
                                                        <XCircle className="h-6 w-6" />}
                                            </div>
                                            <div>
                                                <p className="text-lg font-black text-gray-900 tracking-tight leading-none uppercase italic">{stream.name}</p>
                                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Mode: <span className="text-orange-600">HLS Transport</span></p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleViewContent(stream.url, stream.name)}
                                            className="h-10 w-10 bg-orange-50 rounded-xl flex items-center justify-center text-orange-600 hover:bg-orange-600 hover:text-white transition-all duration-300"
                                        >
                                            <Eye className="h-5 w-5" />
                                        </button>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="space-y-1">
                                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                                <Terminal className="h-3 w-3" /> Integrity Flags
                                            </p>
                                            <div className="flex flex-wrap gap-2 pt-1">
                                                {stream.status === 'error' ? (
                                                    <span className="text-[10px] font-black text-red-600 uppercase bg-red-50 px-3 py-1 rounded-full border border-red-100">
                                                        HTTP Link Broken ({stream.http})
                                                    </span>
                                                ) : stream.flags.length > 0 ? (
                                                    stream.flags.map((flag, fi) => (
                                                        <span key={fi} className="text-[10px] font-black text-orange-800 bg-orange-100 px-3 py-1 rounded-full border border-orange-200">
                                                            {flag}
                                                        </span>
                                                    ))
                                                ) : (
                                                    <span className="text-[10px] font-black text-green-700 bg-green-50 px-3 py-1 rounded-full border border-green-100 flex items-center gap-1.5">
                                                        <Zap className="h-2.5 w-2.5 fill-current" /> All Clear
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="pt-4 border-t border-gray-50">
                                            <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest truncate">
                                                {stream.url}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            <Dialog open={!!selectedStream} onOpenChange={(open) => !open && setSelectedStream(null)}>
                <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col p-0 border-none bg-gray-950 text-white rounded-[2.5rem]">
                    <DialogHeader className="p-8 pb-4 border-b border-white/5">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 bg-orange-600 rounded-2xl flex items-center justify-center text-white shadow-2xl shadow-orange-600/20 font-black">
                                <Play className="h-6 w-6 fill-current" />
                            </div>
                            <div>
                                <DialogTitle className="text-2xl font-black italic uppercase tracking-tight">Stream <span className="text-orange-600">Payload</span></DialogTitle>
                                <DialogDescription className="text-gray-400 font-bold uppercase text-[10px] tracking-[0.2em]">{selectedStream} Source Code</DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>
                    <div className="flex-1 overflow-y-auto p-8 font-mono text-xs text-orange-500/90 leading-relaxed bg-[#050505]">
                        {modalLoading ? (
                            <div className="flex flex-col items-center justify-center h-full gap-4 text-gray-500 uppercase font-black animate-pulse">
                                <RefreshCcw className="h-10 w-10 animate-spin" />
                                Intercepting Data Packets...
                            </div>
                        ) : (
                            <pre className="whitespace-pre-wrap">{modalContent}</pre>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
