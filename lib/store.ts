"use client"

// ─── Types ───────────────────────────────────────────────────────────────────

export type Role = "admin" | "staff"

export type SettlementStatus = "completed" | "pending" | "failed" | "processing"

export interface User {
  id: string
  name: string
  email: string
  role: Role
}

export interface Settlement {
  id: string
  settId: string
  status: SettlementStatus
  time: string // ISO string
  accountId: string
  amount: number
  settTranId: string
  tranHeadId: string
  issuerSettId: string
  description: string
  imageUrl?: string
  createdBy: string // user id
  createdByName: string
}

export interface ActivityLog {
  id: string
  userId: string
  userName: string
  action: string
  target: string
  time: string
}

export type BillingStatus = "paid" | "unpaid" | "pending"

export interface Billing {
  id: string
  companyName: string
  amount: number
  dueDay: number // Day of month (1-31)
  status: BillingStatus
  category: string
  reminderPhone: string
  reminderMessage: string
  lastPaidMonth?: string // ISO month string e.g. "2026-05"
  paidAt?: string // ISO string for the exact time of last payment
  lastReminderAt?: string // Timestamp of the last sent reminder (auto or manual)
  createdAt: string
}

// ─── Seed Users ──────────────────────────────────────────────────────────────

export const SEED_USERS: User[] = [
  {
    id: "u1",
    name: "Abdi Hassan",
    email: "admin@waafipay.com",
    role: "admin",
  },
  {
    id: "u2",
    name: "Fadumo Warsame",
    email: "fadumo@waafipay.com",
    role: "staff",
  },
  {
    id: "u3",
    name: "Mohamed Ali",
    email: "mali@waafipay.com",
    role: "staff",
  },
  {
    id: "u4",
    name: "Hodan Jama",
    email: "hodan@waafipay.com",
    role: "staff",
  },
]

// ─── Seed Settlements ────────────────────────────────────────────────────────

function rndId(prefix: string) {
  return `${prefix}${Math.random().toString(36).slice(2, 10).toUpperCase()}`
}

const statuses: SettlementStatus[] = ["completed", "completed", "completed", "pending", "failed", "processing"]
const descriptions = [
  "Monthly merchant settlement",
  "Agent payout – Mogadishu",
  "Cross-border transfer fee",
  "B2B disbursement",
  "Bulk salary payment",
  "Utility bill settlement",
  "School fee collection",
  "Airtime bulk purchase",
]

function seedDate(daysAgo: number) {
  const d = new Date()
  d.setDate(d.getDate() - daysAgo)
  d.setHours(Math.floor(Math.random() * 23), Math.floor(Math.random() * 59))
  return d.toISOString()
}

const staffCycle = ["u2", "u3", "u4", "u2", "u3", "u2", "u4", "u3"]
const staffNames: Record<string, string> = {
  u1: "Abdi Hassan",
  u2: "Fadumo Warsame",
  u3: "Mohamed Ali",
  u4: "Hodan Jama",
}

export const SEED_SETTLEMENTS: Settlement[] = Array.from({ length: 32 }, (_, i) => {
  const userId = staffCycle[i % staffCycle.length]
  return {
    id: `s${i + 1}`,
    settId: rndId("SETT-"),
    status: statuses[i % statuses.length],
    time: seedDate(i * 2),
    accountId: `ACC-${10000 + i * 37}`,
    amount: Math.round((500 + Math.random() * 49500) * 100) / 100,
    settTranId: rndId("TXN-"),
    tranHeadId: rndId("HEAD-"),
    issuerSettId: rndId("ISS-"),
    description: descriptions[i % descriptions.length],
    imageUrl: `https://picsum.photos/seed/${i}/400/300`,
    createdBy: userId,
    createdByName: staffNames[userId],
  }
})

export const SEED_LOGS: ActivityLog[] = SEED_SETTLEMENTS.slice(0, 20).map((s, i) => ({
  id: `log${i + 1}`,
  userId: s.createdBy,
  userName: s.createdByName,
  action: "Added settlement",
  target: s.settId,
  time: s.time,
}))

export const SEED_BILLINGS: Billing[] = [
  {
    id: "b1",
    companyName: "Hormuud Telecom",
    amount: 150.00,
    dueDay: 1,
    status: "unpaid",
    category: "Internet & Voice",
    reminderPhone: "+252614386039",
    reminderMessage: "Fadlan bixi biilka internetka ee bishaan.",
    lastPaidMonth: "2026-04",
    createdAt: new Date().toISOString()
  },
  {
    id: "b2",
    companyName: "BECO Electricity",
    amount: 320.50,
    dueDay: 5,
    status: "pending",
    category: "Utilities",
    reminderPhone: "+252614386039",
    reminderMessage: "Biilka korontada waa in la bixiyaa inta aysan 5ta bishu dhaafin.",
    lastPaidMonth: "2026-04",
    createdAt: new Date().toISOString()
  },
  {
    id: "b3",
    companyName: "Premier Bank HQ",
    amount: 2500.00,
    dueDay: 10,
    status: "unpaid",
    category: "Rent",
    reminderPhone: "+252614386039",
    reminderMessage: "Kirada xafiiska HQ fadlan bixi.",
    lastPaidMonth: "2026-04",
    createdAt: new Date().toISOString()
  },
  {
    id: "b4",
    companyName: "Dahabshiil Group",
    amount: 85.00,
    dueDay: 15,
    status: "paid",
    category: "Software Subscription",
    reminderPhone: "+252614386039",
    reminderMessage: "Subscription-ka bishaan waa la bixiyey.",
    lastPaidMonth: "2026-05",
    createdAt: new Date().toISOString()
  }
]
