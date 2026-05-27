"use server"

import { createClient } from "@supabase/supabase-js"

export async function registerUserAction(formData: any) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceKey) {
        return {
            success: false,
            message: "Configuration error: SUPABASE_SERVICE_ROLE_KEY is missing in .env.local"
        }
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    })

    try {
        const { data, error } = await supabaseAdmin.auth.admin.createUser({
            email: formData.email,
            password: formData.password,
            email_confirm: true,
            user_metadata: { name: formData.name }
        })

        if (error) {
            return { success: false, message: error.message }
        }

        if (data.user) {
            const { error: profileError } = await supabaseAdmin
                .from("profiles")
                .update({ role: formData.role, name: formData.name })
                .eq("id", data.user.id)

            if (profileError) {
                console.error("Profile update error:", profileError)
            }
        }

        return { success: true }
    } catch (err: any) {
        return { success: false, message: err.message || "An unexpected error occurred" }
    }
}
