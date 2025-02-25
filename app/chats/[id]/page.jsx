'use client'

import React, { useEffect, useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { getDbData } from '@/app/actions/chat'
import { submitChat } from '@/app/actions/chatAction'
import ChatPanel from '@/app/_components/ChatPanel'
import { Loader2, ArrowLeft } from 'lucide-react'
import SchemaViewer from '@/app/_components/SchemaViewer'
import { useRateLimit } from '@/hooks/use-rate-limit'

const Page = () => {
  const { id } = useParams()
  const router = useRouter()
  const chatPanelRef = useRef(null)
  
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [input, setInput] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { isRateLimited, cooldownTimer, checkRateLimit } = useRateLimit();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await getDbData(id)
        setData(result)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [id])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!input.trim() || isSubmitting || isRateLimited) return

    const canProceed = await checkRateLimit()
    if (!canProceed) return

    setIsSubmitting(true)
    setInput('')
    
    try {
      if (chatPanelRef.current) {
        const formData = new FormData()
        formData.append('input', input)
        formData.append('connectionId', id)
        
        await chatPanelRef.current.handleSubmit(input)
      }
    } catch (err) {
      setError('Failed to send message')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <Loader2 className="w-8 h-8 animate-spin text-red-500" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white p-4">
        <div className="text-center p-6 md:p-8 rounded-lg border border-red-200 bg-red-50 max-w-md w-full">
          <p className="text-red-600 font-medium text-sm md:text-base">Error: {error}</p>
          <button
            onClick={() => router.push('/chats')}
            className="mt-4 text-red-500 hover:text-red-600 flex items-center gap-2 mx-auto text-sm md:text-base"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Chats
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white relative">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 bg-white border-b z-10">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => router.push('/chats')}
            className="text-gray-600 hover:text-gray-800 flex items-center gap-2 transition-colors text-sm md:text-base"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back to Chats</span>
          </button>
          <SchemaViewer data={data} />
        </div>
      </div>

      {/* Chat Area */}
      <div className="max-w-4xl mx-auto px-4 pt-16 pb-32">
        <ChatPanel 
          ref={chatPanelRef}
          connectionId={id} 
          className="min-h-[calc(100vh-240px)]"
        />
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="fixed bottom-0 left-0 right-0 bg-white border-t p-3 md:p-4 shadow-lg">
        <div className="max-w-4xl mx-auto flex gap-2 md:gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question..."
            className="flex-1 p-2 md:p-3 text-sm md:text-base border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
            disabled={isSubmitting}
          />
          <button 
            type="submit"
            disabled={isSubmitting || !input.trim() || isRateLimited}
            className="px-4 md:px-5 py-2 md:py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 text-sm md:text-base whitespace-nowrap"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 md:w-5 md:h-5 animate-spin" />
                <span className="hidden sm:inline">Sending...</span>
              </>
            ) : isRateLimited ? (
              <>
                <span className="hidden sm:inline">Wait {cooldownTimer}s</span>
                <span className="sm:hidden">{cooldownTimer}s</span>
              </>
            ) : (
              <>
                <span className="hidden sm:inline">Send</span>
                <span className="sm:hidden">→</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

export default Page