"use client"

import { useState } from "react"
import { Team } from "./matches-view"
import { addTeam, editTeam } from "@/app/actions/team-actions"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Plus, Search, Edit, Users, Image as ImageIcon, Loader2, Save, X } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"

interface TeamsManagerProps {
    teams: Team[]
    onRefresh: () => void
    loading: boolean
}

export function TeamsManager({ teams, onRefresh, loading }: TeamsManagerProps) {
    const [searchTerm, setSearchTerm] = useState("")
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)
    const [editingTeam, setEditingTeam] = useState<Team | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const [formValues, setFormValues] = useState({ name: "", logo: "" })

    const filteredTeams = teams.filter(t =>
        t.name.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const handleAddTeam = async () => {
        if (!formValues.name || !formValues.logo) {
            toast.error("Please fill all fields")
            return
        }
        setIsSubmitting(true)
        try {
            const res = await addTeam(formValues.name, formValues.logo)
            if (res.success) {
                toast.success("Team added successfully")
                setFormValues({ name: "", logo: "" })
                setIsAddModalOpen(false)
                onRefresh()
            } else {
                toast.error(res.message || "Failed to add team")
            }
        } catch (error) {
            toast.error("An error occurred")
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleEditTeam = async () => {
        if (!editingTeam) return
        if (!formValues.name || !formValues.logo) {
            toast.error("Please fill all fields")
            return
        }
        setIsSubmitting(true)
        try {
            const res = await editTeam(editingTeam.id, formValues.name, formValues.logo)
            if (res.success) {
                toast.success("Team updated successfully")
                setEditingTeam(null)
                onRefresh()
            } else {
                toast.error(res.message || "Failed to update team")
            }
        } catch (error) {
            toast.error("An error occurred")
        } finally {
            setIsSubmitting(false)
        }
    }

    const openEdit = (team: Team) => {
        setEditingTeam(team)
        setFormValues({ name: team.name, logo: team.logo })
    }

    const openAdd = () => {
        setFormValues({ name: "", logo: "" })
        setIsAddModalOpen(true)
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-orange-400 font-black" />
                    <Input
                        placeholder="Search global library..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 h-14 bg-white border-orange-100 rounded-2xl font-bold shadow-sm shadow-orange-500/5 focus:ring-orange-500"
                    />
                </div>
                <Button onClick={openAdd} className="w-full md:w-auto h-14 px-8 rounded-2xl bg-orange-600 hover:bg-orange-700 text-white font-black shadow-xl shadow-orange-600/20 group">
                    <Plus className="h-5 w-5 mr-2 group-hover:rotate-90 transition-transform" />
                    New Team Profile
                </Button>
            </div>

            {loading && teams.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-20 gap-4">
                    <Loader2 className="h-10 w-10 text-orange-600 animate-spin" />
                    <p className="font-bold text-gray-400 uppercase tracking-widest text-xs">Accessing Database...</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {filteredTeams.map((team) => (
                        <Card key={team.id} className="group hover:border-orange-200 transition-all duration-300 bg-white shadow-sm hover:shadow-xl hover:shadow-orange-500/5 overflow-hidden">
                            <CardContent className="p-4 flex flex-col items-center text-center relative">
                                <div className="h-20 w-20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-500">
                                    <img src={team.logo} alt={team.name} className="max-h-full max-w-full object-contain p-2 drop-shadow-md" />
                                </div>
                                <p className="text-xs font-black text-gray-900 truncate w-full uppercase tracking-tight">{team.name}</p>
                                <button
                                    onClick={() => openEdit(team)}
                                    className="absolute top-2 right-2 p-1.5 rounded-lg bg-orange-50 text-orange-600 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <Edit className="h-3.5 w-3.5" />
                                </button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Add Team Modal */}
            <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                <DialogContent className="max-w-md rounded-3xl p-8 border-orange-100">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black text-gray-900 flex items-center gap-3">
                            <Users className="h-6 w-6 text-orange-600" />
                            Add New Team
                        </DialogTitle>
                        <DialogDescription className="font-medium">
                            Create a global profile to use in matches.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-6 py-4">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Official Name</Label>
                            <Input
                                value={formValues.name}
                                onChange={e => setFormValues(prev => ({ ...prev, name: e.target.value }))}
                                placeholder="Arsenal FC"
                                className="h-12 border-orange-100 rounded-xl font-bold"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Logo SVG/PNG URL</Label>
                            <Input
                                value={formValues.logo}
                                onChange={e => setFormValues(prev => ({ ...prev, logo: e.target.value }))}
                                placeholder="https://..."
                                className="h-12 border-orange-100 rounded-xl"
                            />
                        </div>
                        {formValues.logo && (
                            <div className="p-4 rounded-2xl bg-orange-50/50 flex flex-col items-center gap-2 border border-orange-100/50">
                                <Label className="text-[9px] font-black uppercase tracking-widest text-orange-600">Logo Preview</Label>
                                <img src={formValues.logo} alt="Preview" className="h-16 w-16 object-contain" onError={(e) => (e.currentTarget.style.display = 'none')} />
                            </div>
                        )}
                    </div>
                    <DialogFooter className="gap-3 sm:justify-start">
                        <Button
                            disabled={isSubmitting}
                            onClick={handleAddTeam}
                            className="flex-1 h-12 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-black"
                        >
                            {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : "Confirm & Save"}
                        </Button>
                        <Button variant="outline" onClick={() => setIsAddModalOpen(false)} className="h-12 rounded-xl border-orange-200 font-bold">
                            Cancel
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Team Modal */}
            <Dialog open={!!editingTeam} onOpenChange={() => setEditingTeam(null)}>
                <DialogContent className="max-w-md rounded-3xl p-8 border-orange-100">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black text-gray-900 flex items-center gap-3">
                            <Edit className="h-6 w-6 text-orange-600" />
                            Update Profile
                        </DialogTitle>
                        <DialogDescription className="font-medium">
                            Modify team identity data globally.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-6 py-4">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Official Name</Label>
                            <Input
                                value={formValues.name}
                                onChange={e => setFormValues(prev => ({ ...prev, name: e.target.value }))}
                                className="h-12 border-orange-100 rounded-xl font-bold"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Logo SVG/PNG URL</Label>
                            <Input
                                value={formValues.logo}
                                onChange={e => setFormValues(prev => ({ ...prev, logo: e.target.value }))}
                                className="h-12 border-orange-100 rounded-xl"
                            />
                        </div>
                        <div className="p-4 rounded-2xl bg-orange-50/50 flex flex-col items-center gap-2 border border-orange-100/50">
                            <Label className="text-[9px] font-black uppercase tracking-widest text-orange-600">Active Identity</Label>
                            <img src={formValues.logo} alt="Preview" className="h-16 w-16 object-contain shadow-sm" />
                        </div>
                    </div>
                    <DialogFooter className="gap-3 sm:justify-start">
                        <Button
                            disabled={isSubmitting}
                            onClick={handleEditTeam}
                            className="flex-1 h-12 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-black"
                        >
                            {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5 mr-2" />}
                            Apply Changes
                        </Button>
                        <Button variant="outline" onClick={() => setEditingTeam(null)} className="h-12 rounded-xl border-orange-200 font-bold">
                            Cancel
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
