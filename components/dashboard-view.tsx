"use client"

import { useApp } from "@/lib/app-context"
import {
  TrendingUp, Users, CreditCard, ArrowUpRight,
  ArrowDownRight, Activity, Plus, Layers, Zap,
  Globe, ShieldCheck
} from "lucide-react"
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from 'recharts'

export function DashboardView() {
  const { settlements, currentUser } = useApp()

  const totalVolume = settlements.reduce((sum, s) => sum + s.amount, 0)
  const pendingAmount = settlements.filter(s => s.status === 'Pending').reduce((sum, s) => sum + s.amount, 0)
  const completedCount = settlements.filter(s => s.status === 'Completed').length

  const chartData = [
    { name: 'Mon', value: 4000 }, { name: 'Tue', value: 3000 },
    { name: 'Wed', value: 6000 }, { name: 'Thu', value: 4500 },
    { name: 'Fri', value: 9000 }, { name: 'Sat', value: 7000 },
    { name: 'Sun', value: 8500 },
  ]

  return (
    <div className="flex flex-col gap-10 animate-in fade-in slide-in-from-bottom-10 duration-1000 ease-out">
      {/* Premium Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 px-3 py-1 bg-orange-600 text-white rounded-full w-fit shadow-lg shadow-orange-600/20">
            <Zap className="h-3 w-3 fill-current" />
            <span className="text-[10px] font-black uppercase tracking-widest">System Operational</span>
          </div>
          <h2 className="text-5xl font-black text-gray-900 tracking-tighter leading-none italic">
            Welcome back, <span className="text-orange-600 underline underline-offset-8 decoration-orange-100">{currentUser?.name?.split(' ')[0]}</span>
          </h2>
          <p className="text-gray-400 font-bold tracking-tight">Your real-time financial overview at Suuma Pay Intelligence Hub.</p>
        </div>
        <div className="flex items-center gap-4 bg-white/50 backdrop-blur-md p-3 rounded-[2.5rem] border border-orange-50 shadow-xl">
          <div className="h-12 w-12 bg-orange-600 rounded-2xl flex items-center justify-center text-white shadow-lg"><Globe className="h-6 w-6" /></div>
          <div className="pr-4 border-r border-orange-100">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Global Node</p>
            <p className="text-sm font-black text-gray-900">Mogadishu, SO</p>
          </div>
          <div className="pl-2">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Uptime</p>
            <p className="text-sm font-black text-green-500">99.98%</p>
          </div>
        </div>
      </div>

      {/* Extreme Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[
          { label: "Net Settlement Volume", value: `$${totalVolume.toLocaleString()}`, icon: <TrendingUp className="h-8 w-8" />, color: "bg-orange-600", note: "12% increase from May" },
          { label: "Pending Liquid Assets", value: `$${pendingAmount.toLocaleString()}`, icon: <Activity className="h-8 w-8" />, color: "bg-gray-900", note: "Awaiting approval" },
          { label: "Verified Transfers", value: completedCount.toString(), icon: <ShieldCheck className="h-8 w-8" />, color: "bg-orange-400", note: "System verified" },
        ].map((stat, i) => (
          <div key={stat.label} className="group relative bg-white p-10 rounded-[3.5rem] border border-orange-50 shadow-2xl shadow-orange-500/5 hover:scale-[1.03] transition-all duration-500 overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-150 transition-transform duration-700">{stat.icon}</div>
            <div className={`h-16 w-16 ${stat.color} rounded-3xl flex items-center justify-center text-white mb-8 shadow-2xl shadow-orange-500/20`}>{stat.icon}</div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{stat.label}</p>
            <p className="text-4xl font-black text-gray-900 mt-2 tracking-tight">{stat.value}</p>
            <p className="mt-4 text-xs font-bold text-gray-400 flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-ping" />
              {stat.note}
            </p>
          </div>
        ))}
      </div>

      {/* Main Analysis Area */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 bg-white p-10 rounded-[4rem] border border-orange-50 shadow-2xl shadow-orange-500/5">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h3 className="text-2xl font-black text-gray-900 tracking-tighter">Velocity Analytics</h3>
              <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mt-1">Settlement Flow Monitoring</p>
            </div>
            <div className="h-10 w-10 bg-orange-50 rounded-full flex items-center justify-center text-orange-600"><Layers className="h-5 w-5" /></div>
          </div>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="glow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F15A24" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#F15A24" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="10 10" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 12, fontWeight: '900' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 12, fontWeight: '900' }} tickFormatter={(v) => `$${v / 1000}k`} />
                <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderRadius: '24px', border: 'none', color: '#FFF', boxShadow: '0 25px 50px -12px rgb(241 90 36 / 0.5)' }} />
                <Area type="monotone" dataKey="value" stroke="#F15A24" strokeWidth={6} fillOpacity={1} fill="url(#glow)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="flex flex-col gap-8">
          <div className="bg-orange-600 p-10 rounded-[4rem] text-white shadow-2xl shadow-orange-600/30 flex-1 relative overflow-hidden group">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
            <div className="relative z-10 flex flex-col h-full justify-between">
              <div className="flex justify-between items-start">
                <div className="h-14 w-14 bg-white/20 rounded-3xl flex items-center justify-center backdrop-blur-md border border-white/20"><Zap className="h-8 w-8" /></div>
                <ArrowUpRight className="h-8 w-8 text-white/40 group-hover:text-white transition-all duration-500" />
              </div>
              <div>
                <p className="text-5xl font-black tracking-tighter italic">Suuma <br />Pay Plus+</p>
                <p className="mt-4 text-sm font-bold text-white/70 leading-relaxed max-w-[200px]">Next-generation settlement protocols for the African market.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
