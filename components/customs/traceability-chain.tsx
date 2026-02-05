'use client'

import React from 'react'
import { ArrowRight, Package, FileText, Factory, Truck, CheckCircle } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

export interface TraceabilityStep {
  type: 'BC23' | 'GR' | 'WO' | 'FG' | 'BC30'
  id: string
  number: string
  description: string
  date: string
  quantity?: string
  lotNumber?: string
  href?: string
}

interface TraceabilityChainProps {
  steps: TraceabilityStep[]
  showConversion?: boolean
  conversionData?: {
    input: number
    output: number
    ratio: number
    standardRatio: number
    variance: number
    waste: number
  }
}

export function TraceabilityChain({ steps, showConversion, conversionData }: TraceabilityChainProps) {
  const getIcon = (type: string) => {
    switch (type) {
      case 'BC23': return <FileText className="h-6 w-6 text-blue-600" />
      case 'GR': return <Package className="h-6 w-6 text-green-600" />
      case 'WO': return <Factory className="h-6 w-6 text-orange-600" />
      case 'FG': return <CheckCircle className="h-6 w-6 text-purple-600" />
      case 'BC30': return <Truck className="h-6 w-6 text-indigo-600" />
      default: return null
    }
  }

  const getColor = (type: string) => {
    switch (type) {
      case 'BC23': return 'border-blue-200 bg-blue-50'
      case 'GR': return 'border-green-200 bg-green-50'
      case 'WO': return 'border-orange-200 bg-orange-50'
      case 'FG': return 'border-purple-200 bg-purple-50'
      case 'BC30': return 'border-indigo-200 bg-indigo-50'
      default: return 'border-gray-200 bg-gray-50'
    }
  }

  const getLabel = (type: string) => {
    switch (type) {
      case 'BC23': return 'Import (BC 2.3)'
      case 'GR': return 'Goods Receipt'
      case 'WO': return 'Production'
      case 'FG': return 'Finished Goods'
      case 'BC30': return 'Export (BC 3.0)'
      default: return type
    }
  }

  return (
    <div className="space-y-6">
      {/* Traceability Chain */}
      <div className="flex flex-col lg:flex-row items-center gap-4">
        {steps.map((step, index) => (
          <React.Fragment key={step.id}>
            <Card className={`flex-1 p-4 border-2 ${getColor(step.type)} min-w-[200px]`}>
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  {getIcon(step.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <Badge variant="outline" className="mb-2 text-xs">
                    {getLabel(step.type)}
                  </Badge>
                  {step.href ? (
                    <Link href={step.href} className="block">
                      <p className="font-mono text-sm font-semibold text-primary hover:underline">
                        {step.number}
                      </p>
                    </Link>
                  ) : (
                    <p className="font-mono text-sm font-semibold">
                      {step.number}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {step.description}
                  </p>
                  <div className="mt-2 space-y-1">
                    <p className="text-xs text-muted-foreground">
                      {new Date(step.date).toLocaleDateString('id-ID')}
                    </p>
                    {step.quantity && (
                      <p className="text-xs font-medium">{step.quantity}</p>
                    )}
                    {step.lotNumber && (
                      <p className="text-xs font-mono text-primary">
                        Lot: {step.lotNumber}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </Card>
            
            {index < steps.length - 1 && (
              <ArrowRight className="hidden lg:block h-6 w-6 text-muted-foreground flex-shrink-0" />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Conversion Data */}
      {showConversion && conversionData && (
        <Card className="p-6 border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Factory className="h-5 w-5 text-amber-600" />
            Material Conversion Analysis
          </h3>
          <div className="grid gap-4 md:grid-cols-5">
            <div className="p-3 bg-white rounded-lg border">
              <p className="text-xs text-muted-foreground">Raw Material Input</p>
              <p className="text-lg font-bold">{conversionData.input.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-white rounded-lg border">
              <p className="text-xs text-muted-foreground">Finished Goods Output</p>
              <p className="text-lg font-bold text-green-600">{conversionData.output.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-white rounded-lg border">
              <p className="text-xs text-muted-foreground">Actual Ratio</p>
              <p className="text-lg font-bold">{(conversionData.ratio * 100).toFixed(2)}%</p>
            </div>
            <div className="p-3 bg-white rounded-lg border">
              <p className="text-xs text-muted-foreground">Standard Ratio</p>
              <p className="text-lg font-bold">{(conversionData.standardRatio * 100).toFixed(2)}%</p>
            </div>
            <div className={`p-3 rounded-lg border-2 ${
              conversionData.variance >= 0 ? 'bg-green-50 border-green-600' : 'bg-red-50 border-red-600'
            }`}>
              <p className="text-xs text-muted-foreground">Variance</p>
              <p className={`text-lg font-bold ${
                conversionData.variance >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {conversionData.variance > 0 ? '+' : ''}{conversionData.variance.toFixed(2)}%
              </p>
            </div>
          </div>
          <div className="mt-4 p-3 bg-white rounded-lg border">
            <p className="text-xs text-muted-foreground">Waste / Scrap</p>
            <p className="text-sm font-semibold text-orange-600">{conversionData.waste.toLocaleString()} units</p>
          </div>
        </Card>
      )}
    </div>
  )
}
