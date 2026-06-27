"use server"

export async function fetchOrdersAction(search?: string) {
    try {
        const baseUrl = process.env.ORDER_API_URL || "https://www.somapi.store/orders"
        const url = search ? `${baseUrl}/phone/${encodeURIComponent(search)}` : baseUrl

        const response = await fetch(url, {
            cache: 'no-store',
            headers: {
                'Accept': 'application/json',
            }
        })

        if (!response.ok) {
            throw new Error(`API responded with status: ${response.status}`)
        }

        const data = await response.json()
        return data
    } catch (error) {
        console.error("fetchOrdersAction Error:", error)
        throw new Error(error instanceof Error ? error.message : "Failed to connect to order gateway")
    }
}
