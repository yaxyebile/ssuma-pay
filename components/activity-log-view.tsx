"use client"

import { useApp } from "@/lib/app-context"
import {
  Activity,
  User as UserIcon,
  Clock,
  Search,
  Trash2,
  AlertTriangle,
  History,
  Terminal,
  Zap
} from "lucide-react"

export function ActivityLogView() {
  const { logs } = useApp()

  return (
    <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">System Activity</h2>
          <p className="text-gray-500 font-medium mt-1">La soco dhamaan dhaqdhaqaaqa ka dhaca Suuma Pay.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-orange-50 text-orange-600 rounded-xl border border-orange-100 font-black text-[10px] uppercase tracking-widest">
          <Zap className="h-3 w-3 animate-pulse" />
          Live Monitoring enabled
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Statistics Columns */}
        <div className="flex flex-col gap-6">
          <div className="bg-white p-6 rounded-[2rem] border border-orange-50 shadow-xl shadow-orange-500/5">
            <div className="h-10 w-10 bg-orange-100 rounded-xl flex items-center justify-center text-orange-600 mb-4">
              <History className="h-5 w-5" />
            </div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Events</p>
            <p className="text-2xl font-black text-gray-900 mt-1">{logs.length}</p>
          </div>
          <div className="bg-gray-900 p-6 rounded-[2rem] shadow-xl shadow-black/10">
            <div className="h-10 w-10 bg-white/10 rounded-xl flex items-center justify-center text-white mb-4">
              <Terminal className="h-5 w-5" />
            </div>
            <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">System Health</p>
            <p className="text-2xl font-black text-white mt-1">Optimal</p>
          </div>
        </div>

        {/* Timeline View */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-[2.5rem] border border-orange-50 shadow-2xl shadow-orange-500/5 overflow-hidden">
            <div className="px-8 py-6 border-b border-orange-50 flex items-center justify-between bg-orange-50/10">
              <div className="relative group w-full max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Filter by user or action..."
                  className="bg-transparent pl-10 pr-4 py-1 text-sm font-bold text-gray-900 outline-none w-full"
                />
              </div>
            </div>

            <div className="p-4 space-y-2">
              {logs.length === 0 ? (
                <div className="py-20 flex flex-col items-center justify-center text-gray-400 gap-4">
                  <Activity className="h-12 w-12 opacity-20" />
                  <p className="font-bold">Ma jirto xog weli oo la diwaangeliyey.</p>
                </div>
              ) : (
                logs.map((log, i) => (
                  <div
                    key={log.id}
                    className="group flex items-start gap-4 p-5 rounded-2xl hover:bg-orange-50/50 transition-all border-b border-orange-50 last:border-0"
                    style={{ animationDelay: `${i * 50}ms` }}
                  >
                    <div className="mt-1 relative">
                      <div className="h-10 w-10 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600 shadow-sm">
                        <UserIcon className="h-4 w-4" />
                      </div>
                      {i === 0 && <span className="absolute -top-1 -right-1 h-3 w-3 bg-green-500 border-2 border-white rounded-full animate-ping" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-black text-gray-900 tracking-tight">{log.userName}</span>
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter ${log.action.includes("Added") ? "bg-green-100 text-green-600" : "bg-orange-100 text-orange-600"
                          }`}>
                          {log.action}
                        </span>
                        <span className="text-gray-400 font-bold hidden sm:inline">-</span>
                        <span className="text-gray-600 font-bold truncate max-w-[150px]">{log.target}</span>
                      </div>
                      <div className="flex items-center gap-3 mt-1.5 text-[10px] text-gray-400 font-black uppercase tracking-widest">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(log.time).toLocaleTimeString()}
                        </span>
                        <span className="h-1 w-1 bg-gray-200 rounded-full" />
                        <span>{new Date(log.time).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <button className="opacity-0 group-hover:opacity-100 p-2 text-gray-300 hover:text-red-500 transition-all">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
