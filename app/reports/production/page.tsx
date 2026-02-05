'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Download, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Package, Factory } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import AppLayout from '@/components/app-layout'
import { MOCK_TRACEABILITY } from '@/lib/mock-data/traceability'

export default function ProductionReportPage() {
  const [selectedPeriod, setSelectedPeriod] = useState<string>('2026-02')

  // Filter by period
  const filteredRecords = MOCK_TRACEABILITY.filter(t => 
    t.productionDate.startsWith(selectedPeriod)
  )

  // Calculate overall stats
  const totalProduction = filteredRecords.length
  const totalRMUsed = filteredRecords.reduce((sum, t) => sum + t.rmQuantity, 0)
  const totalFGProduced = filteredRecords.reduce((sum, t) => sum + t.fgQuantity, 0)
  const totalWaste = filteredRecords.reduce((sum, t) => sum + t.waste, 0)
  const avgConversionRatio = filteredRecords.reduce((sum, t) => sum + t.conversionRatio, 0) / filteredRecords.length
  const avgVariance = filteredRecords.reduce((sum, t) => sum + t.variance, 0) / filteredRecords.length

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
              <h1 className="text-2xl font-bold text-foreground">Laporan Konversi Bahan Baku</h1>
              <p className="text-sm text-muted-foreground">Production Conversion & Material Efficiency Report</p>
            </div>
          </div>
          <Button className="gap-2">
            <Download className="h-4 w-4" />
            Export Report
          </Button>
        </div>

        {/* Period Filter */}
        <Card>
          <CardHeader>
            <CardTitle>Report Period</CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2026-01">January 2026</SelectItem>
                <SelectItem value="2026-02">February 2026</SelectItem>
                <SelectItem value="2026-03">March 2026</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Summary Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Production</CardTitle>
              <Factory className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalProduction}</div>
              <p className="text-xs text-muted-foreground">Work orders completed</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Conversion</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {(avgConversionRatio * 100).toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground">RM to FG conversion rate</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Variance</CardTitle>
              {avgVariance >= 0 ? (
                <TrendingUp className="h-4 w-4 text-green-600" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-600" />
              )}
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${avgVariance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {avgVariance >= 0 ? '+' : ''}{avgVariance.toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground">vs standard ratio</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Waste</CardTitle>
              <AlertTriangle className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {totalWaste.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">Units of scrap/waste</p>
            </CardContent>
          </Card>
        </div>

        {/* Conversion Analysis Table */}
        <Card>
          <CardHeader>
            <CardTitle>Konversi Bahan Baku Detail</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-secondary/50">
                    <TableHead>Work Order</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>BC 2.3 Reference</TableHead>
                    <TableHead>RM Input</TableHead>
                    <TableHead>FG Output</TableHead>
                    <TableHead>Conversion</TableHead>
                    <TableHead>Variance</TableHead>
                    <TableHead>Waste</TableHead>
                    <TableHead>BC 3.0</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRecords.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>
                        <Link href={`/production/wo/${record.woId}`} className="font-mono text-sm text-primary hover:underline">
                          {record.woNumber}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{record.productName}</p>
                          <p className="text-xs text-muted-foreground">Lot: {record.fgLotNumber}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Link href={`/purchasing/bc23/${record.bc23Id}`} className="font-mono text-xs text-blue-600 hover:underline">
                          {record.bc23Number}
                        </Link>
                        <p className="text-xs text-muted-foreground">Lot: {record.rmLotNumber}</p>
                      </TableCell>
                      <TableCell>
                        <div className="text-right">
                          <p className="font-semibold">{record.rmQuantity.toLocaleString()}</p>
                          <p className="text-xs text-muted-foreground">{record.rmUnit}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-right">
                          <p className="font-semibold">{record.fgQuantity.toLocaleString()}</p>
                          <p className="text-xs text-muted-foreground">{record.fgUnit}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-center">
                          <Badge className="bg-blue-100 text-blue-700">
                            {(record.conversionRatio * 100).toFixed(1)}%
                          </Badge>
                          <p className="text-xs text-muted-foreground mt-1">
                            Std: {(record.standardRatio * 100).toFixed(1)}%
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-center">
                          <Badge className={
                            record.variance >= 0 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-red-100 text-red-700'
                          }>
                            {record.variance >= 0 ? '+' : ''}{record.variance.toFixed(1)}%
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-right">
                          <p className="font-semibold text-orange-600">{record.waste.toLocaleString()}</p>
                          <p className="text-xs text-muted-foreground">{record.rmUnit}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {record.bc30Id ? (
                          <Link href={`/logistics/bc30/${record.bc30Id}`} className="font-mono text-xs text-green-600 hover:underline">
                            {record.bc30Number}
                          </Link>
                        ) : (
                          <Badge variant="outline" className="text-xs">Pending</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Material Breakdown */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Input Materials */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5 text-blue-600" />
                Input Materials (Import)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Array.from(new Set(filteredRecords.map(r => r.rmDescription))).map((material, idx) => {
                  const records = filteredRecords.filter(r => r.rmDescription === material)
                  const totalQty = records.reduce((sum, r) => sum + r.rmQuantity, 0)
                  const bc23Refs = Array.from(new Set(records.map(r => r.bc23Number)))
                  
                  return (
                    <div key={idx} className="p-3 border rounded-lg">
                      <p className="font-semibold">{material}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-sm text-muted-foreground">Total Used</span>
                        <span className="font-bold text-blue-600">{totalQty.toLocaleString()} {records[0].rmUnit}</span>
                      </div>
                      <div className="mt-2 pt-2 border-t">
                        <p className="text-xs text-muted-foreground">BC 2.3 References:</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {bc23Refs.map(bc => (
                            <Badge key={bc} variant="outline" className="text-xs font-mono">
                              {bc}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Output Products */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5 text-green-600" />
                Output Products (Export)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Array.from(new Set(filteredRecords.map(r => r.productName))).map((product, idx) => {
                  const records = filteredRecords.filter(r => r.productName === product)
                  const totalQty = records.reduce((sum, r) => sum + r.fgQuantity, 0)
                  const exported = records.filter(r => r.bc30Id).length
                  const pending = records.length - exported
                  
                  return (
                    <div key={idx} className="p-3 border rounded-lg">
                      <p className="font-semibold">{product}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-sm text-muted-foreground">Total Produced</span>
                        <span className="font-bold text-green-600">{totalQty.toLocaleString()} {records[0].fgUnit}</span>
                      </div>
                      <div className="mt-2 pt-2 border-t">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">Export Status:</span>
                          <div className="flex gap-2">
                            <Badge className="bg-green-100 text-green-700">
                              {exported} Exported
                            </Badge>
                            {pending > 0 && (
                              <Badge variant="outline">
                                {pending} Pending
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Compliance Note */}
        <Card className="border-2 border-blue-200 bg-blue-50/50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <p className="font-semibold text-blue-900">Bea Cukai Compliance</p>
                <p className="text-sm text-blue-800 mt-1">
                  This report shows complete material conversion from BC 2.3 (Import) through production to BC 3.0 (Export), 
                  including conversion ratios, variance analysis, and waste tracking as required for customs audits.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
