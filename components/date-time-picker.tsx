"use client"

import { ChevronDownIcon } from "lucide-react"
import * as React from "react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

export function DateTimePicker({
  disabled,
  onSelectDate,
  ...rest
}: React.ComponentProps<typeof Input> & { onSelectDate?: (date: Date) => void }) {
  const [open, setOpen] = React.useState(false)
  const [dateTime, setDateTime] = React.useState<Date | undefined>(undefined)

  return (
    <div className="flex gap-4">
      <div className="flex flex-col gap-3">
        <Label htmlFor="date-picker" className="px-1">
          Date
        </Label>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" id="date-picker" className="w-32 justify-between font-normal" disabled={disabled}>
              {dateTime ? dateTime.toDateString() : "Select date"}
              <ChevronDownIcon />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto overflow-hidden p-0" align="start">
            <Calendar
              mode="single"
              selected={dateTime}
              captionLayout="dropdown"
              onSelect={date => {
                if (!date) return
                const newDateTime = dateTime ?? new Date()
                newDateTime.setDate(date.getDate())
                newDateTime.setMonth(date.getMonth())
                newDateTime.setFullYear(date.getFullYear())
                setDateTime(newDateTime)
                onSelectDate?.(newDateTime)
                setOpen(false)
              }}
            />
          </PopoverContent>
        </Popover>
      </div>
      <div className="flex flex-col gap-3">
        <Label htmlFor="time-picker" className="px-1">
          Time
        </Label>
        <Input
          type="time"
          id="time-picker"
          step="1"
          disabled={disabled}
          className="bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
          onChange={e => {
            if (!e.target.value) return
            if (!dateTime) return
            let newDateTime = new Date(dateTime)
            if (newDateTime.toString() === "Invalid Date") {
              newDateTime = new Date()
            }
            if (newDateTime.toString() === "Invalid Date") {
              newDateTime.setHours(0)
              newDateTime.setMinutes(0)
              newDateTime.setSeconds(0)
            }
            const [hours, minutes, seconds] = e.target.value.split(":")
            if (hours) newDateTime.setHours(parseInt(hours))
            if (minutes) newDateTime.setMinutes(parseInt(minutes))
            if (seconds) newDateTime.setSeconds(parseInt(seconds))
            setDateTime(newDateTime)
            onSelectDate?.(new Date(newDateTime))
          }}
          {...rest}
        />
      </div>
    </div>
  )
}
