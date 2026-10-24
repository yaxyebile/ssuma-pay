import { NextRequest, NextResponse } from "next/server"
import { createClient as createSupabaseClient } from "@supabase/supabase-js"

const VISITOR_COOKIE = "push_click_visitor"
const BOT_USER_AGENT = /bot|crawler|spider|preview|facebookexternalhit|whatsapp|telegrambot|slackbot/i

function databaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !serviceRoleKey) return null

  return createSupabaseClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

function countryCode(request: NextRequest) {
  const value = request.headers.get("cf-ipcountry") ?? request.headers.get("x-vercel-ip-country")
  const normalized = value?.trim().toUpperCase()
  return normalized && /^[A-Z]{2}$/.test(normalized) && normalized !== "XX" ? normalized : null
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ campaignId: string }> },
) {
  const { campaignId } = await context.params
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(campaignId)) {
    return NextResponse.json({ error: "Notification link was not found." }, { status: 404 })
  }

  const database = databaseClient()
  if (!database) {
    return NextResponse.json({ error: "Notification tracking is not configured." }, { status: 503 })
  }

  const { data: campaign, error } = await database
    .from("push_notification_campaigns")
    .select("click_url")
    .eq("id", campaignId)
    .maybeSingle()

  if (error || !campaign?.click_url) {
    return NextResponse.json({ error: "Notification link was not found." }, { status: 404 })
  }

  let target: URL
  try {
    target = new URL(campaign.click_url)
    if (target.protocol !== "https:" || target.username || target.password) {
      return NextResponse.json({ error: "Notification link is invalid." }, { status: 404 })
    }
  } catch {
    return NextResponse.json({ error: "Notification link is invalid." }, { status: 404 })
  }

  const userAgent = request.headers.get("user-agent") ?? ""
  if (!BOT_USER_AGENT.test(userAgent)) {
    const existingVisitorId = request.cookies.get(VISITOR_COOKIE)?.value
    const visitorId = existingVisitorId && /^[0-9a-f-]{36}$/i.test(existingVisitorId)
      ? existingVisitorId
      : crypto.randomUUID()

    const { error: clickError } = await database
      .from("push_notification_clicks")
      .upsert(
        {
          campaign_id: campaignId,
          visitor_id: visitorId,
          country_code: countryCode(request),
        },
        { onConflict: "campaign_id,visitor_id", ignoreDuplicates: true },
      )

    if (clickError) {
      console.error("Could not save notification link open:", clickError.message)
    }

    const response = NextResponse.redirect(target, {
      status: 302,
      headers: {
        "Cache-Control": "no-store",
        "Referrer-Policy": "no-referrer",
      },
    })

    if (!existingVisitorId) {
      response.cookies.set({
        name: VISITOR_COOKIE,
        value: visitorId,
        httpOnly: true,
        secure: new URL(request.url).protocol === "https:",
        sameSite: "lax",
        path: "/api/push-notifications/click",
        maxAge: 60 * 60 * 24 * 365,
      })
    }

    return response
  }

  return NextResponse.redirect(target, {
    status: 302,
    headers: {
      "Cache-Control": "no-store",
      "Referrer-Policy": "no-referrer",
    },
  })
}

