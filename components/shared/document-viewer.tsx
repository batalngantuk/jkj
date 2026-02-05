'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Eye, Download, FileText } from "lucide-react"

interface DocumentViewerProps {
  url?: string
  filename: string
  title?: string
  trigger?: React.ReactNode
}

export function DocumentViewer({ url, filename, title = "Document Viewer", trigger }: DocumentViewerProps) {
  // In a real app, this would use the URL to display a PDF or Image.
  // For mock, we'll just show a placeholder.
  
  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <Eye className="h-4 w-4 text-muted-foreground" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-3xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{title} - {filename}</DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 bg-secondary/20 rounded-lg flex flex-col items-center justify-center p-8 border border-dashed border-border">
          <FileText className="h-20 w-20 text-muted-foreground opacity-50 mb-4" />
          <p className="text-lg font-medium text-foreground">Preview not available in mock mode</p>
          <p className="text-sm text-muted-foreground mt-2 text-center max-w-md">
            This is where the PDF or image document would be rendered using a viewer library like react-pdf.
          </p>
          <p className="text-xs text-muted-foreground mt-6 font-mono bg-secondary p-2 rounded">
            Source: {url || 'Local Mock File'}
          </p>
          
          <Button className="mt-8 gap-2">
            <Download className="h-4 w-4" />
            Download Original
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
