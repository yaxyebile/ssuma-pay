"use client"

import { useState } from "react"
import { useApp } from "@/lib/app-context"
import {
  LayoutDashboard,
  List,
  Activity,
  BarChart2,
  LogOut,
  Menu,
  X,
  ChevronRight,
  User,
  Shield,
  Zap,
  CreditCard,
  Trophy,
  Plus,
  Users,
  Package,
  Monitor
} from "lucide-react"

type Page = "dashboard" | "settlements" | "activity" | "reports" | "users" | "admin" | "billing" | "active-matches" | "add-match" | "teams" | "orders" | "streams"

interface NavItem {
  id: Page
  label: string
  icon: React.ReactNode
  adminOnly?: boolean
}

const NAV_ITEMS: NavItem[] = [
  { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard className="h-5 w-5" /> },
  { id: "active-matches", label: "Active Matches", icon: <Trophy className="h-5 w-5" /> },
  { id: "add-match", label: "Add New Match", icon: <Plus className="h-5 w-5" /> },
  { id: "teams", label: "Teams Library", icon: <Users className="h-5 w-5" /> },
  { id: "settlements", label: "Settlements", icon: <List className="h-5 w-5" /> },
  { id: "activity", label: "Activity Log", icon: <Activity className="h-5 w-5" /> },
  { id: "reports", label: "Reports", icon: <BarChart2 className="h-5 w-5" /> },
  { id: "billing", label: "Monthly Billing", icon: <CreditCard className="h-5 w-5" /> },
  { id: "orders", label: "Api Orders", icon: <Package className="h-5 w-5" /> },
  { id: "streams", label: "Stream Monitor", icon: <Monitor className="h-5 w-5" /> },
  { id: "users", label: "Users", icon: <User className="h-5 w-5" />, adminOnly: true },
  { id: "admin", label: "Admin Panel", icon: <Shield className="h-5 w-5" />, adminOnly: true },
]

interface AppShellProps {
  children: (activePage: Page, setPage: (p: Page) => void) => React.ReactNode
}

export function AppShell({ children }: AppShellProps) {
  const { currentUser, logout } = useApp()
  const [activePage, setActivePage] = useState<Page>("dashboard")
  const [sidebarOpen, setSidebarOpen] = useState(false)

  function navigate(page: Page) {
    setActivePage(page)
    setSidebarOpen(false)
  }

  const pageTitles: Record<Page, string> = {
    dashboard: "Dashboard",
    settlements: "Settlements",
    activity: "Activity Log",
    reports: "Reports",
    users: "Users",
    admin: "Admin",
    billing: "Monthly Billings",
    "active-matches": "Scheduled Matches",
    "add-match": "Deploy New Match",
    teams: "Teams Database",
    orders: "Api Distribution Hub",
    streams: "Live Grid Intelligence",
  }

  return (
    <div className="flex h-screen bg-[#FDFDFD] overflow-hidden text-[#2D2D2D]">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm lg:hidden transition-all duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col bg-white border-r border-orange-100/50 shadow-2xl shadow-orange-500/5 transition-transform duration-500 cubic-bezier(0.4, 0, 0.2, 1) lg:static lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-6 py-6 border-b border-orange-50">
          <div className="flex items-center gap-3 group">
            <div className="relative h-12 w-12 overflow-hidden rounded-2xl bg-white transition-transform duration-300 group-hover:scale-110 shadow-lg shadow-orange-500/10 border border-orange-50">
              <img
                src="https://play-lh.googleusercontent.com/gyQiw0ujrVuIPh-G7CUvFGmYpEUGcdNhbN14beQ4F7bRXNgv-7K1-5mbhQjz1_m8V_k"
                alt="Suuma TV Logo"
                className="h-full w-full object-contain p-1"
              />
            </div>
            <div>
              <p className="text-lg font-black text-orange-600 tracking-tight leading-none uppercase">
                Suuma Pay
              </p>
              <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mt-1">
                Settlement Core
              </p>
            </div>
          </div>
          <button
            className="lg:hidden text-muted-foreground hover:text-orange-600 transition-colors"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-4 py-6 flex flex-col gap-2">
          {NAV_ITEMS.filter(item => !item.adminOnly || currentUser?.role === 'admin').map((item) => {
            const active = activePage === item.id
            return (
              <button
                key={item.id}
                onClick={() => navigate(item.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-300 group ${active
                  ? "bg-orange-600 text-white shadow-lg shadow-orange-600/20 translate-x-1"
                  : "text-muted-foreground hover:bg-orange-50 hover:text-orange-600"
                  }`}
              >
                <div className={`${active ? "text-white" : "text-muted-foreground group-hover:text-orange-600"} transition-colors`}>
                  {item.icon}
                </div>
                {item.label}
                {active && <ChevronRight className="ml-auto h-4 w-4 animate-pulse" />}
              </button>
            )
          })}
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-orange-50">
          <div className="bg-orange-50/50 rounded-2xl p-4 flex items-center gap-3 border border-orange-100">
            <div className="h-10 w-10 rounded-full bg-orange-600 flex items-center justify-center text-white font-bold shadow-md">
              {currentUser?.name?.[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-900 truncate">{currentUser?.name}</p>
              <p className="text-[10px] text-muted-foreground truncate uppercase tracking-wider">{currentUser?.role}</p>
            </div>
          </div>
          <button
            onClick={() => logout()}
            className="w-full mt-3 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold text-red-500 hover:bg-red-50 transition-all duration-300"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#F9FAFB] relative overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-orange-500/5 blur-[120px] rounded-full pointer-events-none" />

        <header className="h-20 flex items-center justify-between px-6 bg-white/70 backdrop-blur-xl border-b border-orange-50 z-20">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg bg-orange-50 text-orange-600"
            >
              <Menu className="h-6 w-6" />
            </button>
            <h1 className="text-xl font-black text-gray-900 tracking-tight animate-in fade-in slide-in-from-left-4 duration-500 flex items-center gap-2">
              <Zap className="h-5 w-5 text-orange-600" />
              {pageTitles[activePage]}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:block text-right">
              <p className="text-[10px] font-black text-orange-600 uppercase tracking-widest leading-none">Security Status</p>
              <p className="text-xs font-bold text-gray-400 mt-1 uppercase">Encrypted Session</p>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 lg:p-8 z-10 animate-in fade-in duration-700">
          {children(activePage, setActivePage)}
        </div>
      </main>
    </div>
  )
}
