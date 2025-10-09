"use client"

import * as SliderPrimitive from "@radix-ui/react-slider"
import * as TooltipPrimitive from "@radix-ui/react-tooltip"
import * as React from "react"

import { cn } from "@/lib/utils"

function Slider({
    className,
    defaultValue,
    value,
    min = 0,
    max = 100,
    ...props
}: React.ComponentProps<typeof SliderPrimitive.Root>) {
    const _values = React.useMemo(
        () =>
            Array.isArray(value) ? value : Array.isArray(defaultValue) ? defaultValue : [min, max],
        [value, defaultValue, min, max],
    )

    return (
        <SliderPrimitive.Root
            data-slot="slider"
            defaultValue={defaultValue}
            value={value}
            min={min}
            max={max}
            className={cn(
                "relative flex w-full touch-none items-center select-none data-[disabled]:opacity-50 data-[orientation=vertical]:h-full data-[orientation=vertical]:min-h-44 data-[orientation=vertical]:w-auto data-[orientation=vertical]:flex-col",
                className,
            )}
            {...props}
        >
            <SliderPrimitive.Track
                data-slot="slider-track"
                className={cn(
                    "bg-muted relative grow overflow-hidden rounded-full data-[orientation=horizontal]:h-1.5 data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-1.5",
                )}
            >
                <SliderPrimitive.Range
                    data-slot="slider-range"
                    className={cn(
                        "bg-primary absolute data-[orientation=horizontal]:h-full data-[orientation=vertical]:w-full",
                    )}
                />
            </SliderPrimitive.Track>
            {Array.from({ length: _values.length }, (_, index) => (
                <TooltipPrimitive.Provider key={index} delayDuration={0}>
                    <TooltipPrimitive.Root>
                        <TooltipPrimitive.Trigger asChild>
                            <SliderPrimitive.Thumb
                                data-slot="slider-thumb"
                                className="border-primary bg-background ring-ring/50 block size-4 shrink-0 rounded-full border shadow-sm transition-[color,box-shadow] hover:ring-4 focus-visible:ring-4 focus-visible:outline-hidden disabled:pointer-events-none disabled:opacity-50"
                            />
                        </TooltipPrimitive.Trigger>
                        <TooltipPrimitive.Portal>
                            <TooltipPrimitive.Content
                                className="bg-primary text-primary-foreground animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 overflow-hidden rounded-md px-3 py-1.5 text-xs"
                                sideOffset={5}
                                side="bottom"
                            >
                                {_values[index]}
                                <TooltipPrimitive.Arrow className="fill-primary" />
                            </TooltipPrimitive.Content>
                        </TooltipPrimitive.Portal>
                    </TooltipPrimitive.Root>
                </TooltipPrimitive.Provider>
            ))}
            {_values.map((value, index) => (
                <div key={index} className="absolute -top-2 -right-10">
                    {value}
                </div>
            ))}
        </SliderPrimitive.Root>
    )
}

export { Slider }
