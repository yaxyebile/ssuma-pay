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
    X
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { cn } from "@/lib/utils"

interface Order {
    id: string | number
    user_phone: string
    transaction_phone: string
    status: string
    account_status: string
    created_at: string
    updated_at: string
}

export default function OrdersPage() {
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
            const baseUrl = "https://www.somapi.store/orders"
            const url = search ? `${baseUrl}/phone/${encodeURIComponent(search)}` : baseUrl

            const response = await fetch(url)
            if (!response.ok) throw new Error("Failed to fetch orders")

            const data = await response.json()
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

    const getStatusColor = (status: string) => {
        const s = normalizeStatus(status)
        if (["complete", "completed"].includes(s)) return "bg-green-500/10 text-green-600 border-green-200"
        if (["waiting", "pending"].includes(s)) return "bg-yellow-500/10 text-yellow-600 border-yellow-200"
        if (["failed", "canceled", "cancelled"].includes(s)) return "bg-red-500/10 text-red-600 border-red-200"
        return "bg-slate-500/10 text-slate-600 border-slate-200"
    }

    return (
        <div className="min-h-screen bg-slate-50/50 dark:bg-zinc-950/50 pb-12">
            {/* Sticky Header */}
            <header className="sticky top-0 z-30 w-full border-b bg-background/80 backdrop-blur-md">
                <div className="container max-w-5xl mx-auto px-4 py-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/10 rounded-xl">
                                <Package className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold tracking-tight">Latest Orders</h1>
                                <p className="text-xs text-muted-foreground flex items-center gap-1">
                                    <Activity className="w-3 h-3 text-green-500" /> Live from Somalia (Mogadishu Time)
                                </p>
                            </div>
                        </div>

                        <form onSubmit={handleSearch} className="flex gap-2 w-full md:w-auto">
                            <div className="relative flex-1 md:w-64">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    type="text"
                                    placeholder="Search by Phone Number..."
                                    className="pl-9 bg-background"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                                {searchQuery && (
                                    <button
                                        type="button"
                                        onClick={() => setSearchQuery("")}
                                        className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                )}
                            </div>
                            <Button type="submit" disabled={loading}>
                                {loading && isSearching ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : "Search"}
                            </Button>
                            {searchQuery && (
                                <Button type="button" variant="outline" onClick={handleReset}>
                                    Reset
                                </Button>
                            )}
                        </form>
                    </div>
                </div>
            </header>

            <main className="container max-w-5xl mx-auto px-4 py-6 space-y-6">
                {/* Stats Summary */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="overflow-hidden border-none shadow-sm bg-gradient-to-br from-green-500/5 to-emerald-500/10 border-l-4 border-l-green-500">
                        <CardHeader className="p-4 pb-2">
                            <CardTitle className="text-sm font-medium text-green-700 flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4" /> Somalia Completed
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                            <div className="text-2xl font-bold text-green-900 dark:text-green-100">
                                {loading ? <Skeleton className="h-8 w-16" /> : somaliaCompleted}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="overflow-hidden border-none shadow-sm bg-gradient-to-br from-blue-500/5 to-cyan-500/10 border-l-4 border-l-blue-500">
                        <CardHeader className="p-4 pb-2">
                            <CardTitle className="text-sm font-medium text-blue-700 flex items-center gap-2">
                                <MapPin className="w-4 h-4" /> Ethiopia Completed
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                            <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                                {loading ? <Skeleton className="h-8 w-16" /> : ethiopiaCompleted}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {error && (
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                {/* Orders List */}
                <div className="space-y-4">
                    {loading && !isSearching ? (
                        Array.from({ length: 3 }).map((_, i) => (
                            <Card key={i} className="animate-pulse">
                                <CardContent className="p-6">
                                    <div className="space-y-3">
                                        <Skeleton className="h-5 w-1/4" />
                                        <Skeleton className="h-4 w-1/2" />
                                        <Skeleton className="h-4 w-1/3" />
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    ) : orders.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="inline-flex p-4 rounded-full bg-slate-100 dark:bg-zinc-900 mb-4">
                                <Package className="w-8 h-8 text-muted-foreground" />
                            </div>
                            <h3 className="text-lg font-semibold">No orders found</h3>
                            <p className="text-muted-foreground">
                                {searchQuery ? `No records found for "${searchQuery}"` : "Try checking back later for updates."}
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-4">
                            {orders.map((order) => (
                                <Card key={order.id} className="group hover:shadow-md transition-shadow transition-all duration-300">
                                    <CardContent className="p-0">
                                        <div className="flex flex-col md:flex-row md:items-center">
                                            <div className="p-6 flex-1 space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                                                        <span className="p-1 bg-slate-100 dark:bg-zinc-800 rounded">
                                                            <Hash className="w-3 h-3" />
                                                        </span>
                                                        Order #{order.id}
                                                    </div>
                                                    <Badge
                                                        variant="outline"
                                                        className={cn("capitalize px-3 py-1", getStatusColor(order.status))}
                                                    >
                                                        {normalizeStatus(order.status)}
                                                    </Badge>
                                                </div>

                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8">
                                                    <div className="space-y-1.5">
                                                        <label className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground flex items-center gap-1.5">
                                                            <UserPhoneIcon className="w-3 h-3" /> User Phone
                                                        </label>
                                                        <p className="text-sm font-semibold flex items-center gap-2">
                                                            {order.user_phone}
                                                            {isEthiopian(order.user_phone) && (
                                                                <span className="text-[10px] px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded-full">ETH</span>
                                                            )}
                                                        </p>
                                                    </div>

                                                    <div className="space-y-1.5">
                                                        <label className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground flex items-center gap-1.5">
                                                            <RefreshCcw className="w-3 h-3" /> Transaction Phone
                                                        </label>
                                                        <p className="text-sm font-semibold">{order.transaction_phone}</p>
                                                    </div>

                                                    <div className="space-y-1.5">
                                                        <label className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">Account Status</label>
                                                        <div className="flex items-center gap-2">
                                                            <div className={cn(
                                                                "w-2 h-2 rounded-full",
                                                                order.account_status?.toLowerCase().includes("active") ? "bg-green-500" : "bg-slate-400"
                                                            )} />
                                                            <span className="text-sm capitalize">{order.account_status}</span>
                                                        </div>
                                                    </div>

                                                    <div className="space-y-1.5">
                                                        <label className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground flex items-center gap-1.5">
                                                            <History className="w-3 h-3" /> Timeline
                                                        </label>
                                                        <div className="flex flex-col text-[11px] text-muted-foreground space-y-0.5">
                                                            <span>Created: {formatSomaliaTime(order.created_at)}</span>
                                                            <span>Updated: {formatSomaliaTime(order.updated_at)}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}

function UserPhoneIcon({ className }: { className?: string }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <rect width="14" height="20" x="5" y="2" rx="2" ry="2" />
            <path d="M12 18h.01" />
        </svg>
    )
}
