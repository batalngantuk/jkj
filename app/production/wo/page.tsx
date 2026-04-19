'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Plus, Search, Eye, Factory, CheckCircle, Clock, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import AppLayout from '@/components/app-layout'
import { useWorkOrders } from '@/lib/store/hooks'

const STATUS_COLOR: Record<string, string> = {
  'PLANNED': 'bg-gray-100 text-gray-700 border-gray-300',
  'IN PROGRESS': 'bg-blue-100 text-blue-700 border-blue-300',
  'QC INSPECTION': 'bg-yellow-100 text-yellow-700 border-yellow-300',
  'COMPLETED': 'bg-green-100 text-green-700 border-green-300',
  'ON HOLD': 'bg-red-100 text-red-700 border-red-300',
}

export default function WorkOrderListPage() {
  const { workOrders } = useWorkOrders()
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')

  const filtered = workOrders.filter(wo => {
    const matchSearch = wo.id.toLowerCase().includes(search.toLowerCase()) ||
      wo.product.toLowerCase().includes(search.toLowerCase()) ||
      wo.soNumber.toLowerCase().includes(search.toLowerCase())
    const matchStatus = filterStatus === 'all' || wo.status === filterStatus
    return matchSearch && matchStatus
  })

  const counts = {
    all: workOrders.length,
    planned: workOrders.filter(w => w.status === 'PLANNED').length,
    inProgress: workOrders.filter(w => w.status === 'IN PROGRESS').length,
    qc: workOrders.filter(w => w.status === 'QC INSPECTION').length,
    completed: workOrders.filter(w => w.status === 'COMPLETED').length,
  }

  return (
    <AppLayout>
      <div className="p-6 space-y-6">

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/production">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Work Orders</h1>
              <p className="text-sm text-muted-foreground">Daftar semua perintah produksi</p>
            </div>
          </div>
          <Link href="/production/wo/new">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Buat WO Baru
            </Button>
          </Link>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <Card className="cursor-pointer hover:bg-accent/50" onClick={() => setFilterStatus('all')}>
            <CardContent className="pt-4 pb-3">
              <p className="text-xs text-muted-foreground">Total</p>
              <p className="text-2xl font-bold">{counts.all}</p>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:bg-accent/50" onClick={() => setFilterStatus('PLANNED')}>
            <CardContent className="pt-4 pb-3">
              <p className="text-xs text-muted-foreground">Planned</p>
              <p className="text-2xl font-bold text-gray-600">{counts.planned}</p>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:bg-accent/50" onClick={() => setFilterStatus('IN PROGRESS')}>
            <CardContent className="pt-4 pb-3">
              <p className="text-xs text-muted-foreground">In Progress</p>
              <p className="text-2xl font-bold text-blue-600">{counts.inProgress}</p>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:bg-accent/50" onClick={() => setFilterStatus('QC INSPECTION')}>
            <CardContent className="pt-4 pb-3">
              <p className="text-xs text-muted-foreground">QC Inspection</p>
              <p className="text-2xl font-bold text-yellow-600">{counts.qc}</p>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:bg-accent/50" onClick={() => setFilterStatus('COMPLETED')}>
            <CardContent className="pt-4 pb-3">
              <p className="text-xs text-muted-foreground">Completed</p>
              <p className="text-2xl font-bold text-green-600">{counts.completed}</p>
            </CardContent>
          </Card>
        </div>

        {/* Filter & Search */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="relative flex-1 max-w-xs">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari WO, produk, SO..."
                  className="pl-8"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-44">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status</SelectItem>
                  <SelectItem value="PLANNED">Planned</SelectItem>
                  <SelectItem value="IN PROGRESS">In Progress</SelectItem>
                  <SelectItem value="QC INSPECTION">QC Inspection</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                  <SelectItem value="ON HOLD">On Hold</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>No. WO</TableHead>
                  <TableHead>No. SO</TableHead>
                  <TableHead>Produk</TableHead>
                  <TableHead className="text-right">Qty Target</TableHead>
                  <TableHead>Line Produksi</TableHead>
                  <TableHead>Tgl Mulai</TableHead>
                  <TableHead>Tgl Selesai</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center text-muted-foreground py-10">
                      Tidak ada WO ditemukan
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((wo) => (
                    <TableRow key={wo.id}>
                      <TableCell className="font-medium text-primary">{wo.id}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">{wo.soNumber}</TableCell>
                      <TableCell>{wo.product}</TableCell>
                      <TableCell className="text-right font-medium">{wo.quantity.toLocaleString()}</TableCell>
                      <TableCell className="text-sm">{wo.line}</TableCell>
                      <TableCell className="text-sm">{wo.startDate}</TableCell>
                      <TableCell className="text-sm">{wo.endDate}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 min-w-[80px]">
                          <Progress value={wo.progress} className="h-1.5 w-16" />
                          <span className="text-xs text-muted-foreground">{wo.progress}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`text-xs ${STATUS_COLOR[wo.status] || ''}`}>
                          {wo.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Link href={`/production/wo/${wo.id}`}>
                          <Button variant="ghost" size="sm" className="gap-1">
                            <Eye className="h-3.5 w-3.5" />
                            Detail
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

      </div>
    </AppLayout>
  )
}
