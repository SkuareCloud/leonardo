import { useOperatorStore } from "@lib/store-provider"
import { useEffect, useState } from "react"

export const useSettings = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  
  const maxSlots = useOperatorStore(state => state.maxSlots)
  const setMaxSlots = useOperatorStore(state => state.setMaxSlots)
  const operatorSlot = useOperatorStore(state => state.operatorSlot)
  const setOperatorSlot = useOperatorStore(state => state.setOperatorSlot)

  // Load settings from backend
  const loadSettings = async () => {
    try {
      const response = await fetch('/api/settings')
      if (response.ok) {
        const settings = await response.json()
        setMaxSlots(settings.maxSlots)
        setOperatorSlot(settings.operatorSlot)
        setIsInitialized(true)
      }
    } catch (error) {
      console.error("Error loading settings:", error)
    }
  }

  // Save settings to backend
  const saveSettings = async (settings: { maxSlots?: number; operatorSlot?: number }) => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/settings', {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(settings),
      })

      if (!response.ok) {
        throw new Error(`Failed to save settings: ${response.statusText}`)
      }

      const updatedSettings = await response.json()
      
      // Update store with the response from backend
      if (updatedSettings.maxSlots !== undefined) {
        setMaxSlots(updatedSettings.maxSlots)
      }
      if (updatedSettings.operatorSlot !== undefined) {
        setOperatorSlot(updatedSettings.operatorSlot)
      }

      return updatedSettings
    } catch (error) {
      console.error("Error saving settings:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  // Load settings on mount
  useEffect(() => {
    if (!isInitialized) {
      loadSettings()
    }
  }, [isInitialized])

  return {
    maxSlots,
    operatorSlot,
    isLoading,
    isInitialized,
    saveSettings,
    loadSettings,
  }
} 