"use client"

import { useState, useEffect, useMemo } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Team, Match } from "./matches-view"
import { addMatch, updateMatch } from "@/app/actions/match-actions"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Search, Plus, Calendar, Clock, Globe, Tv, Database, Loader2, X, Trophy, ChevronRight } from "lucide-react"

const matchSchema = z.object({
    team1_name: z.string().min(1, "Team 1 Name is required"),
    team1_logo: z.string().url("Invalid Logo URL").or(z.string().min(1, "Logo URL is required")),
    team2_name: z.string().min(1, "Team 2 Name is required"),
    team2_logo: z.string().url("Invalid Logo URL").or(z.string().min(1, "Logo URL is required")),
    match_time: z.string().min(1, "Time is required"),
    date: z.string().min(1, "Date is required"),
    STATUS: z.string().min(1, "Status is required"),
    english: z.string().default("yes"),
    channel: z.string().min(1, "Channel is required"),
    league_name: z.string().min(1, "League Name is required"),
    category4_url: z.string().min(1, "Category 4 is required"),
    category5_url: z.string().min(1, "Category 5 is required"),
})

type MatchFormValues = z.infer<typeof matchSchema>

interface MatchFormProps {
    teams: Team[]
    onSuccess: () => void
    editingMatch?: Match | null
    onCancelEdit?: () => void
}

