'use client'

import React, { useState, useRef } from 'react'
import { Upload, X, FileText, CheckCircle, AlertCircle, Download, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'

export type DocumentType =
  | 'PIB'
  | 'INVOICE'
  | 'PACKING_LIST'
  | 'BILL_OF_LADING'
  | 'COA'
  | 'SPPB'
  | 'OTHER'

export type DocumentStatus = 'pending' | 'uploading' | 'uploaded' | 'error'

export type Document = {
  id: string
  type: DocumentType
  name: string
  size: number
  uploadedAt?: Date
  uploadedBy?: string
  url?: string
  status: DocumentStatus
  progress?: number
  error?: string
}

interface DocumentUploadProps {
  documentType: DocumentType
  label: string
  description?: string
  required?: boolean
  maxSizeMB?: number
  acceptedFormats?: string[]
  existingDocument?: Document | null
  onUpload?: (file: File) => Promise<void>
  onDelete?: () => Promise<void>
  onView?: () => void
  disabled?: boolean
}

const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  PIB: 'PIB Document',
  INVOICE: 'Commercial Invoice',
  PACKING_LIST: 'Packing List',
  BILL_OF_LADING: 'Bill of Lading',
  COA: 'Certificate of Analysis',
  SPPB: 'SPPB (Customs Release)',
  OTHER: 'Other Document',
}

export function DocumentUpload({
  documentType,
  label,
  description,
  required = false,
  maxSizeMB = 10,
  acceptedFormats = ['.pdf', '.jpg', '.jpeg', '.png'],
  existingDocument,
  onUpload,
  onDelete,
  onView,
  disabled = false,
}: DocumentUploadProps) {
  const [uploadStatus, setUploadStatus] = useState<DocumentStatus>(
    existingDocument?.status || 'pending'
  )
  const [uploadProgress, setUploadProgress] = useState(0)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
  }

  const validateFile = (file: File): { valid: boolean; error?: string } => {
    // Check file size
    const maxSizeBytes = maxSizeMB * 1024 * 1024
    if (file.size > maxSizeBytes) {
      return {
        valid: false,
        error: `File size exceeds ${maxSizeMB}MB limit`,
      }
    }

    // Check file format
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase()
    if (!acceptedFormats.includes(fileExtension)) {
      return {
        valid: false,
        error: `File format not supported. Accepted: ${acceptedFormats.join(', ')}`,
      }
    }

    return { valid: true }
  }

  const handleFileSelect = async (file: File) => {
    const validation = validateFile(file)

    if (!validation.valid) {
      setErrorMessage(validation.error || 'Invalid file')
      setUploadStatus('error')
      return
    }

    setErrorMessage(null)
    setUploadStatus('uploading')
    setUploadProgress(0)

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 200)

      // Call upload handler
      if (onUpload) {
        await onUpload(file)
      }

      clearInterval(progressInterval)
      setUploadProgress(100)
      setUploadStatus('uploaded')
    } catch (error) {
      setUploadStatus('error')
      setErrorMessage(error instanceof Error ? error.message : 'Upload failed')
    }
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)

    if (disabled) return

    const file = e.dataTransfer.files[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    if (!disabled) {
      setIsDragging(true)
    }
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleDelete = async () => {
    if (onDelete) {
      try {
        await onDelete()
        setUploadStatus('pending')
        setUploadProgress(0)
        setErrorMessage(null)
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : 'Delete failed')
      }
    }
  }

  const getStatusIcon = () => {
    switch (uploadStatus) {
      case 'uploaded':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'uploading':
        return <Upload className="h-5 w-5 text-blue-600 animate-pulse" />
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-600" />
      default:
        return <FileText className="h-5 w-5 text-muted-foreground" />
    }
  }

  const getStatusBadge = () => {
    switch (uploadStatus) {
      case 'uploaded':
        return <Badge className="bg-green-100 text-green-700">Uploaded</Badge>
      case 'uploading':
        return <Badge className="bg-blue-100 text-blue-700">Uploading...</Badge>
      case 'error':
        return <Badge className="bg-red-100 text-red-700">Error</Badge>
      default:
        return required ? (
          <Badge className="bg-orange-100 text-orange-700">Required</Badge>
        ) : (
          <Badge className="bg-gray-100 text-gray-700">Optional</Badge>
        )
    }
  }

  return (
    <Card className={cn(
      'transition-all',
      uploadStatus === 'uploaded' && 'border-green-200 bg-green-50/30',
      uploadStatus === 'error' && 'border-red-200 bg-red-50/30',
      disabled && 'opacity-60'
    )}>
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              {getStatusIcon()}
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-medium text-sm">{label}</p>
                  {getStatusBadge()}
                </div>
                {description && (
                  <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
                )}
              </div>
            </div>
          </div>

          {/* Upload Area or Uploaded File Info */}
          {uploadStatus === 'pending' && (
            <div
              className={cn(
                'border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer',
                isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25',
                disabled && 'cursor-not-allowed'
              )}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => !disabled && fileInputRef.current?.click()}
            >
              <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm font-medium mb-1">
                Click to upload or drag and drop
              </p>
              <p className="text-xs text-muted-foreground">
                {acceptedFormats.join(', ').toUpperCase()} (max {maxSizeMB}MB)
              </p>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept={acceptedFormats.join(',')}
                onChange={handleFileInputChange}
                disabled={disabled}
              />
            </div>
          )}

          {uploadStatus === 'uploading' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Uploading...</span>
                <span className="font-medium">{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="h-2" />
            </div>
          )}

          {uploadStatus === 'uploaded' && existingDocument && (
            <div className="bg-white rounded-lg border p-3">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{existingDocument.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(existingDocument.size)}
                    </p>
                    {existingDocument.uploadedAt && (
                      <>
                        <span className="text-xs text-muted-foreground">•</span>
                        <p className="text-xs text-muted-foreground">
                          {new Date(existingDocument.uploadedAt).toLocaleDateString('id-ID')}
                        </p>
                      </>
                    )}
                    {existingDocument.uploadedBy && (
                      <>
                        <span className="text-xs text-muted-foreground">•</span>
                        <p className="text-xs text-muted-foreground">
                          by {existingDocument.uploadedBy}
                        </p>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1 ml-2">
                  {onView && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={onView}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  )}
                  {existingDocument.url && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      asChild
                    >
                      <a href={existingDocument.url} download>
                        <Download className="h-4 w-4" />
                      </a>
                    </Button>
                  )}
                  {!disabled && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={handleDelete}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}

          {uploadStatus === 'error' && errorMessage && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-red-600 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-900">Upload Failed</p>
                  <p className="text-xs text-red-700 mt-0.5">{errorMessage}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => {
                    setUploadStatus('pending')
                    setErrorMessage(null)
                  }}
                >
                  Try Again
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
