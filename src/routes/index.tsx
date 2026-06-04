import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({ component: RouteComponent })

function RouteComponent() {
  return (
    <main className="relative flex min-h-screen w-full flex-col items-center justify-center bg-[#0a0a0c] px-6 text-center select-none overflow-hidden">
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

      {/* Decorative Subtle Corner Accents to frame the page without using a gradient background */}
      <div className="absolute top-8 left-8 text-xs font-mono text-zinc-800">[SYS_INIT]</div>
      <div className="absolute bottom-8 right-8 text-xs font-mono text-zinc-800">
        © {new Date().getFullYear()}
      </div>
    </main>
  )
}
