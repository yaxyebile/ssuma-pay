"use client"

import { useState } from "react"
import { useApp } from "@/lib/app-context"
import {
    CreditCard, Plus, Calendar, DollarSign,
    CheckCircle2, Clock, AlertCircle, TrendingUp,
    Building2, Tag, ArrowRight, Wallet, MessageSquare, Phone, Send, Zap
} from "lucide-react"

export function BillingView() {
    const { billings, addBilling, updateBillingStatus, sendSMS } = useApp()
    const [showAddForm, setShowAddForm] = useState(false)

    const [newBill, setNewBill] = useState({
        companyName: "",
        amount: 0,
        dueDay: 1,
        category: "Utilities",
        status: "unpaid" as const,
        reminderPhone: "+252",
        reminderMessage: "Fadlan bixi biilkaaga bishaan."
    })

    const totalDue = billings
        .filter(b => b.status !== "paid")
        .reduce((sum, b) => sum + b.amount, 0)

    const paidCount = billings.filter(b => b.status === "paid").length
    const upcomingCount = billings.filter(b => b.status === "unpaid").length

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        // Prefix the company name to the message as requested
        const formattedMessage = `[${newBill.companyName}] ${newBill.reminderMessage}`
        const success = await addBilling({
            ...newBill,
            reminderMessage: formattedMessage
        })
        if (success) {
            setShowAddForm(false)
            setNewBill({
                companyName: "", amount: 0, dueDay: 1, category: "Utilities", status: "unpaid",
                reminderPhone: "+252", reminderMessage: "Fadlan bixi biilkaaga bishaan."
            })
        }
    }

    const handleSendReminder = async (bill: any) => {
        await sendSMS(bill.reminderPhone, bill.reminderMessage)
    }

    return (
        <div className="flex flex-col gap-10 animate-in fade-in slide-in-from-bottom-10 duration-1000 ease-out">
            {/* Header Section */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="space-y-2">
                    <div className="flex items-center gap-2 px-3 py-1 bg-orange-600 text-white rounded-full w-fit shadow-lg shadow-orange-600/20">
                        <Zap className="h-3 w-3 fill-current" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Recurring Intelligence</span>
                    </div>
                    <h2 className="text-5xl font-black text-gray-900 tracking-tighter leading-none italic">
                        Monthly <span className="text-orange-600">Billings</span>
                    </h2>
                    <p className="text-gray-400 font-bold tracking-tight">Recurring payments with automatic monthly reset and SMS alerts.</p>
                </div>

                <button
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="flex items-center gap-3 bg-gray-900 text-white px-8 py-4 rounded-3xl font-black hover:bg-orange-600 transition-all duration-500 shadow-2xl shadow-gray-950/20 hover:scale-[1.05]"
                >
                    {showAddForm ? <Clock className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
                    {showAddForm ? "View All Nodes" : "Register Billing"}
                </button>
            </div>

            {!showAddForm ? (
                <>
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="bg-white p-10 rounded-[3.5rem] border border-orange-50 shadow-2xl shadow-orange-500/5 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-150 transition-transform duration-700"><DollarSign className="h-12 w-12" /></div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Expected Monthly Flow</p>
                            <p className="text-4xl font-black text-gray-900 mt-2 tracking-tight">${totalDue.toLocaleString()}</p>
                            <div className="mt-4 flex items-center gap-2 text-red-500 text-xs font-black">
                                <AlertCircle className="h-3 w-3" />
                                <span>{upcomingCount} bills pending for {new Date().toLocaleDateString('en-US', { month: 'long' })}</span>
                            </div>
                        </div>

                        <div className="bg-white p-10 rounded-[3.5rem] border border-orange-50 shadow-2xl shadow-orange-500/5 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-150 transition-transform duration-700"><CheckCircle2 className="h-12 w-12" /></div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Settled This Cycle</p>
                            <p className="text-4xl font-black text-gray-900 mt-2 tracking-tight">{paidCount}</p>
                            <div className="mt-4 flex items-center gap-2 text-green-500 text-xs font-black">
                                <TrendingUp className="h-3 w-3" />
                                <span>Reset occurs every 1st of month</span>
                            </div>
                        </div>

                        <div className="bg-orange-600 p-10 rounded-[3.5rem] text-white shadow-2xl shadow-orange-600/20 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-8 opacity-20 group-hover:scale-150 transition-transform duration-700"><MessageSquare className="h-12 w-12" /></div>
                            <p className="text-[10px] font-black text-white/60 uppercase tracking-widest">Active SMS Gate</p>
                            <p className="text-4xl font-black mt-2 tracking-tight italic">Xaliye6 API</p>
                            <p className="mt-4 text-xs font-bold text-white/80">Automated reminders enabled</p>
                        </div>
                    </div>

                    {/* Billings Table/Grid */}
                    <div className="bg-white rounded-[4rem] border border-orange-50 shadow-2xl shadow-orange-500/5 overflow-hidden">
                        <div className="p-10 border-b border-orange-50 flex items-center justify-between">
                            <div>
                                <h3 className="text-2xl font-black text-gray-900 tracking-tighter">Commitment Pipeline</h3>
                                <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mt-1">Monthly recurring nodes</p>
                            </div>
                            <div className="flex gap-2">
                                <span className="px-4 py-2 bg-orange-50 text-orange-600 rounded-full text-[10px] font-black uppercase tracking-widest">Active Nodes: {billings.length}</span>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-gray-50/50">
                                        <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Partner</th>
                                        <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Amount</th>
                                        <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Monthly Day</th>
                                        <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Status</th>
                                        <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Contact Node</th>
                                        <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-orange-50/50 font-bold">
                                    {billings.map((bill) => (
                                        <tr key={bill.id} className="hover:bg-orange-50/10 transition-colors group">
                                            <td className="px-10 py-8">
                                                <div className="flex items-center gap-4">
                                                    <div className="h-12 w-12 bg-white border border-orange-100 rounded-2xl flex items-center justify-center text-orange-600 shadow-sm group-hover:scale-110 transition-transform">
                                                        <Building2 className="h-6 w-6" />
                                                    </div>
                                                    <div>
                                                        <p className="text-gray-900 text-lg tracking-tight">{bill.companyName}</p>
                                                        <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-1">{bill.category}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-10 py-8 text-xl text-gray-900 tracking-tighter">${bill.amount.toLocaleString()}</td>
                                            <td className="px-10 py-8">
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="h-4 w-4 text-orange-600" />
                                                    <span className="text-gray-500 font-black">Day {bill.dueDay}</span>
                                                </div>
                                            </td>
                                            <td className="px-10 py-8">
                                                <div className="flex items-center gap-2">
                                                    <span className={`h-2 w-2 rounded-full ${bill.status === 'paid' ? 'bg-green-500' :
                                                        bill.status === 'pending' ? 'bg-orange-500' : 'bg-red-500 animate-pulse'
                                                        }`} />
                                                    <span className={`uppercase text-[10px] tracking-widest ${bill.status === 'paid' ? 'text-green-500' :
                                                        bill.status === 'pending' ? 'text-orange-500' : 'text-red-500'
                                                        }`}>
                                                        {bill.status === 'paid' ? 'Settled' : 'Outstanding'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-10 py-8">
                                                <p className="text-gray-900 text-sm font-black">{bill.reminderPhone}</p>
                                                <p className="text-[10px] text-gray-400 truncate max-w-[150px] font-bold">{bill.reminderMessage}</p>
                                            </td>
                                            <td className="px-10 py-8 text-right">
                                                <div className="flex items-center justify-end gap-3">
                                                    <button
                                                        onClick={() => handleSendReminder(bill)}
                                                        title="Send SMS Reminder"
                                                        className="p-3 bg-white border border-gray-100 rounded-3xl text-gray-400 hover:text-orange-600 hover:border-orange-100 hover:bg-orange-50 transition-all shadow-sm"
                                                    >
                                                        <Send className="h-5 w-5" />
                                                    </button>

                                                    {bill.status !== "paid" ? (
                                                        <button
                                                            onClick={() => updateBillingStatus(bill.id, "paid")}
                                                            title="Mark as Settled"
                                                            className="p-3 bg-white border border-gray-100 rounded-3xl text-gray-400 hover:text-green-500 hover:border-green-100 hover:bg-green-50 transition-all shadow-sm"
                                                        >
                                                            <CheckCircle2 className="h-5 w-5" />
                                                        </button>
                                                    ) : (
                                                        <div className="h-11 flex items-center px-6 bg-green-50 rounded-3xl text-green-500 text-[10px] uppercase font-black tracking-widest gap-2">
                                                            <CheckCircle2 className="h-4 w-4" />
                                                            Settled
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Payment History Report */}
                    <div className="bg-white rounded-[4rem] border border-orange-50 shadow-2xl shadow-orange-500/5 overflow-hidden">
                        <div className="p-10 border-b border-orange-50 bg-gray-900 text-white">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-2xl font-black tracking-tighter italic">Payment Intelligence Report</h3>
                                    <p className="text-sm font-bold text-white/50 uppercase tracking-widest mt-1">Audit log of all settled nodes</p>
                                </div>
                                <div className="h-14 w-14 bg-orange-600 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-600/30">
                                    <TrendingUp className="h-7 w-7" />
                                </div>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-gray-50/50">
                                        <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Partner</th>
                                        <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Settled Amount</th>
                                        <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Cycle Month</th>
                                        <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Timestamp</th>
                                        <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-orange-50/50">
                                    {billings.filter(b => b.paidAt).sort((a, b) => new Date(b.paidAt!).getTime() - new Date(a.paidAt!).getTime()).map((bill) => (
                                        <tr key={`report-${bill.id}`} className="hover:bg-orange-50/5 transition-colors group">
                                            <td className="px-10 py-8">
                                                <p className="text-gray-900 font-black text-lg">{bill.companyName}</p>
                                                <p className="text-[10px] text-gray-400 uppercase font-bold">{bill.category}</p>
                                            </td>
                                            <td className="px-10 py-8">
                                                <span className="text-xl font-black text-gray-900 italic">${bill.amount.toLocaleString()}</span>
                                            </td>
                                            <td className="px-10 py-8">
                                                <span className="px-4 py-2 bg-orange-50 text-orange-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-orange-100">
                                                    {bill.lastPaidMonth}
                                                </span>
                                            </td>
                                            <td className="px-10 py-8">
                                                <div className="space-y-1">
                                                    <p className="text-gray-900 font-bold">{new Date(bill.paidAt!).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                                                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">{new Date(bill.paidAt!).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                                </div>
                                            </td>
                                            <td className="px-10 py-8 text-right">
                                                <div className="flex items-center justify-end gap-2 text-green-500 font-black italic text-xs uppercase tracking-tighter">
                                                    <CheckCircle2 className="h-4 w-4" />
                                                    Authenticated
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {billings.filter(b => b.paidAt).length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="px-10 py-20 text-center text-gray-400 font-bold italic">
                                                No payment history available in the current intelligence cycle.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            ) : (
                /* Add Form Section */
                <div className="bg-white p-10 lg:p-20 rounded-[4rem] border border-orange-50 shadow-2xl shadow-orange-500/5 max-w-5xl mx-auto w-full">
                    <div className="mb-12 text-center">
                        <h3 className="text-4xl font-black text-gray-900 tracking-tighter italic">Register Recurring Node</h3>
                        <p className="text-gray-400 font-bold mt-2">Initialize a monthly recurring payment cycle with SMS alert triggers.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-6">Company Identity</label>
                                <div className="relative">
                                    <Building2 className="absolute left-8 top-1/2 -translate-y-1/2 h-5 w-5 text-orange-600" />
                                    <input
                                        type="text"
                                        required
                                        placeholder="EX: Hormuud Telecom"
                                        className="w-full bg-gray-50 border-transparent focus:border-orange-600 focus:ring-0 rounded-[2.5rem] py-6 px-16 font-bold text-gray-900 transition-all"
                                        value={newBill.companyName}
                                        onChange={e => setNewBill({ ...newBill, companyName: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-6">Monthly Amount ($)</label>
                                <div className="relative">
                                    <DollarSign className="absolute left-8 top-1/2 -translate-y-1/2 h-5 w-5 text-orange-600" />
                                    <input
                                        type="number"
                                        required
                                        placeholder="0.00"
                                        className="w-full bg-gray-50 border-transparent focus:border-orange-600 focus:ring-0 rounded-[2.5rem] py-6 px-16 font-bold text-gray-900 transition-all"
                                        value={newBill.amount}
                                        onChange={e => setNewBill({ ...newBill, amount: parseFloat(e.target.value) })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-6">Payment Cycle Day (1-31)</label>
                                <div className="relative">
                                    <Calendar className="absolute left-8 top-1/2 -translate-y-1/2 h-5 w-5 text-orange-600" />
                                    <input
                                        type="number"
                                        min="1"
                                        max="31"
                                        required
                                        placeholder="1"
                                        className="w-full bg-gray-50 border-transparent focus:border-orange-600 focus:ring-0 rounded-[2.5rem] py-6 px-16 font-bold text-gray-900 transition-all"
                                        value={newBill.dueDay}
                                        onChange={e => setNewBill({ ...newBill, dueDay: parseInt(e.target.value) })}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-6">Reminder Mobile Node</label>
                                <div className="relative">
                                    <Phone className="absolute left-8 top-1/2 -translate-y-1/2 h-5 w-5 text-orange-600" />
                                    <input
                                        type="text"
                                        required
                                        placeholder="+252..."
                                        className="w-full bg-gray-50 border-transparent focus:border-orange-600 focus:ring-0 rounded-[2.5rem] py-6 px-16 font-bold text-gray-900 transition-all"
                                        value={newBill.reminderPhone}
                                        onChange={e => setNewBill({ ...newBill, reminderPhone: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-6">Reminder Payload (Auto-Prefixed)</label>
                                <div className="relative">
                                    <MessageSquare className="absolute left-8 top-10 h-5 w-5 text-orange-600" />
                                    <textarea
                                        required
                                        rows={4}
                                        placeholder="Message content..."
                                        className="w-full bg-gray-50 border-transparent focus:border-orange-600 focus:ring-0 rounded-[2.5rem] py-8 px-16 font-bold text-gray-900 transition-all resize-none"
                                        value={newBill.reminderMessage}
                                        onChange={e => setNewBill({ ...newBill, reminderMessage: e.target.value })}
                                    />
                                </div>
                                <div className="bg-orange-50 p-4 rounded-2xl border border-orange-100">
                                    <p className="text-[9px] font-black text-orange-600 uppercase tracking-widest mb-1">Final SMS Payload Preview:</p>
                                    <p className="text-[11px] text-gray-600 font-bold italic leading-tight">
                                        [{newBill.companyName || 'Vendor'}] {newBill.reminderMessage}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="md:col-span-2 pt-10">
                            <button
                                type="submit"
                                className="w-full bg-gray-900 text-white py-8 rounded-[3rem] font-black text-2xl italic hover:bg-orange-600 transition-all duration-500 shadow-2xl shadow-gray-950/20 active:scale-[0.98] flex items-center justify-center gap-4"
                            >
                                <Zap className="h-6 w-6 fill-current" />
                                INITIALIZE RECURRING NODE
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    )
}
