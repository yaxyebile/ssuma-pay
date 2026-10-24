"use client"

import { type FormEvent, useCallback, useEffect, useRef, useState } from "react"
import { BellRing, Globe2, Loader2, RefreshCw, Send, Users } from "lucide-react"
import { toast } from "sonner"

type SendResult = {
  success?: boolean
  error?: string
  response?: unknown
  campaign_id?: string
  tracked_device_count?: number
  history_saved?: boolean
}

type Campaign = {
  id: string
  title: string
  body: string
  click_url: string | null
  status: "sending" | "accepted" | "failed" | "not_sent"
  provider_message_id: string | null
  provider_response: unknown
  tracked_device_count: number
  audience_snapshot_at: string | null
  created_at: string
  accepted_at: string | null
  received_count: number
  opened_count: number
  not_yet_received_count: number
  not_opened_count: number
  received_not_opened_count: number
  click_count: number
}

type CountryStat = {
  campaign_id: string
  country_code: string
  country_name: string
  tracked_device_count: number
  received_count: number
  opened_count: number
  click_count: number
}

type HistoryResult = {
  success?: boolean
  error?: string
  campaigns?: Campaign[]
  countries?: CountryStat[]
}

function formatDate(value: string | null) {
  if (!value) return "â€”"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "â€”"
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(date)
}

function count(value: number) {
  return new Intl.NumberFormat().format(value ?? 0)
}

