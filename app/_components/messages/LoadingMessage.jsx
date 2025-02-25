'use client'

import { Loader2 } from 'lucide-react'

export const LoadingMessage = () => {
  return (
    <div className="py-4 px-6">
      <div className="flex items-center gap-2 text-gray-500">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span className="text-sm">Processing your request...</span>
      </div>
    </div>
  )
} 