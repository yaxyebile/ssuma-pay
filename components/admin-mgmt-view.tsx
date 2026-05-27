"use client"

import { useState, useEffect } from "react"
import { useApp } from "@/lib/app-context"
import { supabase } from "@/lib/supabase"
import { registerUserAction } from "@/lib/actions"
import {
    Shield,
    User as UserIcon,
    Mail,
    ShieldAlert,
    Plus,
    X,
    Loader2,
    Lock,
    UserCheck,
    CheckCircle2
} from "lucide-react"
import { toast } from "sonner"

interface Profile {
    id: string
    name: string
    email: string
    role: "admin" | "staff"
}

export function AdminManagementView() {
    const { currentUser } = useApp()
    const [users, setUsers] = useState<Profile[]>([])
    const [loading, setLoading] = useState(true)

    // Create/Register User State
    const [showAddUser, setShowAddUser] = useState(false)
    const [addingUser, setAddingUser] = useState(false)
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        role: "staff" as "admin" | "staff"
    })

    const fetchUsers = async () => {
        setLoading(true)
        try {
            const { data } = await supabase
                .from("profiles")
                .select("*")
                .order("name", { ascending: true })

            if (data) setUsers(data)
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchUsers()
    }, [])

    const toggleRole = async (userId: string, currentRole: string) => {
        if (userId === currentUser?.id) {
            toast.error("Ma beddeli kartid role-kaaga!")
            return
        }

        const newRole = currentRole === "admin" ? "staff" : "admin"
        const { error } = await supabase
            .from("profiles")
            .update({ role: newRole })
            .eq("id", userId)

        if (error) {
            toast.error("Wuu ku guul darraystay!")
        } else {
            toast.success(`Role-ka waxaa loo beddelay ${newRole}`)
            fetchUsers()
        }
    }

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault()
        setAddingUser(true)

        try {
            const result = await registerUserAction(formData);
            if (!result.success) throw new Error(result.message);

            toast.success("User-ka si guul leh ayaa loo diwaangeliyay!")
            setShowAddUser(false)
            setFormData({ name: "", email: "", password: "", role: "staff" })
            fetchUsers()
        } catch (err: any) {
            toast.error(err.message || "Khalad ayaa dhacay")
        } finally {
            setAddingUser(false)
        }
    }

    if (loading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-600"></div>
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-black text-gray-900 tracking-tight">Xubnaha System-ka</h2>
                    <p className="text-sm text-gray-500 font-medium mt-1">Maamul dadka awooda u leh inay galaan Suuma Pay.</p>
                </div>
                <button
                    onClick={() => setShowAddUser(true)}
                    className="flex items-center gap-2 bg-orange-600 text-white px-5 py-3 rounded-2xl text-sm font-black hover:bg-orange-700 transition-all shadow-lg shadow-orange-600/20 active:scale-95"
                >
                    <Plus className="h-4 w-4" />
                    User Cusub
                </button>
            </div>

            {showAddUser && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-gray-900/40 backdrop-blur-md p-4 animate-in fade-in duration-300">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-300 border border-orange-100">
                        <div className="flex items-center justify-between px-8 py-6 border-b border-orange-50 bg-orange-50/30">
                            <h3 className="text-lg font-black text-gray-900">Diwaangeli User Cusub</h3>
                            <button onClick={() => setShowAddUser(false)} className="text-gray-400 hover:text-orange-600 bg-white p-2 rounded-xl border border-orange-100 shadow-sm transition-all hover:scale-110">
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                        <form onSubmit={handleRegister} className="p-8 flex flex-col gap-5">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Magaca Full Name</label>
                                <div className="relative">
                                    <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <input
                                        required
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="Mohamed Ali"
                                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl pl-12 pr-4 py-3.5 text-sm font-bold focus:bg-white focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none transition-all"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <input
                                        required
                                        type="email"
                                        value={formData.email}
                                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                                        placeholder="ali@suumapay.com"
                                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl pl-12 pr-4 py-3.5 text-sm font-bold focus:bg-white focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none transition-all"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Initial Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <input
                                        required
                                        type="password"
                                        value={formData.password}
                                        onChange={e => setFormData({ ...formData, password: e.target.value })}
                                        placeholder="••••••••"
                                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl pl-12 pr-4 py-3.5 text-sm font-bold focus:bg-white focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none transition-all"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">User Role</label>
                                <select
                                    value={formData.role}
                                    onChange={e => setFormData({ ...formData, role: e.target.value as any })}
                                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3.5 text-sm font-bold focus:bg-white focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none transition-all"
                                >
                                    <option value="staff">Staff Member</option>
                                    <option value="admin">Platform Admin</option>
                                </select>
                            </div>

                            <button
                                type="submit"
                                disabled={addingUser}
                                className="w-full bg-orange-600 text-white py-4 rounded-2xl text-sm font-black flex items-center justify-center gap-3 hover:bg-orange-700 disabled:opacity-50 mt-4 shadow-xl shadow-orange-600/20 active:scale-95 transition-all"
                            >
                                {addingUser ? <Loader2 className="h-5 w-5 animate-spin" /> : <UserCheck className="h-5 w-5" />}
                                Diwaangeli User-ka
                            </button>
                        </form>
                    </div>
                </div>
            )}

            <div className="bg-white rounded-[2rem] border border-orange-50 shadow-2xl shadow-orange-500/5 overflow-hidden">
                <div className="flex items-center justify-between px-8 py-6 border-b border-orange-50 bg-orange-50/20">
                    <h3 className="text-sm font-black text-gray-900 flex items-center gap-2">
                        <UserCheck className="h-4 w-4 text-orange-600" />
                        Directory-ga Shaqaalaha
                    </h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50/50">
                            <tr>
                                <th className="px-8 py-4 text-left font-black text-gray-400 uppercase tracking-widest text-[10px]">Information</th>
                                <th className="px-8 py-4 text-left font-black text-gray-400 uppercase tracking-widest text-[10px]">Email Address</th>
                                <th className="px-8 py-4 text-left font-black text-gray-400 uppercase tracking-widest text-[10px]">Authority level</th>
                                <th className="px-8 py-4 text-right font-black text-gray-400 uppercase tracking-widest text-[10px]">Change Role</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-orange-50">
                            {users.map((user) => (
                                <tr key={user.id} className="hover:bg-orange-50/30 transition-colors">
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-10 rounded-2xl bg-orange-100 flex items-center justify-center shadow-inner">
                                                <UserIcon className="h-4 w-4 text-orange-600" />
                                            </div>
                                            <span className="font-extrabold text-gray-900">{user.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 font-bold text-gray-500">{user.email}</td>
                                    <td className="px-8 py-5">
                                        <span className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1 text-xs font-black uppercase tracking-wider ${user.role === 'admin'
                                            ? 'bg-orange-100 text-orange-600 border border-orange-200'
                                            : 'bg-gray-100 text-gray-500 border border-gray-200'
                                            }`}>
                                            {user.role === 'admin' ? <Shield className="h-3 w-3" /> : <UserIcon className="h-3 w-3" />}
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                        <button
                                            onClick={() => toggleRole(user.id, user.role)}
                                            disabled={user.id === currentUser?.id}
                                            className={`text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl transition-all border-2 active:scale-95 ${user.role === 'admin'
                                                ? 'border-orange-100 text-orange-600 hover:bg-orange-600 hover:text-white hover:border-orange-600'
                                                : 'border-gray-100 text-gray-400 hover:bg-gray-900 hover:text-white hover:border-gray-900'
                                                } disabled:opacity-30 disabled:pointer-events-none`}
                                        >
                                            {user.role === 'admin' ? "Demote" : "Promote to Admin"}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="bg-orange-600 rounded-[2rem] p-8 text-white relative overflow-hidden shadow-2xl shadow-orange-600/30">
                <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-white/10 blur-3xl rounded-full" />
                <div className="relative z-10 flex items-start gap-6">
                    <div className="bg-white/20 p-4 rounded-3xl backdrop-blur-md border border-white/20">
                        <ShieldAlert className="h-8 w-8 text-white" />
                    </div>
                    <div>
                        <p className="text-xl font-black tracking-tight">Security Protocol</p>
                        <p className="text-white/80 font-medium mt-2 leading-relaxed max-w-2xl">
                            Maamulka isticmaalaasha waa qeybta ugu muhiimsan amniga system-ka. Hubi in qof kasta oo aad ku darayso aad aqoonsan tahay. Admin-ka cusub wuxuu heli doonaa dhammaan awoodaha system-ka oo ay ku jirto inuu kuwa kale tirtiri karo.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
