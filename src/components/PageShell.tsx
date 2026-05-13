import { Navbar } from '@/components/nav/Navbar'
import { Footer } from '@/components/nav/Footer'

export function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main className="pt-24">{children}</main>
      <Footer />
    </>
  )
}
