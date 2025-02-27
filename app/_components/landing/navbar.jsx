'use client'

import Link from "next/link"
import Image from "next/image"
import { SignInButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { Menu, X } from 'lucide-react'
import { useState } from 'react'

export default function Navbar() {
  const router = useRouter()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const navItems = [
    ["Home", "/"],
    ["Features", "/features"], 
    ["Connect DB", "/connect"],
    ["Chat", "/chat"],
    ["Visualize", "/visualize"],
    ["Docs", "/docs"],
    ["Examples", "/examples"],
    ["Pricing", "/pricing"],
    ["Contact", "/contact"],
  ]

  return (
    <nav className="w-full bg-white border-b relative">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Image 
            src="/Data_logo.jpeg"
            alt="DataSensei Logo"
            width={40}
            height={40}
            className="rounded-full"
          />
          <span className="text-2xl font-bold text-red-600">DataSensei</span>
        </Link>

        {/* Mobile menu button */}
        <button 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden"
        >
          {isMenuOpen ? (
            <X className="h-6 w-6 text-gray-600" />
          ) : (
            <Menu className="h-6 w-6 text-gray-600" />
          )}
        </button>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-8">
          {navItems.map(([label, href]) => (
            <Link 
              key={label} 
              href={href} 
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              {label}
            </Link>
          ))}

          <SignedOut>
            <SignInButton mode="modal">
              <button type="button" className="rounded-full bg-red-500 text-white px-4 py-2 text-sm hover:bg-red-600">
                Sign In
              </button>
            </SignInButton>
          </SignedOut>

          <SignedIn>
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => router.push('/chats')}
                className="rounded-full bg-red-500 text-white px-4 py-2 text-sm hover:bg-red-600"
              >
                Chat
              </button>
              <UserButton afterSignOutUrl="/" />
            </div>
          </SignedIn>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="absolute top-16 left-0 right-0 bg-white border-b md:hidden z-50">
            <div className="flex flex-col p-4 space-y-4">
              {navItems.map(([label, href]) => (
                <Link
                  key={label}
                  href={href}
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {label}
                </Link>
              ))}
              
              <SignedOut>
                <SignInButton mode="modal">
                  <button type="button" className="w-full rounded-full bg-red-500 text-white px-4 py-2 text-sm hover:bg-red-600">
                    Sign In
                  </button>
                </SignInButton>
              </SignedOut>

              <SignedIn>
                <div className="flex flex-col gap-4">
                  <button
                    type="button"
                    onClick={() => {
                      router.push('/chats')
                      setIsMenuOpen(false)
                    }}
                    className="w-full rounded-full bg-red-500 text-white px-4 py-2 text-sm hover:bg-red-600"
                  >
                    Chat
                  </button>
                  <UserButton afterSignOutUrl="/" />
                </div>
              </SignedIn>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
