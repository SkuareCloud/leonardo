"use client"

import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { CopyIcon } from "lucide-react"
import { toast } from "sonner"

export const CopyableTrimmedId = ({ id }: { id: string }) => {
    return (
        <div className="flex items-center gap-2">
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <div className="flex items-center gap-2">
                            <span className="text-gray-500">{id.split("-")[0]}...</span>
                            <span className="text-gray-500">{id.split("-")[1]}</span>
                        </div>
                    </TooltipTrigger>
                    <TooltipContent>
                        <div className="flex items-center gap-2">
                            <span>{id}</span>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={(e) => {
                                    e.stopPropagation()
                                    navigator.clipboard.writeText(id)
                                    toast.success("ID copied to clipboard")
                                    const tooltip = e.currentTarget.closest('[role="tooltip"]')
                                    if (tooltip) {
                                        tooltip.remove()
                                    }
                                }}
                            >
                                <CopyIcon className="h-3 w-3" />
                            </Button>
                        </div>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        </div>
    )
}
