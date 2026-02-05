'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowLeft, Plus, Search, Mail, Phone, MapPin, MoreHorizontal, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import AppLayout from '@/components/app-layout'

import { DataTable } from '@/components/shared/data-table'
import { StatusBadge } from "@/components/shared/status-badge"
import { MOCK_SUPPLIERS, Supplier } from "@/lib/mock-data/purchasing"

export default function SupplierListPage() {
  const columns = [
    {
       header: "Supplier Name",
       accessorKey: "name" as keyof typeof MOCK_SUPPLIERS[0],
       cell: (item: typeof MOCK_SUPPLIERS[0]) => (
           <div>
               <p className="font-semibold">{item.name}</p>
               <p className="text-xs text-muted-foreground">{item.id}</p>
           </div>
       )
    },
    { header: "Contact Person", accessorKey: "contactPerson" as keyof typeof MOCK_SUPPLIERS[0] },
    { 
        header: "Contact Info", 
        cell: (item: typeof MOCK_SUPPLIERS[0]) => (
            <div className="space-y-1 text-sm">
                <div className="flex items-center gap-2">
                    <Mail className="h-3 w-3 text-muted-foreground" />
                    <span>{item.email}</span>
                </div>
                <div className="flex items-center gap-2">
                    <Phone className="h-3 w-3 text-muted-foreground" />
                    <span>{item.phone}</span>
                </div>
            </div>
        )
    },
    {
       header: "Rating",
       accessorKey: "rating" as keyof typeof MOCK_SUPPLIERS[0],
       cell: (item: typeof MOCK_SUPPLIERS[0]) => (
           <div className="flex items-center gap-1">
               <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
               <span className="font-medium">{item.rating}</span>
           </div>
       )
    },
    {
       header: "Status",
       accessorKey: "status" as keyof typeof MOCK_SUPPLIERS[0],
       cell: (item: typeof MOCK_SUPPLIERS[0]) => (
           <StatusBadge status={item.status} />
       )
    },
    {
       header: "Action",
       cell: (item: typeof MOCK_SUPPLIERS[0]) => (
           <DropdownMenu>
               <DropdownMenuTrigger asChild>
                   <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                       <MoreHorizontal className="h-4 w-4" />
                   </Button>
               </DropdownMenuTrigger>
               <DropdownMenuContent align="end">
                   <DropdownMenuItem>View Profile</DropdownMenuItem>
                   <DropdownMenuItem>Edit Details</DropdownMenuItem>
                   <DropdownMenuItem className="text-red-600">Deactivate</DropdownMenuItem>
               </DropdownMenuContent>
           </DropdownMenu>
       )
    }
  ]

  return (
    <AppLayout><div className="p-6">
          <div className="space-y-6">
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link href="/purchasing">
                  <Button variant="ghost" size="icon">
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                </Link>
                <div>
                  <h1 className="text-2xl font-bold text-foreground">Supplier Management</h1>
                  <p className="text-sm text-muted-foreground">Manage vendor relationships and performance</p>
                </div>
              </div>
              <Button className="bg-primary hover:bg-primary/90 gap-2">
                <Plus className="h-4 w-4" />
                Add Supplier
              </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Registered Suppliers</CardTitle>
                    <CardDescription>List of all approved vendors for raw materials and supplies.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between mb-4">
                        <div className="relative w-72">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Search supplier name..." className="pl-8" />
                        </div>
                    </div>
                    <DataTable 
                        data={MOCK_SUPPLIERS}
                        columns={columns}
                    />
                </CardContent>
            </Card>

          </div>
        </div></AppLayout>)
}
