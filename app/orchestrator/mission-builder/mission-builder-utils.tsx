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
}: { label?: string; children?: React.ReactNode; orientation?: "horizontal" | "vertical" } & React.ComponentProps<
  typeof Select
>) {
  return (
    <div className={cn("flex flex-col gap-2", orientation === "horizontal" && "flex-row")}>
      {label && <Label className="text-sm font-bold mb-2">{label}</Label>}
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
  label: string
  children?: React.ReactNode
  required?: boolean
}) {
  return (
    <div className="flex flex-col gap-2">
      <Label className="text-sm mb-1">
        <div>{label}</div>
        {required && (
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="text-red-500 text-lg">*</div>
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
}: { label: string; children?: React.ReactNode; required?: boolean } & React.ComponentProps<typeof Input>) {
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
      className="px-0 py-4 text-wrap cursor-pointer hover:no-underline focus:no-underline h-40 text-left scale-100 hover:scale-[102%] active:scale-[98%]"
      disabled={unsupported}
      {...rest}
    >
      <Card
        className={cn(
          "h-full w-[280px] select-none px-4 py-1 text-left flex flex-col gap-2 relative border-2 text-[16px]",
          !unsupported &&
            "cursor-pointer scale-100 select-none hover:scale-105 active:scale-95 transition-all hover:bg-gray-50",
          unsupported &&
            "bg-[repeating-linear-gradient(45deg,theme(colors.yellow.50/10),theme(colors.yellow.50/10)_10px,transparent_10px,transparent_20px)]",
          active && "border-blue-400",
        )}
      >
        {unsupported && (
          <div className="uppercase tracking-wide absolute top-2 right-2 bg-yellow-100 text-yellow-900 text-xs px-3 py-1 rounded-full font-medium">
            Unsupported
          </div>
        )}
        <CardHeader className="flex flex-row text-left p-2">
          <CardTitle className="flex flex-col gap-2 pt-4">
            <div>{title}</div>
          </CardTitle>
        </CardHeader>
        <CardDescription className="px-2 text-left text-wrap">{subtitle}</CardDescription>
      </Card>
    </Button>
  )
}
