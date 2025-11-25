"use client"

import * as React from "react"
import { Upload, X, FileText, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

interface FileUploadProps extends React.HTMLAttributes<HTMLDivElement> {
    onUpload?: (files: File[]) => Promise<void>
    maxFiles?: number
    accept?: string
}

export function FileUpload({
    className,
    onUpload,
    maxFiles = 1,
    accept = "*",
    ...props
}: FileUploadProps) {
    const [files, setFiles] = React.useState<File[]>([])
    const [uploading, setUploading] = React.useState(false)
    const [progress, setProgress] = React.useState(0)
    const [uploaded, setUploaded] = React.useState(false)
    const inputRef = React.useRef<HTMLInputElement>(null)

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files)
            setFiles((prev) => [...prev, ...newFiles].slice(0, maxFiles))
            setUploaded(false)
        }
    }

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        if (e.dataTransfer.files) {
            const newFiles = Array.from(e.dataTransfer.files)
            setFiles((prev) => [...prev, ...newFiles].slice(0, maxFiles))
            setUploaded(false)
        }
    }

    const removeFile = (index: number) => {
        setFiles((prev) => prev.filter((_, i) => i !== index))
    }

    const handleUpload = async () => {
        if (!files.length || !onUpload) return

        setUploading(true)
        setProgress(0)

        // Simulate progress
        const interval = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 90) {
                    clearInterval(interval)
                    return 90
                }
                return prev + 10
            })
        }, 200)

        try {
            await onUpload(files)
            setProgress(100)
            setUploaded(true)
            setFiles([])
        } catch (error) {
            console.error("Upload failed", error)
        } finally {
            clearInterval(interval)
            setUploading(false)
            setTimeout(() => {
                setProgress(0)
                setUploaded(false)
            }, 3000)
        }
    }

    return (
        <div className={cn("grid gap-4", className)} {...props}>
            <div
                className={cn(
                    "border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-muted/50 transition-colors",
                    uploading && "opacity-50 pointer-events-none"
                )}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => inputRef.current?.click()}
            >
                <input
                    ref={inputRef}
                    type="file"
                    className="hidden"
                    multiple={maxFiles > 1}
                    accept={accept}
                    onChange={handleFileSelect}
                />
                <div className="p-3 rounded-full bg-muted">
                    <Upload className="h-6 w-6 text-muted-foreground" />
                </div>
                <div className="text-center">
                    <p className="text-sm font-medium">
                        Click to upload or drag and drop
                    </p>
                    <p className="text-xs text-muted-foreground">
                        SVG, PNG, JPG or GIF (max. 800x400px)
                    </p>
                </div>
            </div>

            {files.length > 0 && (
                <div className="space-y-2">
                    {files.map((file, i) => (
                        <div
                            key={i}
                            className="flex items-center justify-between p-2 border rounded-md"
                        >
                            <div className="flex items-center gap-2">
                                <FileText className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm truncate max-w-[200px]">
                                    {file.name}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                    ({(file.size / 1024).toFixed(1)} KB)
                                </span>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => removeFile(i)}
                                disabled={uploading}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    ))}
                    <Button
                        className="w-full"
                        onClick={handleUpload}
                        disabled={uploading}
                    >
                        {uploading ? "Uploading..." : "Upload Files"}
                    </Button>
                </div>
            )}

            {uploading && <Progress value={progress} className="h-2" />}

            {uploaded && (
                <div className="flex items-center gap-2 text-green-600 justify-center">
                    <CheckCircle2 className="h-4 w-4" />
                    <span className="text-sm font-medium">Upload complete!</span>
                </div>
            )}
        </div>
    )
}
