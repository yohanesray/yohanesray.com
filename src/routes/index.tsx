import { useState } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { Resend } from 'resend'

declare const process: any

// Helper functions for Resend client and local attachment reading on server side
function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    throw new Error('RESEND_API_KEY is not defined in environment variables')
  }
  return new Resend(apiKey)
}

async function getBase64Attachment() {
  // @ts-ignore
  const fs = await import('fs')
  // @ts-ignore
  const path = await import('path')
  const filePath = path.join(process.cwd(), 'public', 'attachment.png')
  return fs.readFileSync(filePath).toString('base64')
}

// Server function running securely on the backend (Vercel serverless)
const sendNotificationEmail = createServerFn({ method: 'POST' })
  .inputValidator((email: unknown) => {
    if (typeof email !== 'string' || !email.includes('@')) {
      throw new Error('Invalid email address')
    }
    return email
  })
  .handler(async ({ data: email }) => {
    try {
      const resend = getResendClient()
      const { error } = await resend.emails.send({
        from: 'Yohanes Ray <me@mail.yohanesray.com>',
        to: email,
        subject: 'Thank you for connecting!',
        text: `Hi,\n\nThank you for signing up to get notified! I will keep you updated on the progress of yohanesray.com.\n\nBest regards,\nYohanes Ray`,
      })

      if (error) return { success: false, error: error.message }
      return { success: true }
    } catch (err: any) {
      console.error('Error sending email:', err)
      return { success: false, error: err.message || 'Failed to send email' }
    }
  })

const sendBulkEmails = createServerFn({ method: 'POST' }).handler(async () => {
  try {
    const resend = getResendClient()
    const { error } = await resend.batch.send([
      {
        from: 'Yohanes Ray <me@mail.yohanesray.com>',
        to: 'complained@resend.dev',
        subject: '[Bulk Email] Thank you for connecting!',
        text: `Hi,\n\nThis is a bulk test email.\n\nThank you for signing up to get notified! I will keep you updated on the progress of yohanesray.com.\n\nBest regards,\nYohanes Ray`,
      },
      {
        from: 'Yohanes Ray <me@mail.yohanesray.com>',
        to: 'annessilitonga21@gmail.com',
        subject: '[Bulk Email] Thank you for connecting!',
        text: `Hi,\n\nThis is a bulk test email.\n\nThank you for signing up to get notified! I will keep you updated on the progress of yohanesray.com.\n\nBest regards,\nYohanes Ray`,
      },
    ])

    if (error) return { success: false, error: error.message }
    return { success: true }
  } catch (err: any) {
    console.error('Error sending batch emails:', err)
    return { success: false, error: err.message || 'Failed to send batch emails' }
  }
})

const sendAttachmentEmail = createServerFn({ method: 'POST' })
  .inputValidator((email: unknown) => {
    if (typeof email !== 'string' || !email.includes('@')) {
      throw new Error('Invalid email address')
    }
    return email
  })
  .handler(async ({ data: email }) => {
    try {
      const resend = getResendClient()
      const fileContent = await getBase64Attachment()

      const { error } = await resend.emails.send({
        from: 'Yohanes Ray <me@mail.yohanesray.com>',
        to: email,
        subject: 'Here is your attachment!',
        text: 'Please find the attachment file below.',
        attachments: [
          {
            filename: 'attachment.png',
            content: fileContent,
          },
        ],
      })

      if (error) return { success: false, error: error.message }
      return { success: true }
    } catch (err: any) {
      console.error('Error sending attachment email:', err)
      return { success: false, error: err.message || 'Failed to send email' }
    }
  })

