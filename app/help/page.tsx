'use client'

import React, { useState, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Book, FileText, Map, HelpCircle, Download, ExternalLink, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import AppLayout from '@/components/app-layout'

export default function HelpPage() {
  const [activeDoc, setActiveDoc] = useState('overview')
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)

  const documents = [
    {
      id: 'overview',
      title: 'Platform Overview',
      description: 'Comprehensive guide to all modules and features',
      icon: Book,
      file: '/docs/platform_overview.md',
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      id: 'quick',
      title: 'Quick Reference',
      description: 'Quick guide for daily tasks and common operations',
      icon: FileText,
      file: '/docs/quick_reference.md',
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      id: 'workflow',
      title: 'Detailed Workflow',
      description: 'Step-by-step workflow specifications for all processes',
      icon: Map,
      file: '/docs/detailed_workflow_spec.md',
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      id: 'customs',
      title: 'Customs Walkthrough',
      description: 'BC 2.3 and BC 3.0 implementation guide',
      icon: HelpCircle,
      file: '/docs/customs_walkthrough.md',
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    }
  ]

  useEffect(() => {
    const fetchContent = async () => {
      setLoading(true)
      try {
        const doc = documents.find(d => d.id === activeDoc)
        if (doc) {
          const response = await fetch(doc.file)
          if (response.ok) {
            const text = await response.text()
            setContent(text)
          } else {
            setContent('# Error loading document\nPlease try downloading the file instead.')
          }
        }
      } catch (error) {
        setContent('# Error loading document\nPlease try downloading the file instead.')
      } finally {
        setLoading(false)
      }
    }

    fetchContent()
  }, [activeDoc])

  return (
    <AppLayout>
      <div className="p-6">
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-foreground">Help & Support</h1>
            <p className="text-sm text-muted-foreground">Documentation and guides for using the ERP system</p>
          </div>

          {/* Quick Access Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {documents.map((doc) => {
              const Icon = doc.icon
              return (
                <Card 
                  key={doc.id} 
                  className={`hover:shadow-lg transition-shadow cursor-pointer ${activeDoc === doc.id ? 'ring-2 ring-primary' : ''}`}
                  onClick={() => setActiveDoc(doc.id)}
                >
                  <CardHeader className="pb-3">
                    <div className={`w-12 h-12 rounded-lg ${doc.bgColor} flex items-center justify-center mb-3`}>
                      <Icon className={`h-6 w-6 ${doc.color}`} />
                    </div>
                    <CardTitle className="text-lg">{doc.title}</CardTitle>
                    <CardDescription className="text-xs">{doc.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-2">
                       <a href={doc.file} download className="flex-1" onClick={(e) => e.stopPropagation()}>
                        <Button variant="outline" size="sm" className="w-full gap-2">
                          <Download className="h-3 w-3" />
                          Download
                        </Button>
                      </a>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Documentation Viewer */}
          <Card className="min-h-[500px]">
            <CardHeader className="border-b bg-muted/20">
              <div className="flex items-center justify-between">
                <div>
                   <CardTitle>{documents.find(d => d.id === activeDoc)?.title}</CardTitle>
                   <CardDescription>Reading mode enabled</CardDescription>
                </div>
                <div className="flex gap-2">
                  <a href={documents.find(d => d.id === activeDoc)?.file} download>
                    <Button variant="outline" className="gap-2">
                      <Download className="h-4 w-4" />
                      Download File
                    </Button>
                  </a>
                  <a href={documents.find(d => d.id === activeDoc)?.file} target="_blank" rel="noopener noreferrer">
                    <Button className="gap-2">
                      <ExternalLink className="h-4 w-4" />
                      Open in New Tab
                    </Button>
                  </a>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {loading ? (
                <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                  <Loader2 className="h-8 w-8 animate-spin mb-4" />
                  <p>Loading documentation...</p>
                </div>
              ) : (
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {content}
                  </ReactMarkdown>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Additional Resources */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Resources</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium mb-2">Video Tutorials</h4>
                  <p className="text-sm text-muted-foreground mb-3">Step-by-step video guides (Coming soon)</p>
                  <Button variant="outline" size="sm" disabled>
                    Watch Videos
                  </Button>
                </div>
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium mb-2">Training Materials</h4>
                  <p className="text-sm text-muted-foreground mb-3">Role-based training documents (Coming soon)</p>
                  <Button variant="outline" size="sm" disabled>
                    Access Training
                  </Button>
                </div>
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium mb-2">Contact Support</h4>
                  <p className="text-sm text-muted-foreground mb-3">Need help? Reach out to our team</p>
                  <Button variant="outline" size="sm">
                    Contact Us
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  )
}
