'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { RefreshCw } from 'lucide-react'
import { toast } from 'sonner'

const SyncButton = ({ connectionId }) => {
  const [isSyncing, setIsSyncing] = useState(false)

  const handleSync = async (e) => {
    // Stop event propagation to prevent parent onClick from firing
    e.stopPropagation()
    
    if (isSyncing) return
    
    setIsSyncing(true)
    toast.info('Starting data sync...')
    
    try {
      const response = await fetch('/api/syncData', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ connectionId }),
      })
      
      const result = await response.json()
      
      if (result.success) {
        if (result.tablesUpdated > 0 || result.collectionsUpdated > 0) {
          toast.success(`Sync completed! Updated ${result.tablesUpdated || result.collectionsUpdated} tables with ${result.rowsAdded || result.documentsAdded} new records.`)
        } else {
          toast.success('Sync completed! No new data found.')
        }
      } else {
        toast.error(`Sync failed: ${result.error}`)
      }
    } catch (error) {
      console.error('Error syncing data:', error)
      toast.error('Failed to sync data. Please try again.')
    } finally {
      setIsSyncing(false)
    }
  }

  return (
    <Button 
      onClick={handleSync} 
      disabled={isSyncing}
      variant="outline"
      size="sm"
      className="flex items-center gap-2"
      // Add this to prevent the click from bubbling up to parent elements
      onMouseDown={(e) => e.stopPropagation()}
      onTouchStart={(e) => e.stopPropagation()}
    >
      <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
      {isSyncing ? 'Syncing...' : 'Sync New Data'}
    </Button>
  )
}

export default SyncButton 