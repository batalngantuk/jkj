'use client'

import { useState, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Upload, File, X, CheckCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface FileUploadProps {
  onFileSelect: (file: File) => void
  label?: string
  accept?: string
  maxSizeMB?: number
  className?: string
  existingFile?: string
}

export function FileUpload({ 
  onFileSelect, 
  label = "Upload Document", 
  accept = ".pdf,.jpg,.png,.jpeg",
  maxSizeMB = 5,
  className,
  existingFile
}: FileUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      if (file.size > maxSizeMB * 1024 * 1024) {
        alert(`File size exceeds ${maxSizeMB}MB`)
        return
      }
      setSelectedFile(file)
      onFileSelect(file)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0]
      setSelectedFile(file)
      onFileSelect(file)
    }
  }

  const clearFile = () => {
    setSelectedFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className={cn("w-full", className)}>
      {label && <label className="text-sm font-medium mb-2 block">{label}</label>}
      
      {!selectedFile && !existingFile ? (
        <div 
          className={cn(
            "border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer transition-colors",
            isDragging ? "border-primary bg-primary/5" : "border-border hover:bg-secondary/50"
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="h-8 w-8 text-muted-foreground mb-3" />
          <p className="text-sm font-medium text-foreground">Click to upload or drag and drop</p>
          <p className="text-xs text-muted-foreground mt-1">
            {accept.replace(/\./g, '').toUpperCase()} (Max {maxSizeMB}MB)
          </p>
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept={accept} 
            onChange={handleFileChange}
          />
        </div>
      ) : (
        <div className="border rounded-lg p-4 flex items-center justify-between bg-secondary/20">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <File className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground truncate max-w-[200px]">
                {selectedFile ? selectedFile.name : existingFile}
              </p>
              <p className="text-xs text-muted-foreground">
                {selectedFile ? `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB` : 'Existing document'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <Button variant="ghost" size="icon" onClick={clearFile} className="h-8 w-8 text-muted-foreground hover:text-destructive">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
