import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@lib/utils";
import { Select } from "@radix-ui/react-select";

export function SelectWithLabel({
  label,
  children,
  ...rest
}: { label: string; children?: React.ReactNode } & React.ComponentProps<typeof Select>) {
  return (
    <div className="flex flex-col gap-2">
      <Label className="text-sm font-medium">{label}</Label>
      <div className="bg-white">
        <Select {...rest}>{children}</Select>
      </div>
    </div>
  )
}

export function InputWithLabel({
  label,
  children,
  ...rest
}: { label: string; children?: React.ReactNode } & React.ComponentProps<typeof Input>) {
  return (
    <div className="flex flex-col gap-2">
      <Label className="text-sm font-medium">{label}</Label>
      <Input {...rest} className={cn("w-full max-w-[30ch]", rest.className)} />
    </div>
  )
}
