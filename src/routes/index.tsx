import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
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
        to: 'annes@gmail.com',
        subject: 'Thank you for connecting!',
        text: `Hi,\n\nThank you for signing up to get notified! I will keep you updated on the progress of yohanesray.com.\n\nBest regards,\nYohanes Ray`,
      },
      {
        from: 'Yohanes Ray <me@mail.yohanesray.com>',
        to: 'annessilitonga21@gmail.com',
        subject: 'Thank you for connecting!',
        text: `Hi,\n\nThank you for signing up to get notified! I will keep you updated on the progress of yohanesray.com.\n\nBest regards,\nYohanes Ray`,
      },
    ])

    if (error) return { success: false, error: error.message }
    return { success: true }
  } catch (err: any) {
    console.error('Error sending batch emails:', err)
    return { success: false, error: err.message || 'Failed to send batch emails' }
  }
})

const sendAttachmentEmail = createServerFn({ method: 'POST' }).handler(async () => {
  try {
    const resend = getResendClient()
    const fileContent = await getBase64Attachment()

    const { error } = await resend.emails.send({
      from: 'Yohanes Ray <me@mail.yohanesray.com>',
      to: 'annessilitonga21@gmail.com',
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
  .inputValidator((minutes: unknown) => {
    if (typeof minutes !== 'number') {
      throw new Error('Invalid minutes value')
    }
    return minutes
  })
  .handler(async ({ data: minutes }) => {
    try {
      const resend = getResendClient()
      const scheduledTime = new Date(Date.now() + 1000 * 60 * minutes).toISOString()

      const { error } = await resend.emails.send({
        from: 'Yohanes Ray <me@mail.yohanesray.com>',
        to: 'annessilitonga21@gmail.com',
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

const sendInlineImageEmail = createServerFn({ method: 'POST' }).handler(async () => {
  try {
    const resend = getResendClient()
    const fileContent = await getBase64Attachment()

    const { error } = await resend.emails.send({
      from: 'Yohanes Ray <me@mail.yohanesray.com>',
      to: 'annessilitonga21@gmail.com',
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

export const Route = createFileRoute('/')({ component: RouteComponent })

function RouteComponent() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [scheduleMinutes, setScheduleMinutes] = useState(1)

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
    void executeEmailAction(sendAttachmentEmail)
  }
  const handleScheduleEmail = () => {
    void executeEmailAction(() => scheduleEmail({ data: scheduleMinutes }))
  }
  const handleSendInlineImage = () => {
    void executeEmailAction(sendInlineImageEmail)
  }

  return (
    <main className="relative flex min-h-screen w-full flex-col items-center bg-[#0a0a0c] px-6 text-center select-none overflow-hidden">
      {/* Top Spacer to balance the bottom form and keep content centered */}
      <div className="flex-1" />

      {/* Centered Content Container */}
      <div className="z-10 flex flex-col items-center justify-center gap-6">
        {/* Title / Domain */}
        <h1 className="animate-fade-in-up font-serif text-5xl md:text-7xl font-light tracking-tight text-zinc-100 transition-all duration-700 hover:tracking-wide">
          yohanesray
          <span className="text-zinc-500 font-sans text-3xl md:text-4xl font-light">.com</span>
        </h1>

        {/* Minimal Divider */}
        <div className="animate-fade-in-up animation-delay-200 h-[1px] w-12 bg-zinc-800" />

        {/* Coming Soon Subtitle */}
        <p className="animate-fade-in-up animation-delay-400 font-sans text-xs md:text-sm font-medium tracking-[0.3em] uppercase text-zinc-500 hover:text-zinc-400 transition-colors duration-300">
          Coming Soon
        </p>
      </div>

      {/* Bottom Spacer containing the Form at the end of view */}
      <div className="flex-1 flex flex-col justify-end pb-16 w-full items-center z-10">
        {/* Form & Label Container */}
        <div className="animate-fade-in-up animation-delay-400 flex flex-col items-center gap-2 w-full max-w-[280px] sm:max-w-xs">
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
            {...{ placeholder: 'Send Bulk Email' }}
            onClick={handleSendBulk}
            disabled={loading || submitted}
            className="h-9 w-full rounded-lg border border-zinc-800 bg-zinc-900/30 text-sm text-zinc-400 hover:bg-zinc-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Sending...' : submitted ? 'Sent' : 'Send Bulk Email'}
          </button>
          <button
            {...{ placeholder: 'Send Attachment' }}
            onClick={handleSendAttachment}
            disabled={loading || submitted}
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
              disabled={loading || submitted}
              className="h-9 flex-1 rounded-lg border border-zinc-800 bg-zinc-900/30 text-sm text-zinc-400 hover:bg-zinc-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Scheduling...' : submitted ? 'Scheduled' : 'Schedule Email'}
            </button>
          </div>
          <button
            {...{ placeholder: 'Send Inline Image' }}
            onClick={handleSendInlineImage}
            disabled={loading || submitted}
            className="h-9 w-full rounded-lg border border-zinc-800 bg-zinc-900/30 text-sm text-zinc-400 hover:bg-zinc-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Sending...' : submitted ? 'Sent' : 'Send Inline Image'}
          </button>
        </div>
      </div>

      {/* Decorative Subtle Corner Accents to frame the page without using a gradient background */}
      <div className="absolute top-8 left-8 text-xs font-mono text-zinc-800">[SYS_INIT]</div>
      <div className="absolute bottom-8 right-8 text-xs font-mono text-zinc-800">
        © {new Date().getFullYear()}
      </div>
    </main>
  )
}