export function PushNotificationView() {
  const [title, setTitle] = useState("")
  const [body, setBody] = useState("")
  const [url, setUrl] = useState("")
  const [isSending, setIsSending] = useState(false)
  const [result, setResult] = useState<SendResult | null>(null)
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [countries, setCountries] = useState<CountryStat[]>([])
  const [isLoadingHistory, setIsLoadingHistory] = useState(true)
  const [historyError, setHistoryError] = useState<string | null>(null)
  const requestInProgress = useRef(false)

  const loadHistory = useCallback(async () => {
    setIsLoadingHistory(true)
    try {
      const response = await fetch("/api/push-notifications", { cache: "no-store" })
      const data = (await response.json().catch(() => null)) as HistoryResult | null
      if (!response.ok || !data?.success) {
        throw new Error(data?.error || `Could not load notification history (HTTP ${response.status}).`)
      }
      setCampaigns(data.campaigns ?? [])
      setCountries(data.countries ?? [])
      setHistoryError(null)
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not load notification history."
      setHistoryError(message)
    } finally {
      setIsLoadingHistory(false)
    }
  }, [])

  useEffect(() => {
    void loadHistory()
  }, [loadHistory])

  async function sendNotification(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (requestInProgress.current) return

    requestInProgress.current = true
    setIsSending(true)
    setResult(null)

    try {
      const response = await fetch("/api/push-notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, body, url }),
      })

      const data = (await response.json().catch(() => null)) as SendResult | null
      const sendResult = data ?? {
        success: false,
        error: `The server returned HTTP ${response.status} without a JSON response.`,
      }
      setResult(sendResult)

      if (!response.ok || sendResult.success !== true) {
        toast.error(sendResult.error || "The notification API did not accept the request.")
        await loadHistory()
        return
      }

      toast.success("Firebase accepted the notification request.")
      if (sendResult.history_saved === false) {
        toast.error("The notification was accepted, but its response could not be saved to analytics.")
      }
      setTitle("")
      setBody("")
      setUrl("")
      await loadHistory()
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not send the notification."
      setResult({ success: false, error: message })
      toast.error(message)
    } finally {
      requestInProgress.current = false
      setIsSending(false)
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <section className="rounded-3xl border border-orange-100 bg-white p-6 shadow-xl shadow-orange-500/5 sm:p-8">
        <div className="mb-7 flex items-start gap-4">
          <div className="rounded-2xl bg-orange-100 p-3 text-orange-600">
            <BellRing className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-gray-900">Send push notification</h2>
            <p className="mt-1 text-sm text-gray-500">
              Send an announcement to devices subscribed to the all topic.
            </p>
          </div>
        </div>

        <form onSubmit={sendNotification} className="flex flex-col gap-5">
          <label className="flex flex-col gap-2 text-sm font-bold text-gray-700">
            Title
            <input
              required
              maxLength={120}
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="New content available!"
              className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none transition focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-500/10"
            />
          </label>

          <label className="flex flex-col gap-2 text-sm font-bold text-gray-700">
            Message
            <textarea
              required
              maxLength={2000}
              rows={5}
              value={body}
              onChange={(event) => setBody(event.target.value)}
              placeholder="Write the message to send to your users."
              className="resize-y rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none transition focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-500/10"
            />
          </label>

          <label className="flex flex-col gap-2 text-sm font-bold text-gray-700">
            Tap URL <span className="font-normal text-gray-400">(optional, HTTPS only)</span>
            <input
              type="url"
              maxLength={2048}
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              placeholder="https://example.com/movies"
              className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none transition focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-500/10"
            />
          </label>

          <button
            type="submit"
            disabled={isSending}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-orange-600 px-5 py-3 text-sm font-black text-white shadow-lg shadow-orange-600/20 transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            {isSending ? "Sending..." : "Send to all devices"}
          </button>
        </form>
      </section>

      <p className="rounded-2xl border border-blue-100 bg-blue-50 px-5 py-4 text-sm text-blue-900">
        An API success response means Firebase accepted the request; it does not confirm delivery to each device.
        Without Firebase or mobile app reporting, delivery and unopened totals are unavailable. When a Tap URL is set,
        this dashboard records tracked link opens and the country reported by the hosting platform.
      </p>

      {result && (
        <section aria-live="polite" className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="mb-3 text-sm font-black uppercase tracking-wide text-gray-700">API response</h3>
          {result.campaign_id && (
            <p className="mb-3 text-xs text-gray-500">
              Campaign: {result.campaign_id}
              {typeof result.tracked_device_count === "number" &&
                ` Â· ${count(result.tracked_device_count)} registered devices in the audience snapshot`}
            </p>
          )}
          <pre className="max-h-96 overflow-auto whitespace-pre-wrap break-words rounded-xl bg-gray-950 p-4 text-xs text-gray-100">
            {JSON.stringify(result.response ?? result, null, 2)}
          </pre>
        </section>
      )}

      <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-xl font-black text-gray-900">Notification analytics</h3>
            <p className="mt-1 text-sm text-gray-500">Latest 30 campaigns and their reported device events.</p>
          </div>
          <button
            type="button"
            onClick={() => void loadHistory()}
            disabled={isLoadingHistory}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2 text-sm font-bold text-gray-700 transition hover:bg-gray-50 disabled:opacity-60"
          >
            <RefreshCw className={`h-4 w-4 ${isLoadingHistory ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>

        {historyError && (
          <div role="alert" className="mb-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            {historyError}
          </div>
        )}

        {isLoadingHistory && campaigns.length === 0 ? (
          <div className="flex items-center justify-center gap-2 py-10 text-sm text-gray-500">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading analytics...
          </div>
        ) : campaigns.length === 0 ? (
          <div className="rounded-2xl bg-gray-50 px-5 py-10 text-center text-sm text-gray-500">
            No notification campaigns have been recorded yet.
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            {campaigns.map((campaign) => {
              const campaignCountries = countries.filter((country) => country.campaign_id === campaign.id)
              return (
                <article key={campaign.id} className="rounded-2xl border border-gray-200 p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="font-black text-gray-900">{campaign.title}</h4>
                        <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                          campaign.status === "accepted"
                            ? "bg-green-100 text-green-800"
                            : campaign.status === "sending"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-gray-100 text-gray-700"
                        }`}>
                          {campaign.status.replace("_", " ")}
                        </span>
                      </div>
                      <p className="mt-1 line-clamp-2 text-sm text-gray-600">{campaign.body}</p>
                      <p className="mt-2 text-xs text-gray-400">{formatDate(campaign.created_at)}</p>
                    </div>
                    <div className="inline-flex items-center gap-1.5 rounded-xl bg-orange-50 px-3 py-2 text-xs font-bold text-orange-800">
                      <Users className="h-4 w-4" /> {campaign.tracked_device_count > 0
                        ? `${count(campaign.tracked_device_count)} registered devices`
                        : "Recipient total unavailable"}
                    </div>
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
                    <Metric label="Tracked link opens" value={campaign.click_count} />
                    {campaign.tracked_device_count > 0 && (
                      <>
                        <Metric label="Received reported" value={campaign.received_count} />
                        <Metric label="No received event" value={campaign.not_yet_received_count} />
                        <Metric label="Opened reported" value={campaign.opened_count} />
                        <Metric label="Not opened" value={campaign.not_opened_count} />
                        <Metric label="Received, not opened" value={campaign.received_not_opened_count} />
                      </>
                    )}
                  </div>

                  <div className="mt-5 border-t border-gray-100 pt-4">
                    <div className="mb-2 flex items-center gap-2 text-xs font-black uppercase tracking-wide text-gray-500">
                      <Globe2 className="h-4 w-4" /> Country breakdown
                    </div>
                    {campaignCountries.length ? (
                      <div className="flex flex-wrap gap-2">
                        {campaignCountries.map((country) => (
                          <span key={`${campaign.id}-${country.country_code}`} className="rounded-lg bg-gray-50 px-3 py-2 text-xs text-gray-700">
                            {country.country_name}
                            {country.click_count > 0 && ` Â· ${count(country.click_count)} link opens`}
                            {country.tracked_device_count > 0 && (
                              <span className="text-gray-400">
                                {` Â· ${count(country.tracked_device_count)} devices Â· ${count(country.received_count)} received Â· ${count(country.opened_count)} opened`}
                              </span>
                            )}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-gray-400">No link-open or device-country data has been recorded.</p>
                    )}
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl bg-gray-50 px-3 py-3">
      <p className="text-lg font-black text-gray-900">{count(value)}</p>
      <p className="mt-1 text-xs leading-4 text-gray-500">{label}</p>
    </div>
  )
}

