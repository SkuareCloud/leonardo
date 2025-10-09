"use client"

import { ChevronDownIcon } from "lucide-react"
import * as React from "react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@lib/utils"

const getCurrentDateTimeUTC = () => {
    const now = new Date()
    return new Date(now.getTime() + now.getTimezoneOffset() * 60000)
}

export function DateTimePicker({
    disabled,
    onSelectDate,
    resetable = false,
    defaultDate,
    ...rest
}: React.ComponentProps<typeof Input> & {
    onSelectDate?: (date: Date) => void
    resetable?: boolean
    defaultDate?: Date
}) {
    const initialDateTime = defaultDate || getCurrentDateTimeUTC()
    const [open, setOpen] = React.useState(false)
    const [dateTime, setDateTime] = React.useState<Date | undefined>(initialDateTime)

    return (
        <div className="flex flex-row items-center gap-4">
            <div className="flex flex-col gap-3">
                <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            id="date-picker"
                            className="w-32 justify-between font-normal"
                            disabled={disabled}
                        >
                            {dateTime ? dateTime.toDateString() : "Select date"}
                            <ChevronDownIcon />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                        <Calendar
                            mode="single"
                            selected={dateTime}
                            captionLayout="dropdown"
                            onSelect={(date) => {
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
                <Input
                    type="time"
                    id="time-picker"
                    step="60"
                    min="00:00"
                    max="23:59"
                    disabled={disabled}
                    value={
                        dateTime
                            ? `${dateTime.getHours().toString().padStart(2, "0")}:${dateTime.getMinutes().toString().padStart(2, "0")}`
                            : ""
                    }
                    className="bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                    onChange={(e) => {
                        if (!e.target.value) return
                        let newDateTime = dateTime ? new Date(dateTime) : new Date()
                        if (newDateTime.toString() === "Invalid Date") {
                            newDateTime = new Date()
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
            <div
                className={cn("relative ml-2 flex flex-row text-sm", !disabled && "text-gray-500")}
            >
                <div>UTC</div>
            </div>
            {resetable && (
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                        const now = getCurrentDateTimeUTC()
                        setDateTime(now)
                        onSelectDate?.(now)
                    }}
                >
                    Reset
                </Button>
            )}
        </div>
    )
}
