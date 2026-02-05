'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Download, Printer, Calendar, Package, TrendingUp, TrendingDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import AppLayout from '@/components/app-layout'
import { MOCK_STOCK_MOVEMENTS, generateStockMovementSummary } from '@/lib/mock-data/stock-movements'

export default function StockMovementReportPage() {
  const [selectedMaterial, setSelectedMaterial] = useState<string>('all')
  const [selectedPeriod, setSelectedPeriod] = useState<string>('2026-02')

  // Get unique materials
  const materials = Array.from(new Set(MOCK_STOCK_MOVEMENTS.map(m => m.materialCode)))
  
  // Filter movements
  const filteredMovements = MOCK_STOCK_MOVEMENTS.filter(m => {
    if (selectedMaterial !== 'all' && m.materialCode !== selectedMaterial) return false
    if (selectedPeriod && !m.date.startsWith(selectedPeriod)) return false
    return true
  })

  // Generate summary
  const summaries = generateStockMovementSummary(
    filteredMovements,
    selectedMaterial === 'all' ? undefined : selectedMaterial
  )

  const getTransactionBadge = (type: string) => {
    const variants: Record<string, { color: string; label: string }> = {
      'OPENING': { color: 'bg-gray-100 text-gray-700', label: 'Opening' },
      'IMPORT': { color: 'bg-blue-100 text-blue-700', label: 'Import' },
      'LOCAL_PURCHASE': { color: 'bg-cyan-100 text-cyan-700', label: 'Local Purchase' },
      'PRODUCTION_OUT': { color: 'bg-orange-100 text-orange-700', label: 'Production' },
      'EXPORT': { color: 'bg-green-100 text-green-700', label: 'Export' },
      'WASTE': { color: 'bg-red-100 text-red-700', label: 'Waste' },
      'ADJUSTMENT': { color: 'bg-purple-100 text-purple-700', label: 'Adjustment' },
      'RETURN': { color: 'bg-yellow-100 text-yellow-700', label: 'Return' }
    }
    
    const variant = variants[type] || { color: 'bg-gray-100 text-gray-700', label: type }
    return <Badge className={`${variant.color} text-xs`}>{variant.label}</Badge>
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
              <h1 className="text-2xl font-bold text-foreground">Laporan Mutasi Stok</h1>
              <p className="text-sm text-muted-foreground">Stock Movement Report for Customs Compliance</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2">
              <Printer className="h-4 w-4" />
              Print
            </Button>
            <Button className="gap-2">
              <Download className="h-4 w-4" />
              Export Excel
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Report Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <label className="text-sm font-medium mb-2 block">Period</label>
                <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2026-01">January 2026</SelectItem>
                    <SelectItem value="2026-02">February 2026</SelectItem>
                    <SelectItem value="2026-03">March 2026</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Material</label>
                <Select value={selectedMaterial} onValueChange={setSelectedMaterial}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Materials</SelectItem>
                    {materials.map(mat => (
                      <SelectItem key={mat} value={mat}>{mat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary Cards */}
        {summaries.map(summary => (
          <Card key={summary.materialCode} className="border-2">
            <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    {summary.materialName}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">Code: {summary.materialCode}</p>
                </div>
                <Badge variant="outline" className="text-lg px-4 py-2">
                  {summary.unit}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              {/* Balance Summary */}
              <div className="grid gap-4 md:grid-cols-4 mb-6">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-900 font-medium">Opening Balance</p>
                  <p className="text-2xl font-bold text-blue-600 mt-1">
                    {summary.openingBalance.toLocaleString()}
                  </p>
                </div>
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-900 font-medium flex items-center gap-1">
                    <TrendingUp className="h-4 w-4" />
                    Total In
                  </p>
                  <p className="text-2xl font-bold text-green-600 mt-1">
                    {summary.totalIn.toLocaleString()}
                  </p>
                </div>
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-900 font-medium flex items-center gap-1">
                    <TrendingDown className="h-4 w-4" />
                    Total Out
                  </p>
                  <p className="text-2xl font-bold text-red-600 mt-1">
                    {summary.totalOut.toLocaleString()}
                  </p>
                </div>
                <div className="p-4 bg-primary/10 border-2 border-primary rounded-lg">
                  <p className="text-sm font-semibold">Closing Balance</p>
                  <p className="text-2xl font-bold text-primary mt-1">
                    {summary.closingBalance.toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Breakdown */}
              <div className="grid gap-3 md:grid-cols-3 mb-6 p-4 bg-secondary/20 rounded-lg">
                <div>
                  <p className="text-xs text-muted-foreground">Import (BC 2.3)</p>
                  <p className="font-semibold text-blue-600">{summary.importQty.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Production</p>
                  <p className="font-semibold text-orange-600">{summary.productionOutQty.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Export (BC 3.0)</p>
                  <p className="font-semibold text-green-600">{summary.exportQty.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Waste/Scrap</p>
                  <p className="font-semibold text-red-600">{summary.wasteQty.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Local Purchase</p>
                  <p className="font-semibold">{summary.localPurchaseQty.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Adjustment</p>
                  <p className="font-semibold">{summary.adjustmentQty.toLocaleString()}</p>
                </div>
              </div>

              {/* Detailed Movements */}
              <div>
                <h3 className="font-semibold mb-3">Transaction Details</h3>
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-secondary/50">
                        <TableHead>Date</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Reference</TableHead>
                        <TableHead>Lot Number</TableHead>
                        <TableHead className="text-right">In</TableHead>
                        <TableHead className="text-right">Out</TableHead>
                        <TableHead className="text-right">Balance</TableHead>
                        <TableHead>Notes</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredMovements
                        .filter(m => m.materialCode === summary.materialCode)
                        .map(movement => (
                          <TableRow key={movement.id}>
                            <TableCell className="font-mono text-sm">
                              {new Date(movement.date).toLocaleDateString('id-ID')}
                            </TableCell>
                            <TableCell>{getTransactionBadge(movement.transactionType)}</TableCell>
                            <TableCell>
                              {movement.referenceType !== 'NONE' ? (
                                <div>
                                  <p className="font-mono text-xs text-primary">{movement.referenceNumber}</p>
                                  <p className="text-xs text-muted-foreground">{movement.referenceType}</p>
                                </div>
                              ) : (
                                <span className="text-muted-foreground">-</span>
                              )}
                            </TableCell>
                            <TableCell>
                              {movement.lotNumber ? (
                                <span className="font-mono text-xs">{movement.lotNumber}</span>
                              ) : (
                                <span className="text-muted-foreground">-</span>
                              )}
                            </TableCell>
                            <TableCell className="text-right font-semibold text-green-600">
                              {movement.quantityIn > 0 ? movement.quantityIn.toLocaleString() : '-'}
                            </TableCell>
                            <TableCell className="text-right font-semibold text-red-600">
                              {movement.quantityOut > 0 ? movement.quantityOut.toLocaleString() : '-'}
                            </TableCell>
                            <TableCell className="text-right font-bold">
                              {movement.runningBalance.toLocaleString()}
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {movement.notes || '-'}
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Compliance Note */}
        <Card className="border-2 border-green-200 bg-green-50/50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <p className="font-semibold text-green-900">Customs Compliance Note</p>
                <p className="text-sm text-green-800 mt-1">
                  This report tracks all stock movements with references to BC 2.3 (Import), BC 3.0 (Export), and Work Orders for complete material traceability as required by Bea Cukai regulations.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
