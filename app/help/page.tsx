'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Book, FileText, Map, HelpCircle, Download, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import AppLayout from '@/components/app-layout'

export default function HelpPage() {
  const [activeDoc, setActiveDoc] = useState('overview')

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
                <Card key={doc.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setActiveDoc(doc.id)}>
                  <CardHeader className="pb-3">
                    <div className={`w-12 h-12 rounded-lg ${doc.bgColor} flex items-center justify-center mb-3`}>
                      <Icon className={`h-6 w-6 ${doc.color}`} />
                    </div>
                    <CardTitle className="text-lg">{doc.title}</CardTitle>
                    <CardDescription className="text-xs">{doc.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-2">
                      <a href={doc.file} download className="flex-1">
                        <Button variant="outline" size="sm" className="w-full gap-2">
                          <Download className="h-3 w-3" />
                          Download
                        </Button>
                      </a>
                      <a href={doc.file} target="_blank" rel="noopener noreferrer">
                        <Button variant="ghost" size="sm">
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      </a>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Documentation Viewer */}
          <Card>
            <CardHeader>
              <CardTitle>Documentation</CardTitle>
              <CardDescription>Select a document above to view or download</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeDoc} onValueChange={setActiveDoc}>
                <TabsList className="grid w-full grid-cols-4">
                  {documents.map((doc) => (
                    <TabsTrigger key={doc.id} value={doc.id}>
                      {doc.title.split(' ')[0]}
                    </TabsTrigger>
                  ))}
                </TabsList>
                
                {documents.map((doc) => (
                  <TabsContent key={doc.id} value={doc.id} className="mt-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-xl font-semibold">{doc.title}</h3>
                          <p className="text-sm text-muted-foreground">{doc.description}</p>
                        </div>
                        <div className="flex gap-2">
                          <a href={doc.file} download>
                            <Button variant="outline" className="gap-2">
                              <Download className="h-4 w-4" />
                              Download
                            </Button>
                          </a>
                          <a href={doc.file} target="_blank" rel="noopener noreferrer">
                            <Button className="gap-2">
                              <ExternalLink className="h-4 w-4" />
                              Open in New Tab
                            </Button>
                          </a>
                        </div>
                      </div>
                      
                      <div className="border rounded-lg p-6 bg-secondary/5">
                        <p className="text-sm text-muted-foreground">
                          Click "Open in New Tab" to view the full documentation, or "Download" to save it locally.
                        </p>
                        <div className="mt-4 space-y-2">
                          <h4 className="font-medium">What's included:</h4>
                          <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                            {doc.id === 'overview' && (
                              <>
                                <li>• Complete module descriptions (Sales, Production, Warehouse, etc.)</li>
                                <li>• User roles and permissions</li>
                                <li>• End-to-end workflow diagrams</li>
                                <li>• Best practices and tips</li>
                              </>
                            )}
                            {doc.id === 'quick' && (
                              <>
                                <li>• Navigation map for all modules</li>
                                <li>• Common tasks by user role</li>
                                <li>• Status badge explanations</li>
                                <li>• Troubleshooting quick fixes</li>
                              </>
                            )}
                            {doc.id === 'workflow' && (
                              <>
                                <li>• Detailed process flows with diagrams</li>
                                <li>• Status progressions for all documents</li>
                                <li>• Integration points between modules</li>
                                <li>• Approval workflows</li>
                              </>
                            )}
                            {doc.id === 'customs' && (
                              <>
                                <li>• BC 2.3 Import form guide</li>
                                <li>• BC 3.0 Export form guide</li>
                                <li>• Material traceability setup</li>
                                <li>• Customs compliance checklist</li>
                              </>
                            )}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
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
