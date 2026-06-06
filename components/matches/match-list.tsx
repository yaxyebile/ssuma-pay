"use client"

import { useState } from "react"
import { Match } from "./matches-view"
import { deleteMatch, updateMatch } from "@/app/actions/match-actions"
import { toast } from "sonner"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Edit, Trash2, Calendar, Clock, Globe, ExternalLink, MoreVertical, Loader2, Info, Tv, Settings, Share2, Zap, LayoutGrid } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"

interface MatchListProps {
    matches: Match[]
    loading: boolean
    onRefresh: () => void
    onEdit: (match: Match) => void
}

const CAT4_OPTIONS = [
    { value: "not.php", label: "Not on Time" },
    { value: "play1.php", label: "Channel 1" },
    { value: "play2.php", label: "Channel 2" },
    { value: "play3.php", label: "Channel 3" },
    { value: "play4.php", label: "Channel 4" },
    { value: "play5.php", label: "Channel 5" },
    { value: "play6.php", label: "Channel 6" },
]

const CAT5_OPTIONS = [
    { value: "bein1", label: "BEIN 1" },
    { value: "bein2", label: "BEIN 2" },
    { value: "bein3", label: "BEIN 3" },
    { value: "bein4", label: "BEIN 4" },
    { value: "bein5", label: "BEIN 5" },
    { value: "bein6", label: "BEIN 6" },
    { value: "bein7", label: "BEIN 7" },
    { value: "bein8", label: "BEIN 8" },
    { value: "bein9", label: "BEIN 9" },
    { value: "bein10", label: "BEIN 10" },
]

