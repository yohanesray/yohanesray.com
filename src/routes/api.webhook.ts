import { createFileRoute } from '@tanstack/react-router'
import { Resend } from 'resend'

declare const process: any

// Appends events to a JSON Lines (.jsonl) file. This is concurrency-safe and keeps logs flat.
async function saveWebhookEvent(
  webhook_status: 'success' | 'failed',
  event?: any,
  error_message?: string,
) {
  try {
    // @ts-ignore
    const fs = await import('fs')
    // @ts-ignore
    const path = await import('path')
    const logDir = path.join(process.cwd(), 'data')
    if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true })

    const data = event?.data
    const logEntry = {
      email_id: data?.email_id || undefined,
      webhook_status,
      email_status: event?.type || undefined,
      to: data?.to ? (Array.isArray(data.to) ? data.to.join(', ') : String(data.to)) : undefined,
      subject: data?.subject || undefined,
      error_message,
      created_at: event?.created_at || new Date().toISOString(),
      payload: data || undefined,
    }

    fs.appendFileSync(path.join(logDir, 'webhooks.jsonl'), JSON.stringify(logEntry) + '\n')
  } catch (err) {
    console.error('Failed to write webhook to log:', err)
  }
}

export const Route = createFileRoute('/api/webhook')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const apiKey = process.env.RESEND_API_KEY
        const webhookSecret = process.env.RESEND_WEBHOOK_SECRET

        if (!apiKey || !webhookSecret) {
          const errMsg = 'Server misconfiguration: API key or Webhook Secret missing'
          await saveWebhookEvent('failed', null, errMsg)
          return new Response(errMsg, { status: 500 })
        }

        // Svix headers are required to authenticate that this payload originated from Resend
        const svixId = request.headers.get('svix-id')
        const svixTimestamp = request.headers.get('svix-timestamp')
        const svixSignature = request.headers.get('svix-signature')

        if (!svixId || !svixTimestamp || !svixSignature) {
          const errMsg = 'Missing webhook headers'
          await saveWebhookEvent('failed', null, errMsg)
          return new Response(errMsg, { status: 400 })
        }

        try {
          const resend = new Resend(apiKey)
          // We must use the raw string payload. Parsing to JSON changes formatting and breaks signature verification.
          const payload = await request.text()

          const event = resend.webhooks.verify({
            payload,
            headers: { id: svixId, timestamp: svixTimestamp, signature: svixSignature },
            webhookSecret,
          }) as any

          await saveWebhookEvent('success', event)

          // Concise console logging for verified event
          const toStr = event.data?.to
            ? Array.isArray(event.data.to)
              ? event.data.to.join(', ')
              : String(event.data.to)
            : 'unknown'
          const subjectStr = event.data?.subject ? ` | Subject: "${event.data.subject}"` : ''
          const extraStr = event.data?.bounce?.message
            ? ` | Reason: ${event.data.bounce.message}`
            : event.data?.click?.url
              ? ` | Clicked: ${event.data.click.url}`
              : event.data?.error?.message
                ? ` | Error: ${event.data.error.message}`
                : ''

          console.log(
            `[Webhook] Event: ${event.type} | Email ID: ${event.data?.email_id || 'N/A'} | To: ${toStr}${subjectStr}${extraStr}`,
          )

          return new Response(JSON.stringify({ success: true }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          })
        } catch (error: any) {
          console.error('Webhook signature verification failed:', error.message)
          await saveWebhookEvent('failed', null, error.message || 'Signature verification failed')
          return new Response('Invalid webhook signature', { status: 400 })
        }
      },
    },
  },
})
