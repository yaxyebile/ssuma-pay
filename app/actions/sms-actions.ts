"use server"

export async function sendSMSAction(mobile: string, message: string) {
    try {
        const response = await fetch("https://api.xaliye6.online/sendSMS", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ mobile, message }),
            // Prevent caching for API calls
            cache: 'no-store'
        })

        if (!response.ok) {
            const errorText = await response.text()
            console.error("SMS API Error Response:", errorText)
            throw new Error(`SMS Provider rejected: ${response.status}`)
        }

        return { success: true }
    } catch (e: any) {
        console.error("SMS Action Failure:", e)
        return { success: false, error: e.message }
    }
}
