"use client"

import { useApp } from "@/lib/app-context"
import { AppShell } from "@/components/app-shell"
import { DashboardView } from "@/components/dashboard-view"
import { SettlementsView } from "@/components/settlements-view"
import { ActivityLogView } from "@/components/activity-log-view"
import { ReportsView } from "@/components/reports-view"
import { LoginPage } from "@/components/login-page"
import { AdminManagementView } from "@/components/admin-mgmt-view"
import { BillingView } from "@/components/billing-view"
import { MatchesView } from "@/components/matches/matches-view"

export default function Home() {
  const { currentUser, loading, refreshData } = useApp()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
          <p className="text-sm font-medium text-muted-foreground animate-pulse">Loading system...</p>
        </div>
      </div>
    )
  }

  if (!currentUser) {
    return <LoginPage onSuccess={() => refreshData()} />
  }

  return (
    <AppShell>
      {(activePage) => {
        if (activePage === "dashboard") return <DashboardView />
        if (activePage === "settlements") return <SettlementsView />
        if (activePage === "activity") return <ActivityLogView />
        if (activePage === "reports") return <ReportsView />
        if (activePage === "billing") return <BillingView />
        if (activePage === "active-matches" || activePage === "add-match" || activePage === "teams") {
          return <MatchesView initialTab={activePage === "teams" ? "teams" : "matches"} initialView={activePage === "add-match" ? "form" : "list"} />
        }
        if (activePage === "users" || activePage === "admin") return <AdminManagementView />
        return <DashboardView />
      }}
    </AppShell>
  )
}
