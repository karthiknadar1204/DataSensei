'use client'

import React, { useState } from 'react'
import { Copy, Check, Code } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

const SqlQueryDisplay = ({ sqlQuery }) => {
  const [copied, setCopied] = useState(false)
  const [expanded, setExpanded] = useState(false)

  if (!sqlQuery) return null

  const handleCopy = async () => {
    await navigator.clipboard.writeText(sqlQuery.query)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Check if there are execution results
  const hasResults = sqlQuery.executionResult?.success && 
                    sqlQuery.executionResult?.data?.length > 0

  return (
    <Card className="mt-3 border-blue-100 bg-blue-50/70 shadow-sm max-w-[85%]">
      <CardHeader className="pb-2 px-3 pt-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Code className="h-4 w-4 text-blue-600" />
            <CardTitle className="text-sm text-blue-700">SQL Query</CardTitle>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleCopy}
            className="h-6 px-2 text-blue-700 hover:bg-blue-100"
          >
            {copied ? (
              <Check className="h-3 w-3" />
            ) : (
              <Copy className="h-3 w-3" />
            )}
            <span className="ml-1 text-xs">{copied ? 'Copied!' : 'Copy'}</span>
          </Button>
        </div>
        {sqlQuery.dialect && (
          <CardDescription className="text-blue-600 text-xs mt-0.5">
            {sqlQuery.dialect} dialect
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="px-3 pb-2.5 pt-0">
        <div className={`${expanded ? 'max-h-80' : 'max-h-28'} overflow-y-auto transition-all duration-300`}>
          <pre className="bg-blue-900 text-blue-50 p-2.5 rounded-md overflow-x-auto text-xs">
            <code>{sqlQuery.query}</code>
          </pre>
        </div>
        
        {sqlQuery.query.length > 150 && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setExpanded(!expanded)}
            className="mt-1 text-xs text-blue-700 h-5 px-2"
          >
            {expanded ? 'Show Less' : 'Show More'}
          </Button>
        )}
        
        {sqlQuery.explanation && (
          <div className="mt-2 text-xs text-blue-700 border-t border-blue-100 pt-2">
            <p className="font-medium mb-0.5 text-xs">Explanation:</p>
            <p className="text-blue-600 text-xs">{sqlQuery.explanation}</p>
          </div>
        )}
        
        {hasResults && (
          <div className="mt-2 text-xs border-t border-blue-100 pt-2">
            <p className="font-medium text-blue-700 text-xs">
              Results: {sqlQuery.executionResult.data.length} rows
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default SqlQueryDisplay 