import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: Home,
})

function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="text-center">
        <p className="text-sm text-neutral-500">yohanesray.com</p>
        <h1 className="mt-3 text-xl font-medium tracking-[0.35em] text-neutral-900">COMING SOON</h1>
      </div>
    </main>
  )
}
