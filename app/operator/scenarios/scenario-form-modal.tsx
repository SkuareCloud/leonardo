"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { AvatarModelWithProxy } from "@lib/api/avatars/types.gen"
import { Scenario } from "@lib/api/operator"
import { PlayIcon, PlusIcon } from "lucide-react"
import { useState } from "react"
import { ScenarioForm } from "./scenario-form"

interface ScenarioFormModalProps {
  avatars: AvatarModelWithProxy[]
  trigger?: React.ReactNode
  title?: string
  description?: string
  isNew?: boolean
  initialScenario?: Scenario
}

export function ScenarioFormModal({
  avatars,
  trigger,
  title = "Create New Scenario",
  description = "Configure a new scenario with multiple actions",
  isNew = true,
  initialScenario,
}: ScenarioFormModalProps) {
  const [open, setOpen] = useState(false)

  const defaultTrigger = isNew ? (
    <Button>
      <PlusIcon className="h-4 w-4 mr-2" />
      New Scenario
    </Button>
  ) : (
    <Button>
      <PlayIcon className="h-4 w-4 mr-2" />
      Replay Scenario
    </Button>
  )

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger || defaultTrigger}</DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="mt-4">
          <ScenarioForm avatars={avatars} initialScenario={initialScenario} />
        </div>
      </DialogContent>
    </Dialog>
  )
}
