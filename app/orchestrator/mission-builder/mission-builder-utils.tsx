import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@lib/utils"
import { Select } from "@radix-ui/react-select"

export function SelectWithLabel({
    label,
    children,
    orientation = "vertical",
    ...rest
}: {
    label?: string
    children?: React.ReactNode
    orientation?: "horizontal" | "vertical"
} & React.ComponentProps<typeof Select>) {
    return (
        <div className={cn("flex flex-col gap-2", orientation === "horizontal" && "flex-row")}>
            {label && <Label className="mb-2 text-sm font-bold">{label}</Label>}
            <div className="bg-white">
                <Select {...rest}>{children}</Select>
            </div>
        </div>
    )
}

export function FieldWithLabel({
    label,
    children,
    required,
}: {
    label?: string
    children?: React.ReactNode
    required?: boolean
}) {
    return (
        <div className="flex flex-col gap-2">
            <Label className="mb-1 text-sm">
                <div>{label}</div>
                {required && (
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <div className="text-lg text-red-500">*</div>
                        </TooltipTrigger>
                        <TooltipContent className="" side="top">
                            This field is required
                        </TooltipContent>
                    </Tooltip>
                )}
            </Label>
            {children}
        </div>
    )
}

export function InputWithLabel({
    label,
    children,
    required,
    ...rest
}: { label?: string; children?: React.ReactNode; required?: boolean } & React.ComponentProps<
    typeof Input
>) {
    return (
        <FieldWithLabel label={label} required={required}>
            <Input {...rest} className={cn("w-full max-w-[30ch] bg-white", rest.className)} />
        </FieldWithLabel>
    )
}

export function ModeButtonSelector({
    active,
    unsupported,
    title,
    subtitle,
    className,
    ...rest
}: React.ComponentProps<typeof Button> & {
    active?: boolean
    unsupported?: boolean
    title: string
    subtitle: string
    className?: string
}) {
    return (
        <Button
            variant="link"
            className="h-40 scale-100 cursor-pointer px-0 py-4 text-left text-wrap hover:scale-[102%] hover:no-underline focus:no-underline active:scale-[98%]"
            disabled={unsupported}
            {...rest}
        >
            <Card
                className={cn(
                    "relative flex h-full w-[280px] flex-col gap-2 border-2 px-4 py-1 text-left text-[16px] select-none",
                    !unsupported &&
                        "scale-100 cursor-pointer transition-all select-none hover:scale-105 hover:bg-gray-50 active:scale-95",
                    unsupported &&
                        "bg-[repeating-linear-gradient(45deg,theme(colors.yellow.50/10),theme(colors.yellow.50/10)_10px,transparent_10px,transparent_20px)]",
                    active && "border-blue-400",
                )}
            >
                {unsupported && (
                    <div className="absolute top-2 right-2 rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium tracking-wide text-yellow-900 uppercase">
                        Unsupported
                    </div>
                )}
                <CardHeader className="flex flex-row p-2 text-left">
                    <CardTitle className="flex flex-col gap-2 pt-4">
                        <div>{title}</div>
                    </CardTitle>
                </CardHeader>
                <CardDescription className="px-2 text-left text-wrap">{subtitle}</CardDescription>
            </Card>
        </Button>
    )
}
