'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Search, Download, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import AppLayout from '@/components/app-layout'
import { TraceabilityChain, TraceabilityStep } from '@/components/customs/traceability-chain'
import { MOCK_TRACEABILITY } from '@/lib/mock-data/traceability'

export default function TraceabilityReportPage() {
  const [searchType, setSearchType] = useState<string>('lot')
  const [searchValue, setSearchValue] = useState<string>('')
  const [selectedRecord, setSelectedRecord] = useState(MOCK_TRACEABILITY[0])

  const handleSearch = () => {
    // Mock search - in real app would filter based on searchType and searchValue
    // For now just show first record
  }

  const traceabilitySteps: TraceabilityStep[] = [
    {
      type: 'BC23',
      id: selectedRecord.bc23Id,
      number: selectedRecord.bc23Number,
      description: selectedRecord.rmDescription,
      date: selectedRecord.grDate,
      quantity: `${selectedRecord.rmQuantity.toLocaleString()} ${selectedRecord.rmUnit}`,
      lotNumber: selectedRecord.rmLotNumber,
      href: `/purchasing/bc23/${selectedRecord.bc23Id}`
    },
    {
      type: 'GR',
      id: selectedRecord.grId,
      number: selectedRecord.grNumber,
      description: `PO: ${selectedRecord.poNumber}`,
      date: selectedRecord.grDate,
      quantity: `${selectedRecord.rmQuantity.toLocaleString()} ${selectedRecord.rmUnit}`,
      lotNumber: selectedRecord.rmLotNumber
    },
    {
      type: 'WO',
      id: selectedRecord.woId,
      number: selectedRecord.woNumber,
      description: selectedRecord.productName,
      date: selectedRecord.productionDate,
      quantity: `${selectedRecord.fgQuantity.toLocaleString()} ${selectedRecord.fgUnit}`,
      lotNumber: selectedRecord.fgLotNumber,
      href: `/production/wo/${selectedRecord.woId}`
    },
    {
      type: 'FG',
      id: selectedRecord.fgLotNumber,
      number: selectedRecord.fgLotNumber,
      description: selectedRecord.productName,
      date: selectedRecord.productionDate,
      quantity: `${selectedRecord.fgQuantity.toLocaleString()} ${selectedRecord.fgUnit}`,
      lotNumber: selectedRecord.fgLotNumber
    }
  ]

  // Add BC 3.0 if exported
  if (selectedRecord.bc30Id) {
    traceabilitySteps.push({
      type: 'BC30',
      id: selectedRecord.bc30Id,
      number: selectedRecord.bc30Number!,
      description: `Export to customer`,
      date: selectedRecord.exportDate!,
      quantity: `${selectedRecord.exportQuantity!.toLocaleString()} ${selectedRecord.fgUnit}`,
      lotNumber: selectedRecord.fgLotNumber,
      href: `/logistics/bc30/${selectedRecord.bc30Id}`
    })
  }

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/reports">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Material Traceability Report</h1>
              <p className="text-sm text-muted-foreground">Track materials from import to export for customs compliance</p>
            </div>
          </div>
          <Button className="gap-2">
            <Download className="h-4 w-4" />
            Export Certificate
          </Button>
        </div>

        {/* Search */}
        <Card>
          <CardHeader>
            <CardTitle>Search Traceability</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Select value={searchType} onValueChange={setSearchType}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lot">Lot Number</SelectItem>
                  <SelectItem value="bc23">BC 2.3 Number</SelectItem>
                  <SelectItem value="bc30">BC 3.0 Number</SelectItem>
                  <SelectItem value="wo">Work Order</SelectItem>
                  <SelectItem value="po">PO Number</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex-1 relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder={`Enter ${searchType}...`}
                  className="pl-8"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                />
              </div>
              <Button onClick={handleSearch}>Search</Button>
            </div>
          </CardContent>
        </Card>

        {/* Traceability Chain */}
        <Card>
          <CardHeader>
            <CardTitle>Traceability Chain</CardTitle>
          </CardHeader>
          <CardContent>
            <TraceabilityChain 
              steps={traceabilitySteps}
              showConversion={true}
              conversionData={{
                input: selectedRecord.rmQuantity,
                output: selectedRecord.fgQuantity,
                ratio: selectedRecord.conversionRatio,
                standardRatio: selectedRecord.standardRatio,
                variance: selectedRecord.variance,
                waste: selectedRecord.waste
              }}
            />
          </CardContent>
        </Card>

        {/* Certificate Preview */}
        <Card className="border-2 border-primary/20">
          <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Material Traceability Certificate
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="text-center border-b pb-4">
                <h2 className="text-2xl font-bold">MATERIAL TRACEABILITY CERTIFICATE</h2>
                <p className="text-sm text-muted-foreground mt-2">For Customs Compliance & Audit</p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h3 className="font-semibold mb-2">Raw Material (Import)</h3>
                  <div className="space-y-1 text-sm">
                    <p><span className="text-muted-foreground">BC 2.3:</span> <span className="font-mono">{selectedRecord.bc23Number}</span></p>
                    <p><span className="text-muted-foreground">Description:</span> {selectedRecord.rmDescription}</p>
                    <p><span className="text-muted-foreground">Lot Number:</span> <span className="font-mono text-primary">{selectedRecord.rmLotNumber}</span></p>
                    <p><span className="text-muted-foreground">Quantity:</span> {selectedRecord.rmQuantity.toLocaleString()} {selectedRecord.rmUnit}</p>
                    <p><span className="text-muted-foreground">GR Date:</span> {new Date(selectedRecord.grDate).toLocaleDateString('id-ID')}</p>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Finished Goods (Export)</h3>
                  <div className="space-y-1 text-sm">
                    {selectedRecord.bc30Number ? (
                      <>
                        <p><span className="text-muted-foreground">BC 3.0:</span> <span className="font-mono">{selectedRecord.bc30Number}</span></p>
                        <p><span className="text-muted-foreground">Product:</span> {selectedRecord.productName}</p>
                        <p><span className="text-muted-foreground">Lot Number:</span> <span className="font-mono text-primary">{selectedRecord.fgLotNumber}</span></p>
                        <p><span className="text-muted-foreground">Quantity:</span> {selectedRecord.fgQuantity.toLocaleString()} {selectedRecord.fgUnit}</p>
                        <p><span className="text-muted-foreground">Export Date:</span> {selectedRecord.exportDate ? new Date(selectedRecord.exportDate).toLocaleDateString('id-ID') : '-'}</p>
                      </>
                    ) : (
                      <p className="text-muted-foreground italic">Not yet exported</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-semibold mb-2">Production Details</h3>
                <div className="grid gap-4 md:grid-cols-3 text-sm">
                  <div>
                    <p className="text-muted-foreground">Work Order</p>
                    <p className="font-mono">{selectedRecord.woNumber}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Production Date</p>
                    <p>{new Date(selectedRecord.productionDate).toLocaleDateString('id-ID')}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Conversion Ratio</p>
                    <p className="font-semibold">{(selectedRecord.conversionRatio * 100).toFixed(2)}%</p>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4 text-xs text-muted-foreground">
                <p>This certificate confirms the traceability of materials from import (BC 2.3) through production to export (BC 3.0).</p>
                <p className="mt-2">Generated on: {new Date().toLocaleDateString('id-ID')} | System: JKJ Manufacturing ERP</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* All Traceability Records */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Traceability Records</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {MOCK_TRACEABILITY.map((record) => (
                <div 
                  key={record.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedRecord.id === record.id ? 'border-primary bg-primary/5' : 'hover:bg-secondary/50'
                  }`}
                  onClick={() => setSelectedRecord(record)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">{record.productName}</p>
                      <p className="text-sm text-muted-foreground">
                        {record.rmLotNumber} → {record.fgLotNumber}
                        {record.bc30Number && ` → ${record.bc30Number}`}
                      </p>
                    </div>
                    <div className="text-right text-sm">
                      <p className="font-mono text-primary">{record.bc23Number}</p>
                      <p className="text-muted-foreground">{new Date(record.productionDate).toLocaleDateString('id-ID')}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
