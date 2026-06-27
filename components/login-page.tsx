"use client"

import { useState } from "react"
import { useApp } from "@/lib/app-context"
import { Eye, EyeOff, LockKeyhole, Mail, User as UserIcon, ArrowRight } from "lucide-react"

interface LoginPageProps {
  onSuccess: () => void
}

export function LoginPage({ onSuccess }: LoginPageProps) {
  const { login, signUp } = useApp()
  const [mode, setMode] = useState<"signin" | "signup">("signin")
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)

    if (mode === "signin") {
      const result = await login(email.trim(), password)
      if (result.success) {
        onSuccess()
      } else {
        setError(result.error || "Fadlan hubi email-ka iyo password-ka.")
      }
    } else {
      const result = await signUp(email.trim(), password, name)
      if (result.success) {
        setMode("signin")
        setError("")
        alert("Waan ku diwaangelinnay! Hadda soo gal system-ka.")
      } else {
        setError(result.error || "Diwaangelintu way fashilantay.")
      }
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex bg-white font-sans selection:bg-orange-100 selection:text-orange-600">
      {/* Left panel (Hero Section) */}
      <div className="hidden lg:flex lg:w-[46%] bg-[#F15A24] relative overflow-hidden flex-col justify-between p-12 text-white">
        {/* Dynamic Background Patterns */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_2px_2px,white_1px,transparent_0)] bg-[size:40px_40px]" />
        </div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-white/10 blur-[100px] rounded-full" />

        <div className="relative z-10 flex items-center gap-4 animate-in slide-in-from-left-8 duration-700">
          <div className="h-12 w-12 bg-white rounded-2xl flex items-center justify-center shadow-2xl">
            <span className="text-[#F15A24] font-black text-2xl">S</span>
          </div>
          <span className="text-2xl font-black tracking-tight">Suuma Pay</span>
        </div>

        <div className="relative z-10 animate-in slide-in-from-bottom-8 duration-1000">
          <h2 className="text-5xl font-black leading-[1.1] tracking-tight text-balance">
            Maamul Lacagahaaga Si Casri Ah.
          </h2>
          <p className="mt-6 text-lg text-white/80 leading-relaxed max-w-lg font-medium">
            Suuma Pay waa system-kii ugu horeeyey ee Somali ah oo hal meel isugu keenaya settlements-ka, warbixinada, iyo maamulka shaqaalaha.
          </p>
          <div className="mt-10 flex gap-4">
            <div className="px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20 text-xs font-bold uppercase tracking-widest">Enterprise Ready</div>
            <div className="px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20 text-xs font-bold uppercase tracking-widest">Real-time Sync</div>
          </div>
        </div>

        <div className="relative z-10 flex justify-between items-center text-white/60 text-xs font-bold uppercase tracking-widest animate-in slide-in-from-right-8 duration-1000">
          <span>&copy; {new Date().getFullYear()} Suuma Pay Global</span>
          <div className="flex gap-4">
            <span className="hover:text-white cursor-pointer transition-colors">Privacy</span>
            <span className="hover:text-white cursor-pointer transition-colors">Terms</span>
          </div>
        </div>
      </div>

      {/* Right panel (Form) */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 relative">
        <div className="absolute top-8 right-8 lg:hidden">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-orange-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-black text-sm">S</span>
            </div>
            <span className="font-black text-orange-600">Suuma Pay</span>
          </div>
        </div>

        <div className="w-full max-w-sm animate-in zoom-in-95 duration-500">
          <div className="mb-10 lg:text-left text-center">
            <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-2">
              {mode === "signin" ? "Ku soo dhawoow" : "Abuur Koonto"}
            </h1>
            <p className="text-gray-500 font-medium">
              {mode === "signin"
                ? "Fadlan geli xogtaada si aad u bilowdo."
                : "Buuxi macluumaadka hoos ku qoran."}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            {mode === "signup" && (
              <div className="flex flex-col gap-2 group animate-in fade-in slide-in-from-top-4 duration-300">
                <label htmlFor="name" className="text-xs font-bold uppercase tracking-widest text-gray-600 ml-1">Magacaaga</label>
                <div className="relative">
                  <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
                  <input
                    id="name"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Mohamed Abdi"
                    className="w-full rounded-2xl border border-gray-200 bg-gray-50/50 pl-11 pr-4 py-3.5 text-sm font-semibold transition-all focus:bg-white focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none"
                  />
                </div>
              </div>
            )}

            <div className="flex flex-col gap-2 group">
              <label htmlFor="email" className="text-xs font-bold uppercase tracking-widest text-gray-600 ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@suumapay.com"
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50/50 pl-11 pr-4 py-3.5 text-sm font-semibold transition-all focus:bg-white focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2 group">
              <label htmlFor="password" className="text-xs font-bold uppercase tracking-widest text-gray-600 ml-1">Password</label>
              <div className="relative">
                <LockKeyhole className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
                <input
                  id="password"
                  type={showPass ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="********"
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50/50 pl-11 pr-12 py-3.5 text-sm font-semibold transition-all focus:bg-white focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPass((v) => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-orange-600"
                >
                  {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-sm font-bold text-red-500 bg-red-50 rounded-xl px-4 py-3 border border-red-100 flex items-center gap-2 animate-in slide-in-from-bottom-2">
                <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full group mt-2 rounded-2xl bg-orange-600 py-4 text-sm font-black text-white hover:bg-orange-700 transition-all shadow-xl shadow-orange-600/20 active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading
                ? "Fadlan sug..."
                : (mode === "signin" ? "Soo Gal" : "Diiwaangeli")}
              {!loading && <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />}
            </button>
          </form>

        </div>
      </div>
    </div>
  )
}
