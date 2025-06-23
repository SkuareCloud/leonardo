"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { OperatorSettings } from "./operator-settings"

// Context for managing operator settings modal state
interface OperatorSettingsContextType {
  isSettingsOpen: boolean
  openSettings: () => void
  closeSettings: () => void
}

const OperatorSettingsContext = createContext<OperatorSettingsContextType | undefined>(undefined)

export const useOperatorSettings = () => {
  const context = useContext(OperatorSettingsContext)
  if (!context) {
    throw new Error("useOperatorSettings must be used within OperatorKeyboardProvider")
  }
  return context
}

interface OperatorKeyboardProviderProps {
  children: React.ReactNode
}

export const OperatorKeyboardProvider = ({ children }: OperatorKeyboardProviderProps) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)

  const openSettings = () => setIsSettingsOpen(true)
  const closeSettings = () => setIsSettingsOpen(false)

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Check for Command (Mac) or Control (Windows/Linux) + J
      if ((event.metaKey || event.ctrlKey) && event.key === 'j') {
        event.preventDefault()
        openSettings()
      }
    }

    // Add event listener to the document
    document.addEventListener('keydown', handleKeyDown)

    // Cleanup on unmount
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  return (
    <OperatorSettingsContext.Provider value={{ isSettingsOpen, openSettings, closeSettings }}>
      {children}
      <OperatorSettings showTrigger={false} />
    </OperatorSettingsContext.Provider>
  )
} 