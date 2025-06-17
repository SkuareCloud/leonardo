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
      <Label className="text-sm font-bold mb-2">
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
  title,
  subtitle,
  className,
  ...rest
}: React.ComponentProps<typeof Button> & { active?: boolean; title: string; subtitle: string; className?: string }) {
  return (
    <Button
      variant="link"
      className="w-[320px] py-4 text-wrap cursor-pointer hover:no-underline focus:no-underline h-32 text-left scale-100 hover:scale-105 active:scale-95"
      {...rest}
    >
      <Card className={cn("w-full h-full border-2 text-wrap transition-all", active && "border-blue-200", className)}>
        <CardHeader>
          <CardTitle className="">{title}</CardTitle>
          <CardDescription>{subtitle}</CardDescription>
        </CardHeader>
      </Card>
    </Button>
  )
}
