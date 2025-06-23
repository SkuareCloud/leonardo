"use client"

import { Button } from "@/components/ui/button"
import { Scenario } from "@lib/api/operator"
import { logger } from "@lib/logger"
import { useOperatorStore } from "@lib/store-provider"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"

export const ReplayScenarioButton = ({ scenario }: { scenario: Scenario }) => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const operatorSlot = useOperatorStore(state => state.operatorSlot)
  const router = useRouter()

  const handleSubmit = async () => {
    setIsSubmitting(true)

    try {
      const response = await fetch(`/api/operator/${operatorSlot}/scenario`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...scenario,
          id: undefined,
          actions: scenario.actions.map(action => ({
            ...action,
            id: undefined,
          })),
        }),
      })

      if (!response.ok) {
        toast.error("Failed to create scenario")
        logger.error(response)
        return
      }

      const newScenario: Scenario = await response.json()

      toast.success("Scenario created successfully")
      router.push(`/operator/scenarios/${newScenario.id}`)
    } catch (error) {
      toast.error("Failed to create scenario")
      logger.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Button onClick={handleSubmit} disabled={isSubmitting}>
      {isSubmitting ? "Replaying..." : "Replay Scenario"}
    </Button>
  )
}
