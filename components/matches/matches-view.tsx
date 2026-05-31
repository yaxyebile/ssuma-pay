"use client"

import { useState, useEffect, useCallback } from "react"
import { Trophy, ChevronRight, LayoutGrid, List as ListIcon, Plus, Users } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MatchForm } from "./match-form"
import { MatchList } from "./match-list"
import { TeamsManager } from "./teams-manager"
import { fetchTeams } from "@/app/actions/team-actions"
import { fetchMatches } from "@/app/actions/match-actions"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

export interface Team {
    id: string | number
    name: string
    logo: string
}

export interface Match {
    id: string | number
    team1_name: string
    team1_logo: string
    team2_name: string
    team2_logo: string
    match_time: string
    date: string
    STATUS: string
    english: string
    channel: string
    league_name: string
    category4_url: string
    category5_url: string
}

interface MatchesViewProps {
    initialTab?: "matches" | "teams"
    initialView?: "list" | "form"
}

export function MatchesView({ initialTab = "matches", initialView = "list" }: MatchesViewProps) {
    const [teams, setTeams] = useState<Team[]>([])
    const [matches, setMatches] = useState<Match[]>([])
    const [loading, setLoading] = useState(true)
    const [refreshTrigger, setRefreshTrigger] = useState(0)
    const [editingMatch, setEditingMatch] = useState<Match | null>(null)
    const [currentView, setCurrentView] = useState<"list" | "form">(initialView)

    // Sync currentView with prop when it changes (since page.tsx might pass a new value)
    useEffect(() => {
        setCurrentView(initialView)
    }, [initialView])

    const loadData = useCallback(async () => {
        setLoading(true)
        try {
            const [teamsRes, matchesRes] = await Promise.all([
                fetchTeams(),
                fetchMatches()
            ])

            if (teamsRes.success) setTeams(teamsRes.teams || [])
            if (matchesRes.success) setMatches(matchesRes.matches || [])
            else toast.error("Failed to load matches: " + (matchesRes.error || "Unknown error"))
        } catch (error) {
            toast.error("An error occurred while loading data.")
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        loadData()
    }, [loadData, refreshTrigger])

    const handleRefresh = () => setRefreshTrigger(prev => prev + 1)

    const handleEditMatch = (match: Match) => {
        setEditingMatch(match)
        setCurrentView("form")
        const formElement = document.getElementById('match-form-container')
        if (formElement) {
            formElement.scrollIntoView({ behavior: 'smooth' })
        }
    }

    if (initialTab === "teams") {
        return (
            <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                    <div className="h-10 w-10 rounded-xl bg-orange-600 flex items-center justify-center text-white shadow-lg">
                        <Users className="h-5 w-5" />
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-gray-900 tracking-tight">Teams Library</h2>
                        <p className="text-sm text-muted-foreground font-medium">Manage global team identities</p>
                    </div>
                </div>
                <TeamsManager teams={teams} onRefresh={handleRefresh} loading={loading} />
            </div>
        )
    }

    return (
        <div className="space-y-8 pb-10">
            {currentView === "form" ? (
                <div id="match-form-container" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="h-10 w-10 rounded-xl bg-orange-600 flex items-center justify-center text-white shadow-lg">
                            <Plus className="h-5 w-5" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-gray-900 tracking-tight">
                                {editingMatch ? 'Modify Existing Match' : 'Add New Match Entry'}
                            </h2>
                            <p className="text-sm text-muted-foreground font-medium">Deploy live stream configuration to infrastructure</p>
                        </div>
                    </div>
                    <MatchForm
                        teams={teams}
                        onSuccess={() => {
                            handleRefresh();
                            if (editingMatch) setCurrentView("list");
                        }}
                        editingMatch={editingMatch}
                        onCancelEdit={() => {
                            setEditingMatch(null);
                            setCurrentView("list");
                        }}
                    />
                </div>
            ) : (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {/* Stats Overview only on list view */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Card className="bg-white border-orange-100 shadow-sm overflow-hidden relative group">
                            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:scale-110 transition-transform">
                                <Trophy className="h-16 w-16 text-orange-600" />
                            </div>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Total Matches</CardTitle>
                                <CardDescription className="text-3xl font-black text-gray-900">{matches.length}</CardDescription>
                            </CardHeader>
                        </Card>
                        <Card className="bg-white border-orange-100 shadow-sm overflow-hidden relative group">
                            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:scale-110 transition-transform">
                                <Users className="h-16 w-16 text-orange-600" />
                            </div>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Teams in Library</CardTitle>
                                <CardDescription className="text-3xl font-black text-gray-900">{teams.length}</CardDescription>
                            </CardHeader>
                        </Card>
                        <Card className="bg-white border-orange-100 shadow-sm overflow-hidden relative group">
                            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:scale-110 transition-transform">
                                <LayoutGrid className="h-16 w-16 text-orange-600" />
                            </div>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Infrastructure Load</CardTitle>
                                <CardDescription className="text-3xl font-black text-gray-900">Optimal</CardDescription>
                            </CardHeader>
                        </Card>
                    </div>

                    <Card className="border-orange-100 shadow-sm overflow-hidden">
                        <CardHeader className="border-b border-orange-50 bg-white/50 backdrop-blur-sm">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <Trophy className="h-5 w-5 text-orange-600" />
                                        <CardTitle className="text-lg font-black text-gray-900 tracking-tight">Active Matches</CardTitle>
                                    </div>
                                    <CardDescription>Manage your scheduled live stream matches</CardDescription>
                                </div>
                                <button
                                    onClick={handleRefresh}
                                    className="p-2 rounded-lg hover:bg-orange-50 text-orange-600 transition-colors"
                                >
                                    <ListIcon className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
                                </button>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <MatchList
                                matches={matches}
                                loading={loading}
                                onRefresh={handleRefresh}
                                onEdit={handleEditMatch}
                            />
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    )
}
