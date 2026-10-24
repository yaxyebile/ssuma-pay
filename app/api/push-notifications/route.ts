import { NextRequest, NextResponse } from "next/server"
import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import { createClient } from "@/utils/supabase/server"

const PUSH_NOTIFICATION_API_URL = "http://45.14.194.79:9524/send"
const MAX_TITLE_LENGTH = 120
const MAX_BODY_LENGTH = 2000
const MAX_URL_LENGTH = 2048
const CAMPAIGN_HISTORY_LIMIT = 30

function jsonError(error: string, status: number, extra: Record<string, unknown> = {}) {
  return NextResponse.json({ success: false, error, ...extra }, { status })
}

async function requireAdmin() {
  const sessionClient = await createClient()
  const {
    data: { user },
    error: authError,
  } = await sessionClient.auth.getUser()

  if (authError || !user) {
    return { response: jsonError("Sign in to access push notifications.", 401) } as const
  }

  const { data: profile, error: profileError } = await sessionClient
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle()

  if (profileError) {
    return { response: jsonError("Could not verify notification permissions.", 503) } as const
  }

  if (profile?.role !== "admin") {
    return { response: jsonError("Administrator access is required.", 403) } as const
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !serviceRoleKey) {
    return { response: jsonError("Push notification database access is not configured on the server.", 503) } as const
  }

  const database = createSupabaseClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  return { user, database } as const
}

export async function GET() {
  const access = await requireAdmin()
  if ("response" in access) return access.response

  const { data: campaigns, error: campaignError } = await access.database
    .from("push_notification_campaign_stats")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(CAMPAIGN_HISTORY_LIMIT)

  if (campaignError) {
    return jsonError(
      "Could not load notification history. Apply the push notification analytics migration first.",
      503,
    )
  }

  const campaignIds = (campaigns ?? []).map((campaign) => campaign.id)
  let countries: Array<Record<string, unknown>> = []

  if (campaignIds.length) {
    const { data, error } = await access.database
      .from("push_notification_country_stats")
      .select("*")
      .in("campaign_id", campaignIds)
      .order("country_name", { ascending: true })

    if (error) {
      return jsonError("Could not load notification country statistics.", 503)
    }
    countries = data ?? []
  }

  return NextResponse.json(
    { success: true, campaigns: campaigns ?? [], countries },
    { headers: { "Cache-Control": "no-store" } },
  )
}

export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin")
  if (!origin || origin !== new URL(request.url).origin) {
    return jsonError("Request origin is not allowed.", 403)
  }

  const access = await requireAdmin()
  if ("response" in access) return access.response

  let input: unknown
  try {
    input = await request.json()
  } catch {
    return jsonError("Request body must be valid JSON.", 400)
  }

  if (typeof input !== "object" || input === null || Array.isArray(input)) {
    return jsonError("Request body must be a JSON object.", 400)
  }

  const values = input as Record<string, unknown>
  const title = typeof values.title === "string" ? values.title.trim() : ""
  const body = typeof values.body === "string" ? values.body.trim() : ""
  const rawUrl = values.url === undefined || values.url === null ? "" : values.url

  if (!title || !body) {
    return jsonError("Title and message are required.", 400)
  }
  if (title.length > MAX_TITLE_LENGTH || body.length > MAX_BODY_LENGTH) {
    return jsonError("Title or message exceeds the allowed length.", 400)
  }
  if (typeof rawUrl !== "string") {
    return jsonError("URL must be a string.", 400)
  }

  const url = rawUrl.trim()
  if (url.length > MAX_URL_LENGTH) {
    return jsonError("URL is too long.", 400)
  }

  let clickUrl: string | undefined
  if (url) {
    try {
      const parsedUrl = new URL(url)
      if (parsedUrl.protocol !== "https:" || parsedUrl.username || parsedUrl.password) {
        return jsonError("URL must be a valid HTTPS address without embedded credentials.", 400)
      }
      clickUrl = parsedUrl.toString()
    } catch {
      return jsonError("Enter a valid HTTPS URL.", 400)
    }
  }

  const apiKey = process.env.PUSH_NOTIFICATION_API_KEY?.trim()
  if (!apiKey) {
    return jsonError("Push notification API key is not configured on the server.", 503)
  }

  const { data: campaign, error: insertError } = await access.database
    .from("push_notification_campaigns")
    .insert({
      title,
      body,
      click_url: clickUrl ?? null,
      created_by: access.user.id,
      status: "sending",
    })
    .select("id")
    .single()

  if (insertError || !campaign) {
    return jsonError(
      "Could not create notification history. Apply the push notification analytics migration first.",
      503,
    )
  }

  const { data: trackedDeviceCount, error: snapshotError } = await access.database
    .rpc("snapshot_push_notification_recipients", { p_campaign_id: campaign.id })

  if (snapshotError) {
    await access.database
      .from("push_notification_campaigns")
      .update({ status: "not_sent", provider_response: { error: "Audience snapshot failed." } })
      .eq("id", campaign.id)

    return jsonError(
      "Notification was not sent because the registered device list could not be read.",
      503,
      { campaign_id: campaign.id },
    )
  }

  const clickTrackingUrl = clickUrl
    ? new URL(`/api/push-notifications/click/${campaign.id}`, request.url).toString()
    : undefined

  const payload = {
    title,
    body,
    ...(clickTrackingUrl ? { url: clickTrackingUrl } : {}),
  }

  let apiResponse: Response
  let responseBody: unknown
  try {
    apiResponse = await fetch(PUSH_NOTIFICATION_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      cache: "no-store",
      signal: AbortSignal.timeout(15_000),
    })

    const responseText = await apiResponse.text()
    responseBody = responseText
    try {
      responseBody = responseText ? JSON.parse(responseText) : null
    } catch {
      // Keep non-JSON provider responses so the admin can inspect them.
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Notification API request failed."
    await access.database
      .from("push_notification_campaigns")
      .update({ status: "failed", provider_response: { error: message } })
      .eq("id", campaign.id)

    return jsonError(message, 502, {
      campaign_id: campaign.id,
      tracked_device_count: trackedDeviceCount ?? 0,
    })
  }

  const accepted =
    apiResponse.ok &&
    typeof responseBody === "object" &&
    responseBody !== null &&
    "success" in responseBody &&
    responseBody.success === true

  const provider = typeof responseBody === "object" && responseBody !== null
    ? responseBody as Record<string, unknown>
    : null
  const providerMessageId = provider
    ? [provider.message_id, provider.messageId, provider.name].find((value) => typeof value === "string") as string | undefined
    : undefined

  const { error: updateError } = await access.database
    .from("push_notification_campaigns")
    .update({
      status: accepted ? "accepted" : "failed",
      provider_message_id: providerMessageId ?? null,
      provider_response: responseBody ?? null,
      accepted_at: accepted ? new Date().toISOString() : null,
    })
    .eq("id", campaign.id)

  if (updateError) {
    console.error("Could not save push notification provider response:", updateError.message)
  }

  if (!accepted) {
    return jsonError("The notification API did not accept the request.", 502, {
      response: responseBody,
      campaign_id: campaign.id,
      tracked_device_count: trackedDeviceCount ?? 0,
      history_saved: !updateError,
    })
  }

  return NextResponse.json({
    success: true,
    response: responseBody,
    campaign_id: campaign.id,
    tracked_device_count: trackedDeviceCount ?? 0,
    history_saved: !updateError,
  })
}

