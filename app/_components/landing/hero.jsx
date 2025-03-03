'use client'

import { SignInButton, SignedIn, SignedOut, useUser } from '@clerk/nextjs'
import { useEffect } from 'react'
import { StoreUser } from '@/app/actions/user'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

export default function Hero() {
  const { user, isLoaded } = useUser()
  const router = useRouter()

  useEffect(() => {
    const syncUser = async () => {
      if (user) {
        await StoreUser(
          user.id,
          user.firstName || user.username || 'User',
          user.emailAddresses[0]?.emailAddress || ''
        )
      }
    }
    
    if (isLoaded && user) {
      syncUser()
    }
  }, [user, isLoaded])

  return (
    <section className="w-full bg-[#111] py-12 md:py-24 lg:py-32">
      <div className="container mx-auto px-4 max-w-[1200px]">
        <div className="flex flex-col items-center text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 md:mb-6 max-w-4xl">
            Chat With Your Database <span className="text-red-500">Visually</span>
          </h1>
          <p className="text-gray-300 text-base sm:text-lg md:text-xl max-w-2xl mx-auto mb-6 md:mb-8">
            Transform your PostgreSQL and MongoDB data into interactive visualizations through natural language conversations
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <SignedOut>
              <SignInButton mode="modal">
                <button className="bg-red-500 hover:bg-red-600 text-white w-full sm:w-auto px-8">
                  Get Started
                </button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <button 
                onClick={() => router.push('/chats')}
                className="bg-red-500 hover:bg-red-600 text-white w-full sm:w-auto px-8"
              >
                Go to Dashboard
              </button>
            </SignedIn>
            <Button size="lg" variant="outline" className="bg-black border-white text-white hover:bg-white hover:text-black w-full sm:w-auto">
              Learn More
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
