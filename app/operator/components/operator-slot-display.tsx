"use client"

import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useSettings } from "@lib/hooks/use-settings"
import { ChevronDown, Monitor } from "lucide-react"

interface OperatorSlotDisplayProps {
  readOnly?: boolean
}

export const OperatorSlotDisplay = ({ readOnly = false }: OperatorSlotDisplayProps) => {
  const { operatorSlot, maxSlots, saveSettings } = useSettings()

  const handleSlotChange = async (slot: number) => {
    try {
      await saveSettings({ operatorSlot: slot })
    } catch (error) {
      console.error("Error changing operator slot:", error)
      // You might want to show a toast notification here
    }
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1 text-sm text-muted-foreground">
        <Monitor className="h-4 w-4" />
        <span>Operator Slot:</span>
      </div>
      {readOnly ? (
        <div className="px-3 py-1.5 text-sm font-medium border rounded-md bg-muted">{operatorSlot}</div>
      ) : (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="min-w-[80px]">
              <span className="font-medium">{operatorSlot}</span>
              <ChevronDown className="h-3 w-3 ml-1" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {Array.from({ length: maxSlots }, (_, i) => i + 1).map(slot => (
              <DropdownMenuItem
                key={slot}
                onClick={() => handleSlotChange(slot)}
                className={slot === operatorSlot ? "bg-accent" : ""}
              >
                Slot {slot}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  )
}
