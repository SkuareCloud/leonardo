"use client"

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useSettings } from "@lib/hooks/use-settings"
import { useOperatorStore } from "@lib/store-provider"
import { Settings } from "lucide-react"
import { useEffect, useState } from "react"
import { useOperatorSettings } from "./operator-keyboard-provider"

interface OperatorSettingsProps {
  showTrigger?: boolean
}

export const OperatorSettings = ({ showTrigger = true }: OperatorSettingsProps) => {
  const [tempMaxSlots, setTempMaxSlots] = useState(1)
  
  const { maxSlots, isLoading, saveSettings } = useSettings()
  const setMaxSlots = useOperatorStore(state => state.setMaxSlots)
  const { isSettingsOpen, openSettings, closeSettings } = useOperatorSettings()

  // Update temp value when modal opens
  useEffect(() => {
    if (isSettingsOpen) {
      setTempMaxSlots(maxSlots)
    }
  }, [isSettingsOpen, maxSlots])

  const handleOpen = () => {
    setTempMaxSlots(maxSlots)
    openSettings()
  }

  const handleSave = async () => {
    try {
      await saveSettings({ maxSlots: tempMaxSlots })
      closeSettings()
    } catch (error) {
      // You might want to show a toast notification here
      alert("Failed to save settings. Please try again.")
    }
  }

  const handleCancel = () => {
    closeSettings()
  }

  return (
    <Dialog open={isSettingsOpen} onOpenChange={(open) => open ? openSettings() : closeSettings()}>
      {showTrigger && (
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" onClick={handleOpen}>
            <Settings className="h-4 w-4" />
            Operator Settings
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Operator Settings</DialogTitle>
          <DialogDescription>Configure operator settings. Changes will be applied immediately.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="max-slots" className="text-right">
              Max Operator Slots
            </Label>
            <Input
              id="max-slots"
              type="number"
              min="1"
              value={tempMaxSlots}
              onChange={e => setTempMaxSlots(parseInt(e.target.value) || 1)}
              className="col-span-3"
              disabled={isLoading}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleCancel} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
