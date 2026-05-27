"use server"

import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function createSettlementAction(data: any) {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    try {
        const { error } = await supabase.from("settlements").insert({
            sett_id: data.settId,
            // Ensure status is lowercase to match DB check constraints (completed, pending, failed)
            status: data.status.toLowerCase(),
            account_id: data.accountId,
            amount: data.amount,
            description: data.description || "",
            image_url: data.imageUrl || "",
            created_by: data.userId,
            created_by_name: data.userName,
        })

        if (error) {
            console.error("Constraint Violation or DB Error:", error)
            return { success: false, error: error.message }
        }

        await supabase.from("activity_logs").insert({
            user_id: data.userId,
            user_name: data.userName,
            action: "Created Settlement (Sync)",
            target: data.settId
        })

        return { success: true }
    } catch (err: any) {
        console.error("Action Error:", err)
        return { success: false, error: err.message }
    }
}
