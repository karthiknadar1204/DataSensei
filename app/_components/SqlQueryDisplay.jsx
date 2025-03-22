'use client'

import React, { useState } from 'react'
import { Copy, Check, Code } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

const SqlQueryDisplay = ({ sqlQuery }) => {
  const [copied, setCopied] = useState(false)

  if (!sqlQuery) return null

  const handleCopy = async () => {
    await navigator.clipboard.writeText(sqlQuery.query)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Card className="mt-4 border-blue-100 bg-blue-50">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Code className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-lg text-blue-700">SQL Query</CardTitle>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleCopy}
            className="h-8 px-2 text-blue-700 hover:bg-blue-100"
          >
            {copied ? (
              <Check className="h-4 w-4" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
            <span className="ml-1">{copied ? 'Copied!' : 'Copy'}</span>
          </Button>
        </div>
        <CardDescription className="text-blue-600">
          {sqlQuery.dialect} dialect
        </CardDescription>
      </CardHeader>
      <CardContent>
        <pre className="bg-blue-900 text-blue-50 p-4 rounded-md overflow-x-auto">
          <code>{sqlQuery.query}</code>
        </pre>
        {sqlQuery.explanation && (
          <div className="mt-3 text-sm text-blue-700">
            <p className="font-medium mb-1">Explanation:</p>
            <p>{sqlQuery.explanation}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default SqlQueryDisplay 