const scheduleEmail = createServerFn({ method: 'POST' })
  .inputValidator((input: unknown) => {
    const data = input as { email: string; minutes: number }
    if (typeof data?.email !== 'string' || !data.email.includes('@')) {
      throw new Error('Invalid email address')
    }
    if (typeof data?.minutes !== 'number') {
      throw new Error('Invalid minutes value')
    }
    return data
  })
  .handler(async ({ data: { email, minutes } }) => {
    try {
      const resend = getResendClient()
      const scheduledTime = new Date(Date.now() + 1000 * 60 * minutes).toISOString()

      const { error } = await resend.emails.send({
        from: 'Yohanes Ray <me@mail.yohanesray.com>',
        to: email,
        subject: `Scheduled Email (${minutes} min)`,
        text: `Hi,\n\nThis is a dynamic email scheduled to be sent in ${minutes} minute(s).\n\nBest regards,\nYohanes Ray`,
        scheduledAt: scheduledTime,
      })

      if (error) return { success: false, error: error.message }
      return { success: true }
    } catch (err: any) {
      console.error('Error scheduling email:', err)
      return { success: false, error: err.message || 'Failed to schedule email' }
    }
  })

const sendInlineImageEmail = createServerFn({ method: 'POST' })
  .inputValidator((email: unknown) => {
    if (typeof email !== 'string' || !email.includes('@')) {
      throw new Error('Invalid email address')
    }
    return email
  })
  .handler(async ({ data: email }) => {
    try {
      const resend = getResendClient()
      const fileContent = await getBase64Attachment()

      const { error } = await resend.emails.send({
        from: 'Yohanes Ray <me@mail.yohanesray.com>',
        to: email,
        subject: 'Inline Image Email (CID)',
        html: '<p>Below is our logo embedded inline using a CID attachment:</p><img src="cid:logo-image" alt="Embedded Logo" />',
        attachments: [
          {
            content: fileContent,
            filename: 'attachment.png',
            contentId: 'logo-image',
          },
        ],
      })

      if (error) return { success: false, error: error.message }
      return { success: true }
    } catch (err: any) {
      console.error('Error sending inline image email:', err)
      return { success: false, error: err.message || 'Failed to send email' }
    }
  })

const sendOpenTrackingEmail = createServerFn({ method: 'POST' })
  .inputValidator((email: unknown) => {
    if (typeof email !== 'string' || !email.includes('@')) {
      throw new Error('Invalid email address')
    }
    return email
  })
  .handler(async ({ data: email }) => {
    try {
      const resend = getResendClient()
      const { error } = await resend.emails.send({
        from: 'Yohanes Ray <me@mail.yohanesray.com>',
        to: email,
        subject: 'Open Tracking Works Demo',
        html: `
          <div style="font-family: sans-serif; color: #333; padding: 20px;">
            <h2>Open Tracking Test</h2>
            <p>This email is sent to test open tracking on your domain.</p>
            <p>Status: Active</p>
          </div>
        `,
      })

      if (error) return { success: false, error: error.message }
      return { success: true }
    } catch (err: any) {
      console.error('Error sending tracking email:', err)
      return { success: false, error: err.message || 'Failed to send email' }
    }
  })

export const Route = createFileRoute('/')({ component: RouteComponent })

