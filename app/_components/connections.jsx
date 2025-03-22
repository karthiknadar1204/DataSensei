"use client"

import { useEffect, useState } from "react"
import { useUser } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { Database, ArrowRight } from "lucide-react"
import { motion } from "framer-motion"
import SyncButton from './SyncButton'

const Connections = ({ refreshTrigger = 0 }) => {
  const router = useRouter()
  const { user } = useUser()
  const [connections, setConnections] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchConnections = async () => {
      try {
        const response = await fetch("/api/connections")
        if (!response.ok) {
          throw new Error("Failed to fetch connections")
        }
        const data = await response.json()
        setConnections(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchConnections()
    }
  }, [user, refreshTrigger])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-72">
        <div className="text-xl text-red-500 animate-pulse">Loading connections...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-72">
        <div className="text-xl text-red-500">Error: {error}</div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {connections.length === 0 ? (
        <div className="col-span-full flex items-center justify-center h-72">
          <p className="text-xl text-gray-500">No connections found</p>
        </div>
      ) : (
        connections.map((connection, index) => (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            key={connection.id}
            className="w-72 h-72 group relative overflow-hidden bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            <div className="h-full flex flex-col">
              <div className="p-6 border-b border-red-100 relative">
                <div className="absolute top-4 right-4">
                  <SyncButton connectionId={connection.id} />
                </div>
                
                <Database className="w-8 h-8 text-red-400 mb-3" />
                <h3 className="text-2xl font-bold text-gray-900 group-hover:text-red-600 transition-colors pr-20">
                  {connection.connectionName}
                </h3>
                <p>{connection.dbType}</p>
              </div>

              <div 
                className="flex-1 p-6 flex flex-col items-center justify-center group-hover:bg-red-50/50 transition-colors cursor-pointer"
                onClick={() => router.push(`/chats/${connection.id}`)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    router.push(`/chats/${connection.id}`)
                  }
                }}
              >
                <p className="text-gray-600 text-center mb-4">Click to open connection</p>
                <ArrowRight className="w-6 h-6 text-red-400 transform group-hover:translate-x-2 transition-transform" />
              </div>
            </div>
          </motion.div>
        ))
      )}
    </div>
  )
}

export default Connections

