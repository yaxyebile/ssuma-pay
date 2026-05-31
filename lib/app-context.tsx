"use client"

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
  type ReactNode,
} from "react"
import {
  type User,
  type Settlement,
  type ActivityLog,
  type Billing,
  SEED_BILLINGS
} from "./store"
import { supabase } from "./supabase"
import { toast } from "sonner"
import { createSettlementAction } from "@/app/actions/settlement-actions"
import { sendSMSAction } from "@/app/actions/sms-actions"

interface AppContextValue {
  currentUser: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  signUp: (email: string, password: string, name: string) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  settlements: Settlement[]
  addSettlement: (data: any) => Promise<boolean>
  logs: ActivityLog[]
  billings: Billing[]
  addBilling: (data: Omit<Billing, "id" | "createdAt">) => Promise<boolean>
  updateBillingStatus: (id: string, status: Billing["status"]) => Promise<void>
  sendSMS: (mobile: string, message: string) => Promise<void>
  refreshData: () => Promise<void>
}

const AppContext = createContext<AppContextValue | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [settlements, setSettlements] = useState<Settlement[]>([])
  const [logs, setLogs] = useState<ActivityLog[]>([])
  const [billings, setBillings] = useState<Billing[]>([])

  const fetchSettlements = useCallback(async () => {
    try {
      const { data, error } = await supabase.from("settlements").select("*").order("time", { ascending: false }).limit(50)
      if (error) throw error
      if (data) {
        setSettlements(data.map((s: any) => ({
          id: s.id, settId: s.sett_id || s.id, status: s.status, time: s.time, accountId: s.account_id,
          amount: Number(s.amount), settTranId: s.sett_tran_id, tranHeadId: s.tran_head_id,
          issuerSettId: s.issuer_sett_id, description: s.description,
          imageUrl: s.image_url,
          createdBy: s.created_by, createdByName: s.created_by_name,
        })))
      }
    } catch (e) { console.error("Fetch Error:", e) }
  }, [])

  const fetchLogs = useCallback(async () => {
    try {
      const { data, error } = await supabase.from("activity_logs").select("*").order("time", { ascending: false }).limit(20)
      if (error) throw error
      if (data) setLogs(data.map((l: any) => ({ id: l.id, userId: l.user_id, userName: l.user_name, action: l.action, target: l.target, time: l.time })))
    } catch (e) { console.error("Logs Error:", e) }
  }, [])

  const fetchBillings = useCallback(async () => {
    try {
      const { data, error } = await supabase.from("billings").select("*").order("due_day", { ascending: true })
      if (error) throw error
      if (data) {
        setBillings(data.map((b: any) => ({
          id: b.id, companyName: b.company_name, amount: Number(b.amount),
          dueDay: b.due_day, status: b.status, category: b.category,
          reminderPhone: b.reminder_phone, reminderMessage: b.reminder_message,
          lastPaidMonth: b.last_paid_month,
          paidAt: b.paid_at,
          lastReminderAt: b.last_reminder_at,
          createdAt: b.created_at
        })))
      }
    } catch (e) {
      console.warn("Billings fetch (Supabase) skipped or failed, using seed data:", e)
      setBillings(SEED_BILLINGS)
    }
  }, [])

  const sendSMS = async (mobile: string, message: string) => {
    const loadingToast = toast.loading(`Sending alert to ${mobile}...`)
    try {
      const result = await sendSMSAction(mobile, message)
      toast.dismiss(loadingToast)

      if (result.success) {
        toast.success("SMS Alert Sent Successfully")
      } else {
        throw new Error(result.error)
      }
    } catch (e: any) {
      toast.dismiss(loadingToast)
      console.error("SMS Error:", e)
      toast.error(`SMS Failed: ${e.message}`)
    }
  }

  const refreshData = useCallback(async () => {
    if (!currentUser) return
    await Promise.all([fetchSettlements(), fetchLogs(), fetchBillings()])
  }, [currentUser, fetchSettlements, fetchLogs, fetchBillings])

  const syncProfile = async (user: any) => {
    if (!user) return null
    console.log("Starting syncProfile for:", user.email)

    try {
      const profilePromise = (async () => {
        const targetRole = (user.email === 'yaxyebile91@gmail.com' || user.email === 'admin@waafipay.com') ? 'admin' : 'staff'

        console.log("Fetching profile from Supabase...")
        const { data: profile, error: fetchError } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle()

        if (fetchError) {
          console.error("Supabase Profile Fetch Error:", fetchError)
          throw fetchError
        }

        if (profile) {
          console.log("Profile found:", profile.role)
          const needsRoleUpdate = targetRole === 'admin' && profile.role !== 'admin'
          const needsNameUpdate = user.user_metadata?.name && profile.name !== user.user_metadata.name

          if (needsRoleUpdate || needsNameUpdate) {
            console.log("Profile needs update. Applying...")
            const updates: any = {}
            if (needsRoleUpdate) updates.role = 'admin'
            if (needsNameUpdate) updates.name = user.user_metadata.name

            const { error: updateError } = await supabase.from("profiles").update(updates).eq("id", user.id)
            if (updateError) console.error("Profile Update Error:", updateError)
            return { ...profile, ...updates }
          }
          return profile
        }

        console.log("No profile found. Creating new...")
        const newProfile = {
          id: user.id,
          email: user.email,
          name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
          role: targetRole
        }
        const { error: upsertError } = await supabase.from('profiles').upsert(newProfile)
        if (upsertError) {
          console.error("Profile Upsert Error:", upsertError)
          throw upsertError
        }

        console.log("New profile created successfully")
        return newProfile
      })()

      // Race against a 30 second timeout for profile sync
      const timeoutPromise = new Promise((resolve) => setTimeout(() => resolve("timeout"), 30000))

      const result = await Promise.race([profilePromise, timeoutPromise])

      if (result === "timeout") {
        console.error("CRITICAL: Profile sync timed out after 30s. Using fallback.")
        return {
          id: user.id,
          email: user.email,
          name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
          role: (user.email === 'yaxyebile91@gmail.com' || user.email === 'admin@waafipay.com') ? 'admin' : 'staff'
        }
      }

      console.log("Profile sync completed successfully")
      return result as any
    } catch (e) {
      console.error("Profile Sync Error:", e)
      // Fallback to a basic profile if sync fails so the user can at least see the app
      return {
        id: user.id,
        email: user.email,
        name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
        role: (user.email === 'yaxyebile91@gmail.com' || user.email === 'admin@waafipay.com') ? 'admin' : 'staff'
      }
    }
  }

  useEffect(() => {
    let mounted = true

    const init = async () => {
      // Add a timeout to prevent infinite loading if Supabase hangs
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Auth timeout")), 5000)
      )

      try {
        // Race the session check against a timeout
        const { data: { session } } = await Promise.race([
          supabase.auth.getSession(),
          timeoutPromise as Promise<any>
        ])

        if (session?.user && mounted) {
          const profile = await syncProfile(session.user)
          if (profile && mounted) setCurrentUser(profile as any)
        }
      } catch (e) {
        console.error("Auth Init Error or Timeout:", e)
        // If we timeout or error, we should check if there's a corrupted token
        // and potentially clear it to allow the app to load in logged-out state
        const isTimeout = e instanceof Error && e.message === "Auth timeout"
        if (isTimeout) {
          console.warn("Auth timed out. Clearing potential broken session.")
          // Removing the specific token mentioned by user
          try {
            for (let i = 0; i < localStorage.length; i++) {
              const key = localStorage.key(i)
              if (key?.includes('auth-token')) {
                localStorage.removeItem(key)
              }
            }
          } catch (storageErr) {
            console.error("Failed to clear localStorage:", storageErr)
          }
        }
      } finally {
        if (mounted) setLoading(false)
      }
    }

    init()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return

      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        if (session?.user) {
          const profile = await syncProfile(session.user)
          if (profile && mounted) setCurrentUser(profile as any)
        }
      } else if (event === 'SIGNED_OUT') {
        setCurrentUser(null)
        setSettlements([])
        setLogs([])
      }

      if (mounted) setLoading(false)
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  useEffect(() => { if (currentUser) refreshData() }, [currentUser, refreshData])

  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { toast.error(error.message); return { success: false, error: error.message } }
    return { success: true }
  }

  const signUp = async (email: string, password: string, name: string) => {
    const { error } = await supabase.auth.signUp({ email, password, options: { data: { name } } })
    if (error) { toast.error(error.message); return { success: false, error: error.message } }
    return { success: true }
  }

  const addSettlement = async (data: any) => {
    if (!currentUser) return false
    const loadingToast = toast.loading("Connecting to High-Speed Suuma Channel...")

    try {
      const result = await createSettlementAction({
        ...data,
        userId: currentUser.id,
        userName: currentUser.name
      })

      if (!result.success) throw new Error(result.error)

      await refreshData()
      toast.dismiss(loadingToast)
      toast.success(`Success! ${data.settId} is securely logged.`)
      return true
    } catch (e: any) {
      toast.dismiss(loadingToast)
      console.error("Submission Failure:", e)
      toast.error(`Rejected: ${e.message || 'Server timeout'}`)
      return false
    }
  }

  const addBilling = async (data: any) => {
    const loadingToast = toast.loading("Saving billing record...")
    try {
      const { error } = await supabase.from("billings").insert([{
        company_name: data.companyName,
        amount: data.amount,
        due_day: data.dueDay,
        status: data.status,
        category: data.category,
        reminder_phone: data.reminderPhone,
        reminder_message: data.reminderMessage,
        last_paid_month: data.status === "paid" ? new Date().toISOString().slice(0, 7) : data.lastPaidMonth
      }])
      if (error) throw error
      await fetchBillings()
      toast.dismiss(loadingToast)
      toast.success("Billing record saved.")
      return true
    } catch (e: any) {
      toast.dismiss(loadingToast)
      const newBilling = { ...data, id: Math.random().toString(), createdAt: new Date().toISOString() }
      setBillings(prev => [...prev, newBilling])
      toast.success("Saved to local session.")
      return true
    }
  }

  const updateBillingStatus = async (id: string, status: any) => {
    const now = new Date().toISOString()
    const currentMonth = now.slice(0, 7)
    try {
      const { error } = await supabase.from("billings").update({
        status,
        last_paid_month: status === "paid" ? currentMonth : undefined,
        paid_at: status === "paid" ? now : null
      }).eq("id", id)
      if (error) throw error
      await fetchBillings()
    } catch (e) {
      setBillings(prev => prev.map(b => b.id === id ? {
        ...b,
        status,
        lastPaidMonth: status === "paid" ? currentMonth : b.lastPaidMonth,
        paidAt: status === "paid" ? now : undefined
      } : b))
    }
  }

  // Use a ref to prevent multiple simultaneous checks or redundant triggers
  const isCheckingRef = useRef(false)

  const checkRecurringBillings = useCallback(async () => {
    if (isCheckingRef.current) return
    isCheckingRef.current = true

    const today = new Date()
    const currentMonth = today.toISOString().slice(0, 7)

    try {
      for (const bill of billings) {
        const needsToPayThisMonth = bill.lastPaidMonth !== currentMonth
        const dueDate = new Date(today.getFullYear(), today.getMonth(), bill.dueDay)
        const diffHours = (today.getTime() - dueDate.getTime()) / (1000 * 60 * 60)
        const withinReminderWindow = diffHours >= -12

        if (needsToPayThisMonth && today.getDate() >= bill.dueDay && bill.status === "paid") {
          await updateBillingStatus(bill.id, "unpaid")
        }

        if (needsToPayThisMonth && withinReminderWindow && bill.status === "unpaid") {
          const lastSent = bill.lastReminderAt ? new Date(bill.lastReminderAt) : null
          const hoursSinceLast = lastSent ? (today.getTime() - lastSent.getTime()) / (1000 * 60 * 60) : 999

          if (hoursSinceLast >= 6) {
            console.log(`Aggressive trigger: Sending SMS for ${bill.companyName}`)
            const result = await sendSMSAction(bill.reminderPhone, bill.reminderMessage)

            if (result.success) {
              const nowISO = new Date().toISOString()
              await supabase.from("billings").update({ last_reminder_at: nowISO }).eq("id", bill.id)
              // Update state locally without re-triggering everything
              setBillings(prev => prev.map(b => b.id === bill.id ? { ...b, lastReminderAt: nowISO } : b))
            }
          }
        }
      }
    } finally {
      isCheckingRef.current = false
    }
  }, [billings, updateBillingStatus])

  useEffect(() => {
    if (billings.length > 0) {
      checkRecurringBillings()
      const interval = setInterval(checkRecurringBillings, 1800000)
      return () => clearInterval(interval)
    }
    // Only re-run when billings length changes (initial load), not on every data change
  }, [billings.length])

  const logout = async () => {
    try {
      await supabase.auth.signOut()
    } catch (e) {
      console.error("Sign out error:", e)
    } finally {
      // Always clear local state even if server-side sign out fails
      setCurrentUser(null)
      // Clear any potential leftover tokens in localStorage
      try {
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i)
          if (key?.includes('auth-token')) {
            localStorage.removeItem(key)
          }
        }
      } catch (e) { }
      window.location.href = "/"
    }
  }

  return (
    <AppContext.Provider value={{
      currentUser, loading, login, signUp, logout,
      settlements, addSettlement, logs,
      billings, addBilling, updateBillingStatus,
      sendSMS,
      refreshData
    }}>
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error("useApp must be used inside AppProvider")
  return ctx
}