function RouteComponent() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [scheduleMinutes, setScheduleMinutes] = useState(1)
  const [copiedText, setCopiedText] = useState('')

  const handleCopy = (text: string) => {
    void navigator.clipboard.writeText(text)
    setCopiedText(text)
    setTimeout(() => setCopiedText(''), 2000)
  }

  const executeEmailAction = async (
    actionFn: () => Promise<{ success: boolean; error?: string }>,
    onSuccess?: () => void,
  ) => {
    if (loading) return
    setLoading(true)
    try {
      const res = await actionFn()
      if (res.success) {
        setSubmitted(true)
        onSuccess?.()
        setTimeout(() => setSubmitted(false), 4000)
      } else {
        alert(`Failed: ${res.error}`)
      }
    } catch (error: any) {
      console.error('Submission error:', error)
      alert('An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    void executeEmailAction(
      () => sendNotificationEmail({ data: email }),
      () => setEmail(''),
    )
  }

  const handleSendBulk = () => {
    void executeEmailAction(sendBulkEmails)
  }
  const handleSendAttachment = () => {
    if (!email) return alert('Please enter a recipient email address first.')
    void executeEmailAction(() => sendAttachmentEmail({ data: email }))
  }
  const handleScheduleEmail = () => {
    if (!email) return alert('Please enter a recipient email address first.')
    void executeEmailAction(() => scheduleEmail({ data: { email, minutes: scheduleMinutes } }))
  }
  const handleSendInlineImage = () => {
    if (!email) return alert('Please enter a recipient email address first.')
    void executeEmailAction(() => sendInlineImageEmail({ data: email }))
  }
  const handleOpenTracking = () => {
    if (!email) return alert('Please enter a recipient email address first.')
    void executeEmailAction(() => sendOpenTrackingEmail({ data: email }))
  }

  return (
    <main className="relative flex min-h-screen w-full flex-col items-center bg-[#0a0a0c] px-6 text-center select-none overflow-hidden">
      {/* Top Header Bar containing SYS_INIT, Logo, and Dashboard */}
      <header className="absolute top-8 left-0 right-0 px-8 flex items-center justify-between w-full z-20">
        <div className="text-xs font-mono text-zinc-800 select-none">[SYS_INIT]</div>

        <div className="absolute left-1/2 -translate-x-1/2">
          <h1 className="font-serif text-lg md:text-xl font-light tracking-tight text-zinc-100 hover:tracking-wide transition-all duration-500">
            yohanesray
            <span className="text-zinc-500 font-sans text-sm md:text-base font-light">.com</span>
          </h1>
        </div>

        <Link
          to="/dashboard"
          className="text-xs font-mono text-zinc-400 hover:text-zinc-200 transition-colors bg-zinc-900/30 border border-zinc-850 px-3 py-1.5 rounded-lg hover:bg-zinc-800/80"
        >
          [DASHBOARD]
        </Link>
      </header>

      {/* Top Spacer to balance the bottom form and keep content centered */}
      <div className="flex-1" />

      {/* Centered Content Container */}
      <div className="z-10 flex flex-col items-center justify-center pt-12">
        {/* Title / Domain */}
        <h2 className="animate-fade-in-up font-serif text-3xl md:text-4xl font-light tracking-tight text-zinc-100 transition-all duration-700 hover:tracking-wide">
          Resend Simulator
        </h2>
      </div>

      {/* Bottom Spacer containing the Form and Simulator at the end of view */}
      <div className="flex-1 flex flex-col justify-end pb-16 w-full items-center z-10">
        <div className="flex flex-col md:flex-row items-center md:items-stretch justify-center gap-10 md:gap-16 w-full max-w-3xl px-4 animate-fade-in-up animation-delay-400">
          {/* Form & Label Container */}
          <div className="flex flex-col items-center gap-2 w-full max-w-[280px] sm:max-w-xs">
            <span
              className={`font-sans text-xs transition-colors duration-300 ${submitted ? 'text-emerald-500 font-medium' : 'text-zinc-500'}`}
            >
              {submitted ? '✓ Thank you! You will be notified.' : 'Get notified'}
            </span>
            <form onSubmit={handleSubmit} className="flex w-full items-center gap-2">
              <input
                type="email"
                placeholder="Email address"
                required
                disabled={loading || submitted}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-9 flex-1 rounded-lg border border-zinc-800 bg-zinc-900/30 px-3 text-sm text-zinc-200 placeholder-zinc-600 outline-none focus:border-zinc-700 transition-colors disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={loading || submitted}
                className={`h-9 rounded-lg px-4 text-sm font-semibold transition-all duration-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                  submitted
                    ? 'bg-emerald-600 text-white'
                    : loading
                      ? 'bg-zinc-700 text-zinc-300'
                      : 'bg-zinc-100 text-zinc-950 hover:bg-zinc-200'
                }`}
              >
                {loading ? 'Sending...' : submitted ? 'Sent' : 'Notify'}
              </button>
            </form>
            <button
              {...{ placeholder: 'Send Attachment' }}
              onClick={handleSendAttachment}
              disabled={loading || submitted || !email}
              className="h-9 w-full rounded-lg border border-zinc-800 bg-zinc-900/30 text-sm text-zinc-400 hover:bg-zinc-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Sending...' : submitted ? 'Sent' : 'Send Attachment'}
            </button>
            <div className="flex w-full items-center gap-2">
              <select
                value={scheduleMinutes}
                onChange={(e) => setScheduleMinutes(Number(e.target.value))}
                className="h-9 rounded-lg border border-zinc-800 bg-[#0f0f12] px-2 text-sm text-zinc-400 focus:border-zinc-700 outline-none transition-colors cursor-pointer"
              >
                <option value={1} className="bg-zinc-950">
                  1 min
                </option>
                <option value={3} className="bg-zinc-950">
                  3 min
                </option>
                <option value={5} className="bg-zinc-950">
                  5 min
                </option>
              </select>
              <button
                {...{ placeholder: 'Schedule Email' }}
                onClick={handleScheduleEmail}
                disabled={loading || submitted || !email}
                className="h-9 flex-1 rounded-lg border border-zinc-800 bg-zinc-900/30 text-sm text-zinc-400 hover:bg-zinc-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Scheduling...' : submitted ? 'Scheduled' : 'Schedule Email'}
              </button>
            </div>
            <button
              {...{ placeholder: 'Send Inline Image' }}
              onClick={handleSendInlineImage}
              disabled={loading || submitted || !email}
              className="h-9 w-full rounded-lg border border-zinc-800 bg-zinc-900/30 text-sm text-zinc-400 hover:bg-zinc-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Sending...' : submitted ? 'Sent' : 'Send Inline Image'}
            </button>
            <button
              {...{ placeholder: 'Open Tracking' }}
              onClick={handleOpenTracking}
              disabled={loading || submitted || !email}
              className="h-9 w-full rounded-lg border border-zinc-800 bg-zinc-900/30 text-sm text-zinc-400 hover:bg-zinc-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Sending...' : submitted ? 'Sent' : 'Open Tracking'}
            </button>
            <button
              {...{ placeholder: 'Send Bulk Email' }}
              onClick={handleSendBulk}
              disabled={loading || submitted}
              className="h-9 w-full rounded-lg border border-zinc-800 bg-zinc-900/30 text-sm text-zinc-400 hover:bg-zinc-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2 border-dashed"
            >
              {loading ? 'Sending...' : submitted ? 'Sent' : 'Send Bulk Email'}
            </button>
          </div>

          {/* Separation line */}
          <div className="hidden md:block w-[1px] bg-zinc-800/40 my-2 shrink-0" />
          <div className="block md:hidden w-full h-[1px] bg-zinc-800/40 my-2 shrink-0" />

          {/* Simulator Info Card */}
          <div className="flex flex-col items-start gap-3 w-full max-w-[280px] sm:max-w-xs border border-zinc-800/80 bg-zinc-900/10 rounded-xl p-4 text-left font-sans select-none shrink-0 justify-center">
            <span className="text-zinc-500 text-xs font-mono uppercase tracking-wider">
              Testing Simulator
            </span>
            <p className="text-[11px] text-zinc-500 leading-relaxed">
              Use these simulator addresses to test different delivery statuses and trigger webhook
              events without sending emails to real users.
            </p>
            <div className="w-full space-y-2 mt-2 font-mono text-xs">
              {[
                {
                  email: 'delivered@resend.dev',
                  event: 'Delivered',
                  color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
                },
                {
                  email: 'bounced@resend.dev',
                  event: 'Bounced',
                  color: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
                },
                {
                  email: 'complained@resend.dev',
                  event: 'Complained/Spam',
                  color: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
                },
                {
                  email: 'suppressed@resend.dev',
                  event: 'Suppressed',
                  color: 'bg-zinc-800/50 text-zinc-400 border-zinc-800',
                },
              ].map((item) => (
                <button
                  key={item.email}
                  onClick={() => handleCopy(item.email)}
                  className="w-full flex items-center justify-between p-2 rounded-lg border border-zinc-800 bg-zinc-900/30 hover:bg-zinc-800/40 hover:border-zinc-700 transition-all text-left cursor-pointer group"
                >
                  <div className="truncate pr-2">
                    <span className="text-zinc-300 group-hover:text-zinc-100 transition-colors block text-[11px] truncate">
                      {copiedText === item.email ? 'Copied ✓' : item.email}
                    </span>
                    <span className="text-zinc-600 block text-[9px] mt-0.5">Click to copy</span>
                  </div>
                  <span
                    className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-sans border shrink-0 ${item.color}`}
                  >
                    {item.event}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-8 right-8 text-xs font-mono text-zinc-800">
        © {new Date().getFullYear()}
      </div>
    </main>
  )
}
