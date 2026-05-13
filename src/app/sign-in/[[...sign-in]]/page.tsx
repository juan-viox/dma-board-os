import { SignIn } from '@clerk/nextjs'
import { DmaLogo } from '@/components/ui/DmaLogo'
import Link from 'next/link'

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-navy text-cream flex flex-col items-center justify-center p-6">
      <Link href="/" className="flex items-center gap-3 mb-8">
        <DmaLogo className="h-14 w-14 text-saffron" />
        <div>
          <div className="font-display text-saffron text-2xl">VioX AI</div>
          <div className="eyebrow text-cream/60 text-[10px]">DMA · BOARD OS</div>
        </div>
      </Link>
      <SignIn
        appearance={{
          elements: {
            rootBox: 'mx-auto',
            card: 'bg-cream border border-saffron/30',
            headerTitle: 'font-display text-navy',
            socialButtonsBlockButton: 'bg-navy text-cream hover:bg-navy-dark',
            formButtonPrimary: 'bg-saffron text-navy hover:bg-saffron-soft',
          },
        }}
      />
    </div>
  )
}
