import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({ component: RouteComponent })

function RouteComponent() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    setSubmitted(true)
    setEmail('')

    // Reset success message after 4 seconds
    setTimeout(() => {
      setSubmitted(false)
    }, 4000)
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
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-9 flex-1 rounded-lg border border-zinc-800 bg-zinc-900/30 px-3 text-sm text-zinc-200 placeholder-zinc-600 outline-none focus:border-zinc-700 transition-colors"
            />
            <button
              type="submit"
              className={`h-9 rounded-lg px-4 text-sm font-semibold transition-all duration-300 cursor-pointer ${
                submitted
                  ? 'bg-emerald-600 text-white'
                  : 'bg-zinc-100 text-zinc-950 hover:bg-zinc-200'
              }`}
            >
              {submitted ? 'Sent' : 'Notify'}
            </button>
          </form>
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
