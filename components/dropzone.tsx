import { UploadIcon } from "lucide-react"
import { Accept, useDropzone } from "react-dropzone"
import { Badge } from "./ui/badge"
import { Button } from "./ui/button"
import { Card } from "./ui/card"

export function Dropzone({
    onUpload,
    accept,
    compact = false,
    size,
}: {
    onUpload: (files: File[]) => void
    accept?: Accept
    compact?: boolean
    size?: "default" | "compact" | "tiny"
}) {
    const { acceptedFiles, getRootProps, getInputProps } = useDropzone({ accept })

    const files = acceptedFiles.map((file) => (
        <li key={file.path}>
            {file.path} - {file.size} bytes
        </li>
    ))

    const resolvedSize = size ?? (compact ? "compact" : "default")
    const minHeightClass =
        resolvedSize === "tiny" ? "min-h-16" : resolvedSize === "compact" ? "min-h-24" : "min-h-48"
    const textSizeClass =
        resolvedSize === "tiny"
            ? "text-[12px]"
            : resolvedSize === "compact"
              ? "text-[14px]"
              : "text-[18px]"

    return (
        <Card className="container p-4">
            <div {...getRootProps({ className: "dropzone" })}>
                <input {...getInputProps()} />
                <div
                    className={`flex h-full w-full ${minHeightClass} group cursor-pointer flex-col items-center justify-center rounded-2xl bg-gradient-to-t from-gray-100 to-transparent text-center transition-colors select-none hover:from-gray-200`}
                >
                    <UploadIcon className="text-muted-foreground h-6 w-6 transition-transform duration-300 group-hover:-translate-y-2 group-hover:scale-105" />
                    <p
                        className={`${textSizeClass} text-gray-800 transition-all group-hover:translate-y-2`}
                    >
                        Drag and drop files, or click to upload
                    </p>
                </div>
            </div>
            {files && files.length > 0 && (
                <div className="mt-2 flex flex-row items-center gap-2">
                    <div className="font-bold">File:</div>
                    <Badge variant="outline">{acceptedFiles[0]?.name}</Badge>
                </div>
            )}
            <Button
                className="mt-3 cursor-pointer transition-all hover:scale-[102%] active:scale-[98%]"
                onClick={() => {
                    onUpload([...acceptedFiles])
                }}
                disabled={acceptedFiles.length === 0}
            >
                Upload
            </Button>
        </Card>
    )
}
