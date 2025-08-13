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
  accept?: Accept | string
  compact?: boolean
  size?: 'default' | 'compact' | 'tiny'
}) {
  const { acceptedFiles, getRootProps, getInputProps } = useDropzone({ accept })

  const files = acceptedFiles.map(file => (
    <li key={file.path}>
      {file.path} - {file.size} bytes
    </li>
  ))

  const resolvedSize = size ?? (compact ? 'compact' : 'default')
  const minHeightClass = resolvedSize === 'tiny' ? 'min-h-16' : resolvedSize === 'compact' ? 'min-h-24' : 'min-h-48'
  const textSizeClass = resolvedSize === 'tiny' ? 'text-[12px]' : resolvedSize === 'compact' ? 'text-[14px]' : 'text-[18px]'

  return (
    <Card className="container p-4">
      <div {...getRootProps({ className: "dropzone" })}>
        <input {...getInputProps()} />
        <div className={`flex w-full h-full ${minHeightClass} cursor-pointer hover:from-gray-200 group bg-gradient-to-t from-gray-100 to-transparent rounded-2xl transition-colors flex-col items-center justify-center text-center select-none`}>
          <UploadIcon className="w-6 h-6 text-muted-foreground group-hover:scale-105 transition-transform duration-300 group-hover:-translate-y-2" />
          <p className={`${textSizeClass} text-gray-800 group-hover:translate-y-2 transition-all`}>
            Drag and drop files, or click to upload
          </p>
        </div>
      </div>
      {files && files.length > 0 && (
        <div className="flex flex-row gap-2 mt-2 items-center">
          <div className="font-bold">File:</div>
          <Badge variant="outline">{acceptedFiles[0]?.name}</Badge>
        </div>
      )}
      <Button
        className="mt-3 cursor-pointer hover:scale-[102%] active:scale-[98%] transition-all"
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
