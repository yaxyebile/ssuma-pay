"use client"

import { useApp } from "@/lib/app-context"
import {
  BarChart2,
  TrendingUp,
  CheckCircle2,
  Calendar,
  DollarSign,
  Zap,
  Download,
  Filter,
  FileText
} from "lucide-react"

export function ReportsView() {
  const { billings } = useApp()

  const paidBillings = billings.filter(b => b.paidAt).sort((a, b) => new Date(b.paidAt!).getTime() - new Date(a.paidAt!).getTime())
  const totalPaid = paidBillings.reduce((sum, b) => sum + b.amount, 0)
  const totalUnpaid = billings.filter(b => b.status !== "paid").reduce((sum, b) => sum + b.amount, 0)

  return (
    <div className="flex flex-col gap-10 animate-in fade-in slide-in-from-bottom-10 duration-1000 ease-out">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 px-3 py-1 bg-orange-600 text-white rounded-full w-fit shadow-lg shadow-orange-600/20">
            <BarChart2 className="h-3 w-3 fill-current" />
            <span className="text-[10px] font-black uppercase tracking-widest">Financial Intelligence</span>
          </div>
          <h2 className="text-5xl font-black text-gray-900 tracking-tighter leading-none italic">
            Settlement <span className="text-orange-600">Audit Logs</span>
          </h2>
          <p className="text-gray-400 font-bold tracking-tight">Comprehensive report of all billing cycles and payment confirmations.</p>
        </div>

        <div className="flex gap-4">
          <button className="flex items-center gap-3 bg-white border border-orange-100 text-gray-600 px-8 py-4 rounded-[2rem] font-black hover:bg-orange-50 transition-all duration-500 shadow-xl shadow-orange-500/5">
            <Download className="h-5 w-5" />
            Export Audit
          </button>
        </div>
      </div>

      {/* Analytics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div className="bg-white p-10 rounded-[3.5rem] border border-orange-50 shadow-2xl shadow-orange-500/5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-150 transition-transform duration-700 font-black text-9xl italic">
            $
          </div>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Settled Lifecycle</p>
          <p className="text-4xl font-black text-gray-900 mt-2 tracking-tight">${totalPaid.toLocaleString()}</p>
          <div className="mt-4 flex items-center gap-2 text-green-500 text-xs font-black">
            <TrendingUp className="h-3 w-3" />
            <span>Success rate: 100%</span>
          </div>
        </div>

        <div className="bg-white p-10 rounded-[3.5rem] border border-orange-50 shadow-2xl shadow-orange-500/5 relative overflow-hidden group">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Pending Liability</p>
          <p className="text-4xl font-black text-gray-900 mt-2 tracking-tight">${totalUnpaid.toLocaleString()}</p>
          <div className="mt-4 flex items-center gap-2 text-orange-600 text-xs font-black">
            <Calendar className="h-3 w-3" />
            <span>Due for current cycle</span>
          </div>
        </div>

        <div className="bg-gray-900 p-10 rounded-[3.5rem] text-white shadow-2xl shadow-gray-900/20 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-20 group-hover:scale-150 transition-transform duration-700"><Zap className="h-12 w-12 text-orange-600 fill-current" /></div>
          <p className="text-[10px] font-black text-white/50 uppercase tracking-widest">Audit Status</p>
          <p className="text-4xl font-black mt-2 tracking-tight italic">Verified</p>
          <p className="mt-4 text-xs font-bold text-white/60">System identity confirmed via Suuma Intelligence.</p>
        </div>
      </div>

      {/* Active Pipeline Section */}
      <div className="bg-white rounded-[4rem] border border-orange-50 shadow-2xl shadow-orange-500/5 overflow-hidden">
        <div className="p-10 border-b border-orange-50 flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-black text-gray-900 tracking-tighter italic">Active Monthly Pipeline</h3>
            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mt-1">Nodes scheduled for settlement</p>
          </div>
          <div className="flex gap-2">
            <span className="px-4 py-2 bg-orange-50 text-orange-600 rounded-full text-[10px] font-black uppercase tracking-widest">Ongoing: {billings.filter(b => b.status !== 'paid').length}</span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 text-gray-400">
                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em]">Partner Node</th>
                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em]">Monthly Amount</th>
                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em]">Day</th>
                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em]">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-orange-50/50">
              {billings.filter(b => b.status !== 'paid').map((bill) => (
                <tr key={`active-${bill.id}`} className="hover:bg-orange-50/5 transition-colors group">
                  <td className="px-10 py-8">
                    <p className="text-gray-900 font-black text-lg tracking-tight">{bill.companyName}</p>
                    <p className="text-[10px] text-gray-400 uppercase font-black">{bill.category}</p>
                  </td>
                  <td className="px-10 py-8">
                    <span className="text-xl font-black text-gray-900 italic tracking-tighter">${bill.amount.toLocaleString()}</span>
                  </td>
                  <td className="px-10 py-8">
                    <span className="text-gray-500 font-black">Day {bill.dueDay}</span>
                  </td>
                  <td className="px-10 py-8">
                    <div className="flex items-center gap-2">
                      <span className={`h-2 w-2 rounded-full ${bill.status === 'pending' ? 'bg-orange-500' : 'bg-red-500 animate-pulse'}`} />
                      <span className={`uppercase text-[10px] font-black tracking-widest ${bill.status === 'pending' ? 'text-orange-500' : 'text-red-500'}`}>
                        {bill.status}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
              {billings.filter(b => b.status !== 'paid').length === 0 && (
                <tr>
                  <td colSpan={4} className="px-10 py-10 text-center text-gray-400 font-bold italic">
                    All monthly nodes have been settled for this cycle.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Main Report Table (History) */}
      <div className="bg-white rounded-[4rem] border border-orange-50 shadow-2xl shadow-orange-500/5 overflow-hidden">
        <div className="p-10 border-b border-orange-50 flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-black text-gray-900 tracking-tighter italic">Payment Intelligence History</h3>
            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mt-1">Immutable record of corporate payments</p>
          </div>
          <div className="flex gap-4">
            <div className="flex items-center gap-2 px-6 py-3 bg-gray-50 rounded-2xl border border-gray-100">
              <Filter className="h-4 w-4 text-gray-400" />
              <span className="text-[10px] font-black uppercase text-gray-400">Filter Matrix</span>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 text-gray-400">
                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em]">Partner Node</th>
                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em]">Payment Volume</th>
                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em]">Billing Cycle</th>
                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em]">Audit Timestamp</th>
                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-right">Certificate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-orange-50/50">
              {paidBillings.map((bill) => (
                <tr key={`full-report-${bill.id}`} className="hover:bg-orange-50/5 transition-colors group">
                  <td className="px-10 py-8">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 bg-white border border-gray-100 rounded-2xl flex items-center justify-center text-gray-400 group-hover:scale-110 transition-transform">
                        <FileText className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="text-gray-900 font-black text-lg tracking-tight">{bill.companyName}</p>
                        <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest">{bill.category}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-8">
                    <span className="text-xl font-black text-gray-900 italic tracking-tighter">${bill.amount.toLocaleString()}</span>
                  </td>
                  <td className="px-10 py-8">
                    <span className="px-4 py-2 bg-orange-50 text-orange-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-orange-100">
                      Cycle {bill.lastPaidMonth}
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
                      Verified
                    </div>
                  </td>
                </tr>
              ))}
              {paidBillings.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-10 py-32 text-center">
                    <div className="flex flex-col items-center gap-4 text-gray-300">
                      <BarChart2 className="h-16 w-16 opacity-20" />
                      <div>
                        <p className="text-xl font-black italic tracking-tight">Zero Audit Data Captured</p>
                        <p className="text-sm font-bold opacity-60">Settle your first billing node to generate intelligence reports.</p>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
