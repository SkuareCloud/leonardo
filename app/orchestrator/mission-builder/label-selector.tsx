import { Combobox } from "@/components/combobox"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { TooltipContent } from "@radix-ui/react-tooltip"
import { PlusCircleIcon, XIcon } from "lucide-react"
import { useState } from "react"

export function LabelSelector({
  defaultSelected,
  choices,
  onChangeValue,
}: {
  defaultSelected: { id: string; label: string }[]
  choices: { id: string; label: string }[]
  onChangeValue?: (selected: { id: string; label: string }[]) => void
}) {
  const [selected, setSelected] = useState<{ id: string; label: string }[]>(defaultSelected)
  const [isAdding, setIsAdding] = useState(false)

  const availableChoices = choices.filter(choice => !selected.some(s => s.id === choice.id))

  function handleChangeSelected(selected: { id: string; label: string }[]) {
    setSelected(selected)
    onChangeValue?.(selected)
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-4 select-none items-center">
        {!isAdding && availableChoices.length > 0 && (
          <div
            className="flex items-center justify-center p-2 cursor-pointer hover:text-primary text-muted-foreground"
            onClick={(e) => {
              e.stopPropagation()
              setIsAdding(true)
            }}
          >
            <PlusCircleIcon className="h-4 w-4" />
          </div>
        )}
        {isAdding && availableChoices.length > 0 && (
          <div onClick={(e) => e.stopPropagation()}>
            <Combobox
              options={availableChoices.map(choice => ({
                value: choice.id,
                label: choice.label,
              }))}
              open={availableChoices.length > 0}
              onValueChange={value => {
                if (value) {
                  handleChangeSelected([
                    ...selected,
                    // Inefficient, but it's ok for now
                    { id: value, label: availableChoices.find(c => c.id === value)?.label ?? "" },
                  ])
                }
                setIsAdding(false)
              }}
              placeholder="Select a category..."
              className="w-full max-w-36"
            />
          </div>
        )}
        {selected.map(choice => (
          <TooltipProvider key={choice.id}>
            <Tooltip delayDuration={200}>
              <TooltipTrigger asChild>
                <Badge
                  key={choice.id}
                  variant="secondary"
                  className="group bg-teal-50 text-teal-950 flex scale-100 hover:scale-105 transition-transform duration-300 items-center gap-1 px-4 py-1 text-[16px]"
                >
                  {choice.label}
                  <div
                    className="px-2 pr-0 opacity-60 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleChangeSelected(selected.filter(c => c.id !== choice.id))
                    }}
                  >
                    <XIcon className="h-3 w-3 hover:text-destructive" />
                  </div>
                </Badge>
              </TooltipTrigger>
              <TooltipContent
                side="top"
                sideOffset={10}
                className="z-20 bg-gray-50 px-6 py-2 rounded-md text-foreground"
              >
                {choice.id}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ))}
      </div>
    </div>
  )
}