export function MatchForm({ teams, onSuccess, editingMatch, onCancelEdit }: MatchFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [team1Search, setTeam1Search] = useState("")
    const [team2Search, setTeam2Search] = useState("")
    const [showTeam1Suggestions, setShowTeam1Suggestions] = useState(false)
    const [showTeam2Suggestions, setShowTeam2Suggestions] = useState(false)

    const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<MatchFormValues>({
        resolver: zodResolver(matchSchema),
        defaultValues: {
            english: "yes",
            STATUS: "token",
            category4_url: "not.php",
            category5_url: "bein1"
        }
    })

    useEffect(() => {
        if (editingMatch) {
            reset({
                team1_name: editingMatch.team1_name,
                team1_logo: editingMatch.team1_logo,
                team2_name: editingMatch.team2_name,
                team2_logo: editingMatch.team2_logo,
                match_time: editingMatch.match_time,
                date: editingMatch.date,
                STATUS: editingMatch.STATUS,
                english: editingMatch.english,
                channel: editingMatch.channel,
                league_name: editingMatch.league_name,
                category4_url: editingMatch.category4_url,
                category5_url: editingMatch.category5_url,
            })
            setTeam1Search(editingMatch.team1_name)
            setTeam2Search(editingMatch.team2_name)
        } else {
            reset({
                team1_name: "",
                team1_logo: "",
                team2_name: "",
                team2_logo: "",
                match_time: "",
                date: "",
                STATUS: "token",
                english: "yes",
                channel: "Coming Soon",
                league_name: "",
                category4_url: "not.php",
                category5_url: "bein1"
            })
            setTeam1Search("")
            setTeam2Search("")
        }
    }, [editingMatch, reset])

    const filteredTeams1 = useMemo(() => {
        if (!team1Search) return []
        return teams.filter(t => t.name.toLowerCase().includes(team1Search.toLowerCase())).slice(0, 5)
    }, [teams, team1Search])

    const filteredTeams2 = useMemo(() => {
        if (!team2Search) return []
        return teams.filter(t => t.name.toLowerCase().includes(team2Search.toLowerCase())).slice(0, 5)
    }, [teams, team2Search])

    const onSelectTeam = (side: 1 | 2, team: Team) => {
        if (side === 1) {
            setValue("team1_name", team.name)
            setValue("team1_logo", team.logo)
            setTeam1Search(team.name)
            setShowTeam1Suggestions(false)
        } else {
            setValue("team2_name", team.name)
            setValue("team2_logo", team.logo)
            setTeam2Search(team.name)
            setShowTeam2Suggestions(false)
        }
    }

    const onSubmit = async (values: MatchFormValues) => {
        setIsSubmitting(true)
        try {
            let res
            if (editingMatch) {
                res = await updateMatch(editingMatch.id, values)
            } else {
                res = await addMatch(values)
            }

            if (res.success) {
                toast.success(editingMatch ? "Match updated successfully" : "Match added successfully")
                if (!editingMatch) reset()
                onSuccess()
                if (onCancelEdit) onCancelEdit()
            } else {
                toast.error(res.message || "Failed to save match")
            }
        } catch (error) {
            toast.error("An error occurred")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Card className="border-orange-100 shadow-xl shadow-orange-500/5 bg-white relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-400 via-orange-600 to-orange-400" />
            <CardContent className="p-8">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="h-12 w-12 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-600 shadow-inner">
                                <Trophy className="h-6 w-6" />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-gray-900 tracking-tight">
                                    {editingMatch ? 'Edit Match Details' : 'Initialize New Match'}
                                </h3>
                                <p className="text-sm text-muted-foreground font-medium">Configure live stream parameters and metadata</p>
                            </div>
                        </div>
                        {editingMatch && (
                            <Button variant="ghost" type="button" onClick={onCancelEdit} className="text-red-500 hover:text-red-600 hover:bg-red-50 font-bold">
                                <X className="h-4 w-4 mr-2" />
                                Discard Changes
                            </Button>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Team 1 Section */}
                        <div className="space-y-4 p-6 rounded-2xl bg-orange-50/30 border border-orange-100/50">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="h-8 w-8 rounded-lg bg-orange-600 flex items-center justify-center text-white text-xs font-bold shadow-lg">1</div>
                                <Label className="text-sm font-black uppercase tracking-widest text-orange-600">Home Team (T1)</Label>
                            </div>

                            <div className="relative">
                                <Label className="text-xs font-bold text-gray-500 mb-1.5 block">Team 1 Name</Label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-orange-400" />
                                    <Input
                                        {...register("team1_name")}
                                        className="pl-10 h-12 bg-white border-orange-100 rounded-xl font-bold focus:ring-orange-500 focus:border-orange-500"
                                        placeholder="Search or enter name..."
                                        autoComplete="off"
                                        value={team1Search}
                                        onChange={(e) => {
                                            setTeam1Search(e.target.value)
                                            setValue("team1_name", e.target.value)
                                            setShowTeam1Suggestions(true)
                                        }}
                                        onFocus={() => setShowTeam1Suggestions(true)}
                                        onBlur={() => setTimeout(() => setShowTeam1Suggestions(false), 200)}
                                    />
                                </div>
                                {showTeam1Suggestions && filteredTeams1.length > 0 && (
                                    <div className="absolute z-50 w-full mt-2 bg-white border border-orange-100 rounded-xl shadow-2xl p-2 animate-in fade-in zoom-in-95 duration-200">
                                        {filteredTeams1.map(team => (
                                            <button
                                                key={team.id}
                                                type="button"
                                                className="w-full text-left px-4 py-3 hover:bg-orange-50 rounded-lg flex items-center gap-3 transition-colors group"
                                                onClick={() => onSelectTeam(1, team)}
                                            >
                                                <img src={team.logo} alt="" className="h-8 w-8 rounded-md object-contain p-1 bg-white border border-orange-100 shadow-sm" />
                                                <span className="font-bold text-gray-700 group-hover:text-orange-600">{team.name}</span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                                {errors.team1_name && <p className="text-[10px] font-bold text-red-500 mt-1 uppercase tracking-wider">{errors.team1_name.message}</p>}
                            </div>

                            <div className="relative">
                                <Label className="text-xs font-bold text-gray-500 mb-1.5 block">Team 1 Logo URL</Label>
                                <div className="relative">
                                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-orange-400" />
                                    <Input
                                        {...register("team1_logo")}
                                        className="pl-10 h-12 bg-white border-orange-100 rounded-xl font-medium"
                                        placeholder="https://..."
                                    />
                                </div>
                                {errors.team1_logo && <p className="text-[10px] font-bold text-red-500 mt-1 uppercase tracking-wider">{errors.team1_logo.message}</p>}
                            </div>
                        </div>

                        {/* Team 2 Section */}
                        <div className="space-y-4 p-6 rounded-2xl bg-orange-50/30 border border-orange-100/50">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="h-8 w-8 rounded-lg bg-orange-600 flex items-center justify-center text-white text-xs font-bold shadow-lg">2</div>
                                <Label className="text-sm font-black uppercase tracking-widest text-orange-600">Away Team (T2)</Label>
                            </div>

                            <div className="relative">
                                <Label className="text-xs font-bold text-gray-500 mb-1.5 block">Team 2 Name</Label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-orange-400" />
                                    <Input
                                        {...register("team2_name")}
                                        className="pl-10 h-12 bg-white border-orange-100 rounded-xl font-bold focus:ring-orange-500 focus:border-orange-500"
                                        placeholder="Search or enter name..."
                                        autoComplete="off"
                                        value={team2Search}
                                        onChange={(e) => {
                                            setTeam2Search(e.target.value)
                                            setValue("team2_name", e.target.value)
                                            setShowTeam2Suggestions(true)
                                        }}
                                        onFocus={() => setShowTeam2Suggestions(true)}
                                        onBlur={() => setTimeout(() => setShowTeam2Suggestions(false), 200)}
                                    />
                                </div>
                                {showTeam2Suggestions && filteredTeams2.length > 0 && (
                                    <div className="absolute z-50 w-full mt-2 bg-white border border-orange-100 rounded-xl shadow-2xl p-2 animate-in fade-in zoom-in-95 duration-200">
                                        {filteredTeams2.map(team => (
                                            <button
                                                key={team.id}
                                                type="button"
                                                className="w-full text-left px-4 py-3 hover:bg-orange-50 rounded-lg flex items-center gap-3 transition-colors group"
                                                onClick={() => onSelectTeam(2, team)}
                                            >
                                                <img src={team.logo} alt="" className="h-8 w-8 rounded-md object-contain p-1 bg-white border border-orange-100 shadow-sm" />
                                                <span className="font-bold text-gray-700 group-hover:text-orange-600">{team.name}</span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                                {errors.team2_name && <p className="text-[10px] font-bold text-red-500 mt-1 uppercase tracking-wider">{errors.team2_name.message}</p>}
                            </div>

                            <div className="relative">
                                <Label className="text-xs font-bold text-gray-500 mb-1.5 block">Team 2 Logo URL</Label>
                                <div className="relative">
                                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-orange-400" />
                                    <Input
                                        {...register("team2_logo")}
                                        className="pl-10 h-12 bg-white border-orange-100 rounded-xl font-medium"
                                        placeholder="https://..."
                                    />
                                </div>
                                {errors.team2_logo && <p className="text-[10px] font-bold text-red-500 mt-1 uppercase tracking-wider">{errors.team2_logo.message}</p>}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="space-y-2">
                            <Label className="text-xs font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
                                <Calendar className="h-3 w-3" /> Date
                            </Label>
                            <Input {...register("date")} type="date" className="h-11 rounded-xl border-orange-100 font-bold" />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
                                <Clock className="h-3 w-3" /> Time
                            </Label>
                            <Input {...register("match_time")} type="time" className="h-11 rounded-xl border-orange-100 font-bold" />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
                                <Tv className="h-3 w-3" /> Commentator
                            </Label>
                            <Input {...register("channel")} placeholder="Commentator Label" className="h-11 rounded-xl border-orange-100 font-bold" />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
                                <Database className="h-3 w-3" /> Status
                            </Label>
                            <Input {...register("STATUS")} placeholder="token or browser" className="h-11 rounded-xl border-orange-100 font-bold" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-orange-50">
                        <div className="space-y-2">
                            <Label className="text-xs font-black uppercase tracking-widest text-gray-400">League Name</Label>
                            <Input {...register("league_name")} placeholder="Premier League" className="h-11 rounded-xl border-orange-100 font-bold" />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs font-black uppercase tracking-widest text-gray-400">English Language</Label>
                            <Select onValueChange={(val) => setValue("english", val)} defaultValue={watch("english")}>
                                <SelectTrigger className="h-11 rounded-xl border-orange-100 font-bold">
                                    <SelectValue placeholder="Select" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl border-orange-100">
                                    <SelectItem value="yes" className="font-bold">YES</SelectItem>
                                    <SelectItem value="no" className="font-bold">NO</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs font-black uppercase tracking-widest text-orange-600">Category 5 (Frontend App)</Label>
                            <Select onValueChange={(val) => setValue("category5_url", val)} defaultValue={watch("category5_url")}>
                                <SelectTrigger className="h-11 rounded-xl border-orange-600 bg-orange-50/50 font-bold text-orange-700">
                                    <SelectValue placeholder="Select Channel" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl border-orange-100">
                                    <SelectItem value="bein1" className="font-bold">Channel 1</SelectItem>
                                    <SelectItem value="bein2" className="font-bold">Channel 2</SelectItem>
                                    <SelectItem value="bein3" className="font-bold">Channel 3</SelectItem>
                                    <SelectItem value="bein4" className="font-bold">Channel 4</SelectItem>
                                    <SelectItem value="bein5" className="font-bold">Channel 5</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-xs font-black uppercase tracking-widest text-orange-600">Category 4 (Streaming URL)</Label>
                        <Select onValueChange={(val) => setValue("category4_url", val)} defaultValue={watch("category4_url")}>
                            <SelectTrigger className="h-12 rounded-xl border-orange-600 bg-orange-50/50 font-bold text-orange-700">
                                <SelectValue placeholder="Select Streaming Destination" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-orange-100 max-h-[300px]">
                                <SelectItem value="not.php" className="font-bold">Not on Time</SelectItem>
                                <SelectItem value="play1.php" className="font-bold">Channel 1</SelectItem>
                                <SelectItem value="play2.php" className="font-bold">Channel 2</SelectItem>
                                <SelectItem value="play3.php" className="font-bold">Channel 3</SelectItem>
                                <SelectItem value="play4.php" className="font-bold">Channel 4</SelectItem>
                                <SelectItem value="play5.php" className="font-bold">Channel 5</SelectItem>
                                <SelectItem value="play6.php" className="font-bold">Channel 6</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex gap-4 pt-4">
                        <Button
                            disabled={isSubmitting}
                            type="submit"
                            className="flex-1 h-16 rounded-2xl bg-orange-600 hover:bg-orange-700 text-white font-black text-lg shadow-xl shadow-orange-600/20 transition-all active:scale-[0.98] group"
                        >
                            {isSubmitting ? (
                                <Loader2 className="h-6 w-6 animate-spin" />
                            ) : (
                                <>
                                    {editingMatch ? 'Update Match Configuration' : 'Deploy Match Live'}
                                    <ChevronRight className="ml-2 h-6 w-6 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </Button>
                        {editingMatch && (
                            <Button
                                type="button"
                                variant="outline"
                                onClick={onCancelEdit}
                                className="h-16 px-8 rounded-2xl border-orange-200 text-gray-500 font-bold hover:bg-orange-50 hover:text-orange-600"
                            >
                                Cancel
                            </Button>
                        )}
                    </div>
                </form>
            </CardContent>
        </Card>
    )
}
