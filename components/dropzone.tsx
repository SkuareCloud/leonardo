import { UploadIcon } from "lucide-react"
import { useDropzone } from "react-dropzone"
import { Badge } from "./ui/badge"
import { Button } from "./ui/button"
import { Card } from "./ui/card"

export function Dropzone({ onUpload }: { onUpload: (files: File[]) => void }) {
  const { acceptedFiles, getRootProps, getInputProps } = useDropzone({})

  const files = acceptedFiles.map(file => (
    <li key={file.path}>
      {file.path} - {file.size} bytes
    </li>
  ))

  return (
    <Card className="container p-4">
      <div {...getRootProps({ className: "dropzone" })}>
        <input {...getInputProps()} />
        <div className="flex w-full h-full min-h-48 cursor-pointer hover:from-gray-200 group bg-gradient-to-t from-gray-100 to-transparent rounded-2xl transition-colors flex-col items-center justify-center text-center select-none">
          <UploadIcon className="w-6 h-6 text-muted-foreground group-hover:scale-105 transition-transform duration-300 group-hover:-translate-y-2" />
          <p className="text-[18px] text-gray-800 group-hover:translate-y-2 transition-all">
            Drag and drop files, or click to upload
          </p>
        </div>
      </div>
      {files && files.length > 0 && (
        <div className="flex flex-row gap-2">
          <div className="font-bold">File:</div> <Badge variant="outline">{files[0].key}</Badge>
        </div>
      )}
      <Button
        className="cursor-pointer hover:scale-[102%] active:scale-[98%] transition-all"
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
