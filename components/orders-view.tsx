"use client"

import { useState, useEffect, useCallback } from "react"
import {
    Search,
    Loader2,
    Package,
    CheckCircle2,
    Phone,
    Calendar,
    RefreshCcw,
    MapPin,
    AlertCircle,
    Hash,
    Activity,
    History,
    X,
    Zap,
    Globe,
    ArrowUpRight,
    User,
    ExternalLink
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { cn } from "@/lib/utils"
import { fetchOrdersAction } from "@/app/actions/order-actions"

interface Order {
    id: string | number
    user_phone: string
    transaction_phone: string
    status: string
    account_status: string
    created_at: string
    updated_at: string
}

export function OrdersView() {
    const [orders, setOrders] = useState<Order[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [searchQuery, setSearchQuery] = useState("")
    const [isSearching, setIsSearching] = useState(false)

    const normalizeStatus = (status: string) => (status || "").toLowerCase().trim()

    const isEthiopian = (phone: string) => {
        const clean = (phone || "").replace(/\D/g, "")
        return clean.startsWith("251")
    }

    const formatSomaliaTime = (timeString: string) => {
        if (!timeString) return "-"
        try {
            return new Intl.DateTimeFormat("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
                timeZone: "Africa/Mogadishu",
            }).format(new Date(timeString))
        } catch (e) {
            return timeString
        }
    }

    const fetchOrders = useCallback(async (search?: string) => {
        setLoading(true)
        setError(null)
        try {
            const data = await fetchOrdersAction(search)
            setOrders(data.orders || [])
        } catch (err) {
            setError(err instanceof Error ? err.message : "An unexpected error occurred")
        } finally {
            setLoading(false)
            setIsSearching(false)
        }
    }, [])

    useEffect(() => {
        fetchOrders()
    }, [fetchOrders])

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        setIsSearching(true)
        fetchOrders(searchQuery)
    }

    const handleReset = () => {
        setSearchQuery("")
        setIsSearching(true)
        fetchOrders()
    }

    const somaliaCompleted = orders.filter(
        (o) => ["complete", "completed"].includes(normalizeStatus(o.status)) && !isEthiopian(o.user_phone)
    ).length

    const ethiopiaCompleted = orders.filter(
        (o) => ["complete", "completed"].includes(normalizeStatus(o.status)) && isEthiopian(o.user_phone)
    ).length

    const getStatusStyle = (status: string) => {
        const s = normalizeStatus(status)
        if (["complete", "completed"].includes(s)) return "bg-green-500 text-white shadow-lg shadow-green-500/20"
        if (["waiting", "pending"].includes(s)) return "bg-orange-600 text-white shadow-lg shadow-orange-600/20"
        if (["failed", "canceled", "cancelled"].includes(s)) return "bg-gray-900 text-white shadow-lg shadow-gray-900/20"
        return "bg-slate-400 text-white"
    }

    return (
        <div className="flex flex-col gap-10 animate-in fade-in slide-in-from-bottom-10 duration-1000 ease-out">
            {/* Premium Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="space-y-2">
                    <div className="flex items-center gap-2 px-3 py-1 bg-orange-600 text-white rounded-full w-fit shadow-lg shadow-orange-600/20">
                        <Package className="h-3 w-3 fill-current" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Order Management</span>
                    </div>
                    <h2 className="text-5xl font-black text-gray-900 tracking-tighter leading-none italic uppercase">
                        System <span className="text-orange-600 underline underline-offset-8 decoration-orange-100">Orders</span>
                    </h2>
                    <p className="text-gray-400 font-bold tracking-tight">Real-time order synchronization from SomApi Gateway.</p>
                </div>

                <div className="flex items-center gap-4 bg-white/50 backdrop-blur-md p-3 rounded-[2.5rem] border border-orange-50 shadow-xl">
                    <form onSubmit={handleSearch} className="flex items-center gap-3">
                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-hover:text-orange-600 transition-colors" />
                            <input
                                type="text"
                                placeholder="Search phone number..."
                                className="pl-11 pr-4 py-3 bg-white border border-orange-50 rounded-2xl w-64 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-orange-600/20 shadow-sm"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-3 bg-gray-900 text-white rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-orange-600 transition-all duration-300 shadow-xl shadow-gray-900/10 active:scale-95 flex items-center gap-2"
                        >
                            {loading && isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                            Search
                        </button>
                        {searchQuery && (
                            <button
                                type="button"
                                onClick={handleReset}
                                className="h-12 w-12 bg-white border border-gray-100 rounded-2xl flex items-center justify-center text-gray-400 hover:text-red-500 transition-all"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        )}
                    </form>
                </div>
            </div>

            {/* Extreme Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="group relative bg-white p-10 rounded-[3.5rem] border border-orange-50 shadow-2xl shadow-orange-500/5 hover:scale-[1.03] transition-all duration-500 overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-150 transition-transform duration-700"><CheckCircle2 className="h-20 w-20" /></div>
                    <div className="h-16 w-16 bg-green-500 rounded-3xl flex items-center justify-center text-white mb-8 shadow-2xl shadow-green-500/20">
                        <CheckCircle2 className="h-8 w-8" />
                    </div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Somalia Completed</p>
                    <p className="text-4xl font-black text-gray-900 mt-2 tracking-tight">
                        {loading ? "..." : somaliaCompleted}
                    </p>
                    <p className="mt-4 text-xs font-bold text-gray-400 flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-ping" />
                        Verified Successful
                    </p>
                </div>

                <div className="group relative bg-white p-10 rounded-[3.5rem] border border-orange-50 shadow-2xl shadow-orange-500/5 hover:scale-[1.03] transition-all duration-500 overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-150 transition-transform duration-700"><Globe className="h-20 w-20" /></div>
                    <div className="h-16 w-16 bg-gray-900 rounded-3xl flex items-center justify-center text-white mb-8 shadow-2xl shadow-gray-900/20">
                        <MapPin className="h-8 w-8" />
                    </div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Ethiopia Completed</p>
                    <p className="text-4xl font-black text-gray-900 mt-2 tracking-tight">
                        {loading ? "..." : ethiopiaCompleted}
                    </p>
                    <p className="mt-4 text-xs font-bold text-gray-400 flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-ping" />
                        Cross-Border Verified
                    </p>
                </div>
            </div>

            {/* Main Analysis Area */}
            <div className="bg-white p-10 rounded-[4rem] border border-orange-50 shadow-2xl shadow-orange-500/5">
                <div className="flex items-center justify-between mb-12">
                    <div>
                        <h3 className="text-2xl font-black text-gray-900 tracking-tighter uppercase italic">Deployment <span className="text-orange-600 underline decoration-orange-100">Ledger</span></h3>
                        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mt-1">Immutable Order Processing History</p>
                    </div>
                    <div className="h-12 w-12 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-600 border border-orange-100">
                        <Hash className="h-6 w-6" />
                    </div>
                </div>

                {error && (
                    <div className="mb-8 p-6 bg-red-50 border border-red-100 rounded-3xl flex items-center gap-4">
                        <AlertCircle className="h-8 w-8 text-red-500" />
                        <div>
                            <p className="text-sm font-black text-red-900 uppercase">Synchronization Error</p>
                            <p className="text-xs font-bold text-red-500 mt-0.5">{error}</p>
                        </div>
                    </div>
                )}

                <div className="space-y-6">
                    {loading && !isSearching ? (
                        Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="h-32 bg-gray-50/50 rounded-[2.5rem] animate-pulse border border-gray-100" />
                        ))
                    ) : orders.length === 0 ? (
                        <div className="py-20 text-center flex flex-col items-center">
                            <div className="h-24 w-24 bg-orange-50 rounded-[2rem] flex items-center justify-center text-orange-200 mb-6 border border-dashed border-orange-200">
                                <Package className="h-12 w-12" />
                            </div>
                            <h4 className="text-xl font-black text-gray-900 tracking-tight">Zero Protocols Found</h4>
                            <p className="text-gray-400 font-bold max-w-xs mx-auto mt-2">The ledger currently contains no records matching your query criteria.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-6">
                            {orders.map((order) => (
                                <div key={order.id} className="group relative bg-white border border-orange-50 rounded-[2.5rem] p-8 hover:shadow-2xl hover:shadow-orange-500/10 transition-all duration-500 hover:-translate-y-1">
                                    <div className="flex flex-col xl:flex-row gap-8 items-start xl:items-center">

                                        {/* Status Section */}
                                        <div className="flex-shrink-0">
                                            <div className={cn(
                                                "h-20 w-20 rounded-3xl flex flex-col items-center justify-center text-center p-2",
                                                getStatusStyle(order.status)
                                            )}>
                                                <p className="text-[10px] font-black uppercase leading-tight opacity-80">Status</p>
                                                <p className="text-xs font-black uppercase tracking-tighter mt-1">{normalizeStatus(order.status)}</p>
                                            </div>
                                        </div>

                                        {/* Metadata Section */}
                                        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-8">
                                            <div className="space-y-1">
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                                    <User className="h-3 w-3" /> Origin User
                                                </p>
                                                <p className="text-lg font-black text-gray-900 tracking-tight flex items-center gap-2">
                                                    {order.user_phone}
                                                    {isEthiopian(order.user_phone) && (
                                                        <span className="px-2 py-0.5 bg-blue-600 text-white text-[8px] font-black rounded-md flex items-center gap-1 shadow-lg shadow-blue-500/20">
                                                            <Globe className="h-2 w-2" /> ETH
                                                        </span>
                                                    )}
                                                </p>
                                                <p className="text-[10px] font-bold text-gray-400 uppercase">Protocol Identifier: <span className="text-orange-600">#{order.id}</span></p>
                                            </div>

                                            <div className="space-y-1">
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                                    <Activity className="h-3 w-3" /> Transaction Node
                                                </p>
                                                <p className="text-lg font-black text-gray-900 tracking-tight italic text-orange-600">
                                                    {order.transaction_phone}
                                                </p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <div className={cn(
                                                        "h-2 w-2 rounded-full",
                                                        order.account_status?.toLowerCase().includes("active") ? "bg-green-500 animate-pulse" : "bg-gray-300"
                                                    )} />
                                                    <p className="text-[10px] font-bold text-gray-400 uppercase">Account: <span className="text-gray-900">{order.account_status}</span></p>
                                                </div>
                                            </div>

                                            <div className="space-y-1">
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                                    <History className="h-3 w-3" /> Temporal Data
                                                </p>
                                                <div className="flex flex-col gap-1">
                                                    <p className="text-[11px] font-bold text-gray-900 bg-orange-50 px-3 py-1 rounded-full w-fit">
                                                        Created: {formatSomaliaTime(order.created_at)}
                                                    </p>
                                                    <p className="text-[11px] font-bold text-gray-400 px-3 py-1 bg-gray-50 rounded-full w-fit">
                                                        Updated: {formatSomaliaTime(order.updated_at)}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="xl:pl-8 xl:border-l border-orange-50 self-stretch flex items-center">
                                            <button className="h-12 w-12 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-600 hover:bg-orange-600 hover:text-white transition-all duration-300 group">
                                                <ArrowUpRight className="h-6 w-6 group-hover:scale-125 transition-transform" />
                                            </button>
                                        </div>

                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