export function MatchList({ matches, loading, onRefresh, onEdit }: MatchListProps) {
    const [deletingId, setDeletingId] = useState<string | number | null>(null)
    const [updatingId, setUpdatingId] = useState<string | number | null>(null)
    const [selectedMatch, setSelectedMatch] = useState<Match | null>(null)

    const handleDelete = async (id: string | number) => {
        if (!confirm("Are you sure you want to delete this match?")) return
        setDeletingId(id)
        try {
            const res = await deleteMatch(id)
            if (res.success) {
                toast.success("Match deleted")
                onRefresh()
                setSelectedMatch(null)
            } else {
                toast.error(res.message || "Failed to delete")
            }
        } catch (error) {
            toast.error("An error occurred")
        } finally {
            setDeletingId(null)
        }
    }

    const handleQuickUpdate = async (field: string, value: string) => {
        if (!selectedMatch) return
        setUpdatingId(selectedMatch.id)
        const loadingToast = toast.loading(`Updating channel to ${value}...`)

        try {
            const res = await updateMatch(selectedMatch.id, {
                ...selectedMatch,
                [field]: value
            })

            if (res.success) {
                toast.success("Channel updated instantly", { id: loadingToast })
                onRefresh()
                setSelectedMatch(prev => prev ? { ...prev, [field]: value } : null)
            } else {
                toast.error(res.message || "Update failed", { id: loadingToast })
            }
        } catch (error) {
            toast.error("Network error during rapid update", { id: loadingToast })
        } finally {
            setUpdatingId(null)
        }
    }

    const isLive = (status: string) => {
        const s = status.toUpperCase()
        return s === "LIVE" || s === "LIV" || s.includes("LIVE")
    }

    if (loading && matches.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-20 gap-4">
                <Loader2 className="h-10 w-10 text-orange-600 animate-spin" />
                <p className="font-bold text-gray-400 uppercase tracking-widest text-xs">Accessing Stream Database...</p>
            </div>
        )
    }

    return (
        <>
            <ScrollArea className="w-full">
                <Table>
                    <TableHeader className="bg-orange-50/10">
                        <TableRow className="hover:bg-transparent border-orange-100">
                            <TableHead className="w-[300px] font-black text-orange-600 uppercase tracking-wider text-[10px] py-6 px-6">Event Identity</TableHead>
                            <TableHead className="font-black text-orange-600 uppercase tracking-wider text-[10px] py-6">Status Indicator</TableHead>
                            <TableHead className="font-black text-orange-600 uppercase tracking-wider text-[10px] py-6">Broadcast Config</TableHead>
                            <TableHead className="font-black text-orange-600 uppercase tracking-wider text-[10px] py-6">Nodes</TableHead>
                            <TableHead className="text-right font-black text-orange-600 uppercase tracking-wider text-[10px] py-6 px-6">Terminal</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {matches.map((match) => {
                            const live = isLive(match.STATUS)
                            return (
                                <TableRow
                                    key={match.id}
                                    onClick={() => setSelectedMatch(match)}
                                    className={`group cursor-pointer transition-all duration-300 border-orange-50/50 ${live ? 'bg-red-50/50 hover:bg-red-50' : 'hover:bg-orange-50/30'
                                        }`}
                                >
                                    <TableCell className="py-5 px-6">
                                        <div className="flex items-center gap-4">
                                            <div className="flex -space-x-4">
                                                <div className="h-12 w-12 rounded-xl bg-white border-2 border-orange-100 p-2 shadow-sm z-10 group-hover:scale-110 transition-transform">
                                                    <img src={match.team1_logo} alt="" className="h-full w-full object-contain" />
                                                </div>
                                                <div className="h-12 w-12 rounded-xl bg-white border-2 border-orange-100 p-2 shadow-sm group-hover:translate-x-2 transition-transform">
                                                    <img src={match.team2_logo} alt="" className="h-full w-full object-contain" />
                                                </div>
                                            </div>
                                            <div className="min-w-0">
                                                <p className={`font-black truncate flex items-center gap-2 ${live ? 'text-red-600' : 'text-gray-900'}`}>
                                                    {match.team1_name} <span className={`text-[10px] font-black ${live ? 'text-red-400' : 'text-orange-400'}`}>VS</span> {match.team2_name}
                                                </p>
                                                <div className="flex items-center gap-3 mt-1">
                                                    <div className="flex items-center gap-1 text-[10px] font-bold text-muted-foreground uppercase tracking-tight">
                                                        <Calendar className="h-3 w-3" /> {match.date}
                                                    </div>
                                                    <div className={`flex items-center gap-1 text-[10px] font-bold uppercase ${live ? 'text-red-500' : 'text-orange-600'}`}>
                                                        <Clock className="h-3 w-3" /> {match.match_time}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col gap-1.5">
                                            <Badge className={`w-fit font-black text-[9px] px-2 py-0.5 rounded-md uppercase tracking-widest border-none ${live ? 'bg-red-600 text-white animate-pulse' : 'bg-gray-900 text-white'
                                                }`}>
                                                {live ? '● LIVE NOW' : match.STATUS}
                                            </Badge>
                                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-500 uppercase">
                                                <Globe className="h-3 w-3" /> {match.english?.toUpperCase() === 'YES' ? 'English Audio' : 'Arabic Audio'}
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col gap-1">
                                            <p className={`font-black text-sm whitespace-nowrap overflow-hidden text-ellipsis ${live ? 'text-red-700' : 'text-gray-700'}`}>{match.league_name}</p>
                                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground uppercase">
                                                <Tv className="h-3 w-3" /> {match.channel}
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col gap-1.5">
                                            <div className="flex items-center gap-2">
                                                <div className={`h-1.5 w-1.5 rounded-full ${live ? 'bg-red-500' : 'bg-green-500'} animate-pulse`} />
                                                <span className="text-[10px] font-black text-gray-700 uppercase leading-none">App: {match.category5_url}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className={`h-1.5 w-1.5 rounded-full ${live ? 'bg-red-400' : 'bg-blue-500'}`} />
                                                <span className="text-[10px] font-black text-gray-700 uppercase leading-none">Web: {match.category4_url}</span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right px-6" onClick={(e) => e.stopPropagation()}>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-10 w-10 p-0 rounded-xl hover:bg-orange-100 text-gray-400 hover:text-orange-600">
                                                    <MoreVertical className="h-5 w-5" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-48 rounded-2xl p-2 border-orange-100 shadow-2xl">
                                                <DropdownMenuItem onClick={() => onEdit(match)} className="rounded-xl px-3 py-2.5 font-bold text-gray-700 focus:bg-orange-50 focus:text-orange-600 cursor-pointer">
                                                    <Edit className="h-4 w-4 mr-3" /> Quick Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => window.open(`https://zentova.net/${match.category4_url}`, '_blank')} className="rounded-xl px-3 py-2.5 font-bold text-gray-700 focus:bg-orange-50 focus:text-orange-600 cursor-pointer">
                                                    <ExternalLink className="h-4 w-4 mr-3" /> Preview Web
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator className="bg-orange-50" />
                                                <DropdownMenuItem
                                                    onClick={() => handleDelete(match.id)}
                                                    className="rounded-xl px-3 py-2.5 font-bold text-red-500 focus:bg-red-50 focus:text-red-600 cursor-pointer"
                                                >
                                                    <Trash2 className="h-4 w-4 mr-3" /> Terminate Stream
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            )
                        })}
                    </TableBody>
                </Table>
            </ScrollArea>

            {/* Match Detail Modal with Quick Channel Switch */}
            <Dialog open={!!selectedMatch} onOpenChange={() => setSelectedMatch(null)}>
                {selectedMatch && (
                    <DialogContent className="max-w-2xl rounded-[2.5rem] p-0 border-none shadow-2xl overflow-hidden bg-white">
                        <DialogHeader className="sr-only">
                            <DialogTitle>{selectedMatch.team1_name} vs {selectedMatch.team2_name}</DialogTitle>
                            <DialogDescription>Match live stream and node management</DialogDescription>
                        </DialogHeader>
                        <div className={`h-40 w-full relative ${isLive(selectedMatch.STATUS) ? 'bg-red-600' : 'bg-orange-600'}`}>
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                            <div className="absolute -bottom-10 left-10 flex items-center gap-6">
                                <div className="flex -space-x-8">
                                    <div className="h-24 w-24 rounded-3xl bg-white shadow-2xl border-4 border-white p-4 group-hover:rotate-6 transition-transform">
                                        <img src={selectedMatch.team1_logo} alt="" className="h-full w-full object-contain" />
                                    </div>
                                    <div className="h-24 w-24 rounded-3xl bg-white shadow-2xl border-4 border-white p-4 group-hover:-rotate-6 transition-transform">
                                        <img src={selectedMatch.team2_logo} alt="" className="h-full w-full object-contain" />
                                    </div>
                                </div>
                                <div className="mb-4">
                                    <Badge className="bg-white/20 backdrop-blur-md text-white border-none font-bold text-[10px] px-3 py-1 mb-2 uppercase tracking-widest">
                                        {selectedMatch.league_name}
                                    </Badge>
                                    <h2 className="text-3xl font-black text-white tracking-tighter drop-shadow-lg">
                                        {selectedMatch.team1_name} VS {selectedMatch.team2_name}
                                    </h2>
                                </div>
                            </div>
                        </div>

                        <div className="pt-16 pb-10 px-10">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                                <div className="p-4 rounded-2xl bg-orange-50/30 border border-orange-100 flex flex-col gap-1">
                                    <span className="text-[10px] font-black uppercase text-orange-600 tracking-widest">Status</span>
                                    <span className={`font-black uppercase text-sm ${isLive(selectedMatch.STATUS) ? 'text-red-600' : 'text-gray-900'}`}>{selectedMatch.STATUS}</span>
                                </div>
                                <div className="p-4 rounded-2xl bg-orange-50/30 border border-orange-100 flex flex-col gap-1">
                                    <span className="text-[10px] font-black uppercase text-orange-600 tracking-widest">Language</span>
                                    <span className="font-black uppercase text-sm text-gray-900">{selectedMatch.english === 'yes' ? 'English' : 'Arabic'}</span>
                                </div>
                                <div className="p-4 rounded-2xl bg-orange-50/30 border border-orange-100 flex flex-col gap-1">
                                    <span className="text-[10px] font-black uppercase text-orange-600 tracking-widest">Kickoff</span>
                                    <span className="font-black text-sm text-gray-900">{selectedMatch.match_time}</span>
                                </div>
                                <div className="p-4 rounded-2xl bg-orange-50/30 border border-orange-100 flex flex-col gap-1">
                                    <span className="text-[10px] font-black uppercase text-orange-600 tracking-widest">Schedule</span>
                                    <span className="font-black text-sm text-gray-900">{selectedMatch.date}</span>
                                </div>
                            </div>

                            {/* Quick Channel Management Section */}
                            <div className="mb-8 p-6 rounded-3xl bg-gray-50 border-2 border-dashed border-orange-100 space-y-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <Zap className="h-4 w-4 text-orange-600 animate-pulse" />
                                    <span className="text-xs font-black uppercase tracking-widest text-gray-600">Rapid Infrastructure Switch</span>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase text-gray-400 px-1">Web Channel (Category 4)</Label>
                                        <Select
                                            disabled={!!updatingId}
                                            defaultValue={selectedMatch.category4_url}
                                            onValueChange={(val) => handleQuickUpdate("category4_url", val)}
                                        >
                                            <SelectTrigger className="h-12 rounded-xl bg-white border-orange-100 font-bold text-gray-700 shadow-sm">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-xl border-orange-100">
                                                {CAT4_OPTIONS.map(opt => (
                                                    <SelectItem key={opt.value} value={opt.value} className="font-bold">{opt.label}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase text-gray-400 px-1">App Node (Category 5)</Label>
                                        <Select
                                            disabled={!!updatingId}
                                            defaultValue={selectedMatch.category5_url}
                                            onValueChange={(val) => handleQuickUpdate("category5_url", val)}
                                        >
                                            <SelectTrigger className="h-12 rounded-xl bg-white border-orange-100 font-bold text-gray-700 shadow-sm">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-xl border-orange-100">
                                                {CAT5_OPTIONS.map(opt => (
                                                    <SelectItem key={opt.value} value={opt.value} className="font-bold">{opt.label}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                {updatingId && (
                                    <div className="flex items-center justify-center gap-2 text-orange-600 py-1">
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        <span className="text-[10px] font-bold uppercase tracking-widest">Applying changes live...</span>
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <Button
                                    className="h-16 rounded-[1.25rem] bg-gray-900 hover:bg-gray-800 text-white font-black group transition-all"
                                    onClick={() => {
                                        onEdit(selectedMatch);
                                        setSelectedMatch(null);
                                    }}
                                >
                                    <Settings className="h-5 w-5 mr-3 group-hover:rotate-90 transition-transform" />
                                    Full Config
                                </Button>
                                <Button
                                    variant="outline"
                                    className="h-16 rounded-[1.25rem] border-orange-200 text-gray-700 hover:bg-orange-50 font-black"
                                    onClick={() => window.open(`https://zentova.net/${selectedMatch.category4_url}`, '_blank')}
                                >
                                    <ExternalLink className="h-5 w-5 mr-3" />
                                    Live Preview
                                </Button>
                            </div>

                            <Button
                                variant="ghost"
                                className="w-full h-12 mt-4 rounded-xl text-red-500 hover:bg-red-50 font-bold text-xs"
                                onClick={() => handleDelete(selectedMatch.id)}
                            >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Terminate Match
                            </Button>
                        </div>
                    </DialogContent>
                )}
            </Dialog>
        </>
    )
}
