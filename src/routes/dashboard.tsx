import { Link, createFileRoute } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'

declare const process: any

interface WebhookLogEntry {
  email_id?: string
  webhook_status: 'success' | 'failed'
  email_status?: string
  to?: string
  subject?: string
  created_at: string
  payload?: any
  error_message?: string
}
const getEmailsData = createServerFn({ method: 'GET' }).handler(async () => {
  try {
    // @ts-ignore
    const fs = await import('fs')
    // @ts-ignore
    const path = await import('path')
    const logFile = path.join(process.cwd(), 'data', 'webhooks.jsonl')

    if (!fs.existsSync(logFile)) return []

    const content = fs.readFileSync(logFile, 'utf-8')
    const lines = content.split('\n')
    const emailMap = new Map<
      string,
      { to: string; status: string; subject: string; sent: string; updatedAt: string }
    >()

    for (const line of lines) {
      if (!line.trim()) continue
      try {
        const entry: WebhookLogEntry = JSON.parse(line)
        const emailId = entry.email_id || entry.payload?.email_id
        if (!emailId) continue

        const to = entry.to || entry.payload?.to
        const toStr = Array.isArray(to) ? to.join(', ') : String(to || '')
        const subject = entry.subject || entry.payload?.subject || '(No Subject)'
        const status = entry.email_status || 'unknown'
        const timestamp = entry.created_at || new Date().toISOString()

        const record = emailMap.get(emailId)
        if (!record) {
          emailMap.set(emailId, {
            to: toStr,
            status,
            subject,
            sent: timestamp,
            updatedAt: timestamp,
          })
        } else {
          if (new Date(timestamp) < new Date(record.sent)) {
            record.sent = timestamp
          }

          const newIsNeg = ['email.complained', 'email.suppressed', 'email.bounced'].includes(
            status,
          )
          const existIsNeg = ['email.complained', 'email.suppressed', 'email.bounced'].includes(
            record.status,
          )

          let shouldUpdateStatus = false
          if (newIsNeg && !existIsNeg) {
            shouldUpdateStatus = true
          } else if (!newIsNeg && existIsNeg) {
            shouldUpdateStatus = false
          } else {
            shouldUpdateStatus = new Date(timestamp) >= new Date(record.updatedAt)
          }

          if (shouldUpdateStatus) {
            record.status = status
            record.updatedAt = timestamp
          }

          if (toStr && !record.to) record.to = toStr
          if (subject !== '(No Subject)' && record.subject === '(No Subject)') {
            record.subject = subject
          }
        }
      } catch (err) {
        console.error('Error parsing JSONL line:', err)
      }
    }

    return Array.from(emailMap.values())
      .map((e) => ({
        to: e.to,
        status: e.status,
        subject: e.subject,
        sent: e.sent,
      }))
      .sort((a, b) => new Date(b.sent).getTime() - new Date(a.sent).getTime())
  } catch (err) {
    console.error('Error loading dashboard logs:', err)
    return []
  }
})

export const Route = createFileRoute('/dashboard')({
  loader: async () => await getEmailsData(),
  component: DashboardComponent,
})

function DashboardComponent() {
  const emails = Route.useLoaderData()

  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getStatusColor = (status: string) => {
    if (status.includes('delivered'))
      return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
    if (status.includes('sent')) return 'text-blue-400 bg-blue-500/10 border-blue-500/20'
    if (status.includes('opened')) return 'text-purple-400 bg-purple-500/10 border-purple-500/20'
    if (status.includes('clicked')) return 'text-pink-400 bg-pink-500/10 border-pink-500/20'
    if (status.includes('bounce')) return 'text-rose-400 bg-rose-500/10 border-rose-500/20'
    if (status.includes('complained')) return 'text-amber-400 bg-amber-500/10 border-amber-500/20'
    if (status.includes('suppressed')) return 'text-zinc-500 bg-zinc-900/40 border-zinc-800'
    return 'text-zinc-400 bg-zinc-500/10 border-zinc-500/20'
  }

  return (
    <main className="min-h-screen bg-[#0a0a0c] text-zinc-100 p-6 sm:p-12 font-sans select-none">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-6 mb-8">
          <div>
            <h1 className="text-2xl font-serif font-light text-zinc-100 tracking-tight">
              Email Delivery Log
            </h1>
            <p className="text-xs text-zinc-500 mt-1 font-mono">Simple webhooks logger</p>
          </div>
          <Link
            to="/"
            className="text-xs font-mono text-zinc-400 hover:text-zinc-200 transition-colors bg-zinc-900/30 border border-zinc-800 px-3 py-1.5 rounded-lg hover:bg-zinc-800/80"
          >
            ← Back to Sender
          </Link>
        </div>

        {/* Simple Table */}
        <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950/20">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-900/40 text-xs font-mono text-zinc-500 uppercase tracking-wider">
                  <th className="px-6 py-4">To</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Subject</th>
                  <th className="px-6 py-4 text-right">Sent</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 font-sans">
                {emails.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-6 py-12 text-center text-zinc-600 font-mono text-xs"
                    >
                      No email sending records found.
                    </td>
                  </tr>
                ) : (
                  emails.map((email, i) => (
                    <tr key={i} className="hover:bg-zinc-800/10 transition-colors">
                      <td className="px-6 py-4 font-medium text-zinc-200">{email.to}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-mono border ${getStatusColor(email.status)}`}
                        >
                          {email.status.replace('email.', '')}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-zinc-300 max-w-xs truncate">{email.subject}</td>
                      <td className="px-6 py-4 text-right text-xs font-mono text-zinc-500">
                        {formatTime(email.sent)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  )
}
