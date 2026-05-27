"use client"

import { useState } from "react"
import { useApp } from "@/lib/app-context"
import {
  Plus, Search, Filter, Download, Calendar, CreditCard,
  AlertCircle, X, Hash, Eye, LayoutGrid, List
} from "lucide-react"
import { toast } from "sonner"
import { type Settlement } from "@/lib/store"

export function SettlementsView() {
  const { settlements, addSettlement } = useApp()
  const [showAddForm, setShowAddForm] = useState(false)
  const [selectedSettlement, setSelectedSettlement] = useState<Settlement | null>(null)

  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("All")
  const [dateRange, setDateRange] = useState<string>("All")
  const [viewType, setViewType] = useState<"Table" | "Grid">("Table")

  const [formData, setFormData] = useState({
    settId: "", status: "pending" as any, accountId: "", amount: "", description: "", imageUrl: ""
  })

  const filteredSettlements = settlements.filter(s => {
    const matchesSearch = s.settId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.accountId?.toLowerCase().includes(searchTerm.toLowerCase());

    const sStatus = s.status?.toLowerCase() || ""
    const matchesStatus = statusFilter === "All" || sStatus === statusFilter.toLowerCase();

    const sDate = new Date(s.time);
    const now = new Date();
    let matchesDate = true;
    if (dateRange === "Today") matchesDate = sDate.toDateString() === now.toDateString();
    else if (dateRange === "Last 7 Days") {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(now.getDate() - 7);
      matchesDate = sDate >= sevenDaysAgo;
    }
    return matchesSearch && matchesStatus && matchesDate;
  })

  const handleExportExcel = () => {
    if (filteredSettlements.length === 0) return toast.error("No data!");
    const totalAmount = filteredSettlements.reduce((sum, s) => sum + s.amount, 0);
    let excelTemplate = `<html><body><table><tr><td>ID</td><td>ACCOUNT</td><td>AMOUNT</td><td>STATUS</td></tr>${filteredSettlements.map(s => `<tr><td>${s.settId}</td><td>${s.accountId}</td><td>$${s.amount}</td><td>${s.status}</td></tr>`).join('')}</table></body></html>`;
    const blob = new Blob([excelTemplate], { type: "application/vnd.ms-excel" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `Settlements.xls`;
    link.click();
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.settId || !formData.amount || !formData.accountId) {
      toast.error("Please fill all fields!")
      return
    }

    const success = await addSettlement({
      ...formData,
      amount: parseFloat(formData.amount)
    })

    if (success) {
      setShowAddForm(false)
      setFormData({ settId: "", status: "pending", accountId: "", amount: "", description: "", imageUrl: "" })
    }
  }

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-700">

      {/* Search & Action Bar */}
      <div className="flex flex-col gap-6 no-print bg-white/60 backdrop-blur-xl p-8 rounded-[2.5rem] border border-orange-100 shadow-xl shadow-orange-500/5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <h2 className="text-4xl font-black text-gray-900 tracking-tighter">Settlements</h2>
            <p className="text-gray-500 font-bold mt-1">Live tracking of your financial movements.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center bg-gray-100 p-1.5 rounded-2xl border border-gray-200">
              <button onClick={() => setViewType("Table")} className={`p-2.5 rounded-xl transition-all ${viewType === 'Table' ? 'bg-white shadow-md text-orange-600' : 'text-gray-400'}`}><List className="h-4 w-4" /></button>
              <button onClick={() => setViewType("Grid")} className={`p-2.5 rounded-xl transition-all ${viewType === 'Grid' ? 'bg-white shadow-md text-orange-600' : 'text-gray-400'}`}><LayoutGrid className="h-4 w-4" /></button>
            </div>
            <button onClick={handleExportExcel} className="p-3 bg-white text-orange-600 border border-orange-200 rounded-2xl hover:bg-orange-600 hover:text-white transition-all"><Download className="h-5 w-5" /></button>
            <button onClick={() => setShowAddForm(true)} className="flex items-center gap-2 bg-orange-600 text-white px-6 py-3.5 rounded-2xl font-black text-sm shadow-xl shadow-orange-600/20 active:scale-95 transition-all"><Plus className="h-5 w-5" />New Entry</button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-orange-50">
          <div className="relative"><Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" /><input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search..." className="w-full bg-white border border-gray-100 rounded-2xl pl-11 pr-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-orange-500/20" /></div>
          <div className="relative"><Filter className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" /><select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="w-full bg-white border border-gray-100 rounded-2xl pl-11 pr-4 py-3 text-sm font-bold appearance-none outline-none cursor-pointer"><option value="All">All Statuses</option><option value="completed">Completed</option><option value="pending">Pending</option><option value="failed">Failed</option></select></div>
          <div className="relative"><Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" /><select value={dateRange} onChange={e => setDateRange(e.target.value)} className="w-full bg-white border border-gray-100 rounded-2xl pl-11 pr-4 py-3 text-sm font-bold appearance-none outline-none cursor-pointer"><option value="All">All Time</option><option value="Today">Today</option><option value="Last 7 Days">Last 7 Days</option></select></div>
          <div className="bg-orange-600 rounded-2xl px-6 py-3 flex items-center justify-between text-white"><span className="text-xs font-bold opacity-80 uppercase">Total</span><span className="text-xl font-black">${filteredSettlements.reduce((sum, s) => sum + s.amount, 0).toLocaleString()}</span></div>
        </div>
      </div>

      {/* Table Results */}
      <div className="bg-white rounded-[2.5rem] border border-orange-50 shadow-2xl shadow-orange-500/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50/50 text-[10px] uppercase font-black text-gray-400 tracking-widest">
              <tr><th className="px-8 py-6">Reference</th><th className="px-8 py-6">Beneficiary</th><th className="px-8 py-6">Amount</th><th className="px-8 py-6">Status</th><th className="px-8 py-6"></th></tr>
            </thead>
            <tbody className="divide-y divide-orange-50 font-bold text-gray-700">
              {filteredSettlements.map((s) => (
                <tr key={s.id} onClick={() => setSelectedSettlement(s)} className="hover:bg-orange-50/30 transition-all group cursor-pointer">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      {s.imageUrl ? (
                        <div className="h-10 w-10 rounded-xl overflow-hidden border border-orange-100 shadow-sm">
                          <img src={s.imageUrl} alt="Receipt" className="h-full w-full object-cover" />
                        </div>
                      ) : (
                        <div className="h-10 w-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 group-hover:bg-orange-600 group-hover:text-white transition-all">
                          <Hash className="h-4 w-4" />
                        </div>
                      )}
                      <div>
                        <p className="text-gray-900">{s.settId}</p>
                        <p className="text-[10px] text-gray-400">{new Date(s.time).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">{s.accountId}</td>
                  <td className="px-8 py-6 text-lg font-black text-gray-900">${s.amount.toLocaleString()}</td>
                  <td className="px-8 py-6"><span className={`px-3 py-1 rounded-full text-[10px] uppercase tracking-widest border ${s.status?.toLowerCase() === 'completed' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-orange-50 text-orange-600 border-orange-100'}`}>{s.status}</span></td>
                  <td className="px-8 py-6 text-right"><button className="p-2 bg-gray-50 rounded-full text-gray-400 group-hover:bg-orange-600 group-hover:text-white transition-all"><Eye className="h-4 w-4" /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Entry Modal */}
      {showAddForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/40 backdrop-blur-md p-4">
          <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-2xl overflow-hidden border border-orange-100 animate-in zoom-in-95 duration-300">
            <div className="px-10 py-10 bg-orange-50/50 border-b border-orange-100 flex justify-between items-center">
              <h3 className="text-3xl font-black text-gray-900 tracking-tight">New Entry</h3>
              <button onClick={() => setShowAddForm(false)} className="h-10 w-10 bg-white rounded-xl border border-orange-100 flex items-center justify-center"><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-10 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-1"><label className="text-[10px] font-black text-gray-400">REFERENCE</label><input required value={formData.settId} onChange={e => setFormData({ ...formData, settId: e.target.value })} placeholder="ST-..." className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm font-black outline-none focus:bg-white focus:border-orange-500 transition-all" /></div>
              <div className="space-y-1"><label className="text-[10px] font-black text-gray-400">AMOUNT</label><input required type="number" step="0.01" value={formData.amount} onChange={e => setFormData({ ...formData, amount: e.target.value })} placeholder="0.00" className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm font-black outline-none focus:bg-white focus:border-orange-500 transition-all" /></div>
              <div className="space-y-1"><label className="text-[10px] font-black text-gray-400">ACCOUNT</label><input required value={formData.accountId} onChange={e => setFormData({ ...formData, accountId: e.target.value })} placeholder="AC..." className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm font-black outline-none focus:bg-white focus:border-orange-500 transition-all" /></div>
              <div className="space-y-1"><label className="text-[10px] font-black text-gray-400">STATUS</label><select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value as any })} className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm font-black outline-none focus:bg-white focus:border-orange-500 transition-all"><option value="pending">Pending</option><option value="completed">Completed</option><option value="failed">Failed</option></select></div>
              <div className="md:col-span-2 flex flex-col items-center justify-center space-y-4 py-6 border-b border-orange-50 mb-4">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Attachment Avatar</label>
                <div className="relative group">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0]
                      if (!file) return
                      const loadingToast = toast.loading("Optimizing high-res image...")
                      try {
                        const reader = new FileReader()
                        reader.onload = (event) => {
                          const img = new Image()
                          img.onload = () => {
                            const canvas = document.createElement('canvas')
                            let width = img.width
                            let height = img.height
                            const MAX_SIZE = 800 // Resize to 800px max
                            if (width > height && width > MAX_SIZE) {
                              height *= MAX_SIZE / width; width = MAX_SIZE
                            } else if (height > MAX_SIZE) {
                              width *= MAX_SIZE / height; height = MAX_SIZE
                            }
                            canvas.width = width
                            canvas.height = height
                            const ctx = canvas.getContext('2d')
                            ctx?.drawImage(img, 0, 0, width, height)
                            const optimizedData = canvas.toDataURL('image/jpeg', 0.6) // 60% quality JPEG
                            setFormData({ ...formData, imageUrl: optimizedData })
                            toast.success("Image optimized and ready")
                            toast.dismiss(loadingToast)
                          }
                          img.src = event.target?.result as string
                        }
                        reader.readAsDataURL(file)
                      } catch (err) {
                        toast.error("Optimization failed")
                        toast.dismiss(loadingToast)
                      }
                    }}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10 rounded-full"
                  />

                  {/* Avatar Circle */}
                  <div className={`h-36 w-36 rounded-full border-4 ${formData.imageUrl ? 'border-orange-500 shadow-2xl shadow-orange-500/20' : 'border-dashed border-gray-200'} bg-gray-50 flex items-center justify-center overflow-hidden transition-all duration-500 group-hover:scale-110 relative`}>
                    {formData.imageUrl ? (
                      <img src={formData.imageUrl} alt="Receipt Avatar" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-gray-400">
                        <Plus className="h-8 w-8" />
                        <span className="text-[10px] font-black tracking-widest uppercase">Select Receipt</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-orange-600/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-300">
                      <Plus className="h-10 w-10 text-white" />
                    </div>
                  </div>

                  {formData.imageUrl && (
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setFormData({ ...formData, imageUrl: "" }) }}
                      className="absolute bottom-1 right-1 z-20 bg-red-600 text-white rounded-full p-2 shadow-xl border-4 border-white hover:scale-110 transition-transform"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
                <p className="text-[10px] font-bold text-gray-400 italic">Square or Circle receipt capture recommended</p>
              </div>
              <div className="md:col-span-2 space-y-1"><label className="text-[10px] font-black text-gray-400">NOTES</label><textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} rows={2} className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm font-black outline-none focus:bg-white focus:border-orange-500 transition-all resize-none" /></div>
              <div className="md:col-span-2"><button type="submit" className="w-full bg-orange-600 text-white py-5 rounded-2xl font-black shadow-xl shadow-orange-600/20 active:scale-95 transition-all">Submit Settlement Entry</button></div>
            </form>
          </div>
        </div>
      )}

      {/* View Detail Modal */}
      {selectedSettlement && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/60 backdrop-blur-md p-4">
          <div className="bg-white rounded-[3.5rem] shadow-2xl w-full max-w-xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-10 border-b border-orange-50 flex justify-between items-center bg-orange-50/20">
              <div>
                <p className="text-[10px] font-black text-orange-600 uppercase tracking-widest">Settlement Detail</p>
                <h3 className="text-3xl font-black text-gray-900 tracking-tighter mt-1">{selectedSettlement.settId}</h3>
              </div>
              <button
                onClick={() => setSelectedSettlement(null)}
                className="h-12 w-12 bg-white rounded-2xl border border-orange-100 flex items-center justify-center text-gray-400 hover:text-orange-600 transition-all"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="p-10 space-y-8">
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Transaction Ref</p>
                  <p className="text-lg font-black text-gray-900 mt-1">{selectedSettlement.settId}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Amount</p>
                  <p className="text-2xl font-black text-orange-600 mt-1">${selectedSettlement.amount.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Beneficiary Account</p>
                  <p className="text-lg font-black text-gray-900 mt-1 uppercase italic">{selectedSettlement.accountId}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Status Node</p>
                  <div className="mt-2 text-sm font-black">
                    <span className={`px-4 py-2 rounded-full uppercase tracking-widest ${selectedSettlement.status?.toLowerCase() === 'completed' ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'
                      }`}>
                      {selectedSettlement.status}
                    </span>
                  </div>
                </div>
              </div>

              {selectedSettlement.imageUrl && (
                <div className="relative h-48 w-full rounded-3xl overflow-hidden border border-orange-100 shadow-inner group/img">
                  <img src={selectedSettlement.imageUrl} alt="Receipt" className="h-full w-full object-cover group-hover/img:scale-110 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6">
                    <button
                      onClick={() => window.open(selectedSettlement.imageUrl, '_blank')}
                      className="text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:underline focus:outline-none"
                    >
                      <Eye className="h-3 w-3" />
                      View Full Receipt
                    </button>
                  </div>
                </div>
              )}

              <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Notes & Metadata</p>
                <p className="text-sm font-bold text-gray-600 italic">
                  {selectedSettlement.description || "No additional notes provided for this transaction."}
                </p>
              </div>

              <div className="flex items-center gap-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] pt-4 border-t border-orange-50">
                <Calendar className="h-4 w-4 text-orange-600" />
                <span>Logged at: {new Date(selectedSettlement.time).toLocaleString()}</span>
              </div>
            </div>
            <div className="p-8 bg-gray-50/50">
              <button
                onClick={() => setSelectedSettlement(null)}
                className="w-full bg-gray-900 text-white py-5 rounded-[2rem] font-black text-sm uppercase tracking-widest shadow-xl shadow-gray-900/20 active:scale-95 transition-all"
              >
                Close Report View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
