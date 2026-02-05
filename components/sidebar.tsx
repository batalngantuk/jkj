'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Layout,
  ShoppingCart,
  FileText,
  Boxes,
  Factory,
  Truck,
  DollarSign,
  BarChart3,
  ChevronDown,
  ChevronRight,
  Settings,
  HelpCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

export default function Sidebar() {
  const pathname = usePathname()
  const [openItems, setOpenItems] = useState<string[]>([])

  // Auto-expand based on active path
  useEffect(() => {
    menuItems.forEach(item => {
      if (item.subItems && item.subItems.some(sub => pathname.startsWith(sub.href))) {
        setOpenItems(prev => prev.includes(item.label) ? prev : [...prev, item.label])
      }
    })
  }, [pathname])

  const toggleItem = (label: string) => {
    setOpenItems(prev => 
      prev.includes(label) 
        ? prev.filter(item => item !== label)
        : [...prev, label]
    )
  }

  const menuItems = [
    { icon: Layout, label: 'Dashboard', href: '/' },
    { 
      icon: ShoppingCart, 
      label: 'Sales Orders', 
      href: '/sales',
      subItems: [
        { label: 'All Orders', href: '/sales' },
        { label: 'Create Order', href: '/sales/create' },
      ]
    },
    { 
      icon: Factory, 
      label: 'Production', 
      href: '/production',
      subItems: [
        { label: 'Dashboard', href: '/production' },
        { label: 'Planning', href: '/production/planning' },
        { label: 'Work Orders', href: '/production/wo' },
      ]
    },
    { 
      icon: Boxes, 
      label: 'Warehouse', 
      href: '/warehouse',
      subItems: [
        { label: 'Dashboard', href: '/warehouse' },
        { label: 'Inbound / Receiving', href: '/warehouse/inbound' },
        { label: 'Outbound / Shipping', href: '/warehouse/outbound' },
      ]
    },
    { 
      icon: FileText, 
      label: 'Purchasing', 
      href: '/purchasing',
      subItems: [
        { label: 'Dashboard', href: '/purchasing' },
        { label: 'Suppliers', href: '/purchasing/suppliers' },
        { label: 'Purchase Orders', href: '/purchasing/po' },
      ]
    },
    { 
      icon: Truck, 
      label: 'Logistics', 
      href: '/logistics',
      subItems: [
        { label: 'Dashboard', href: '/logistics' },
        { label: 'Fleet Management', href: '/logistics/fleet' },
        { label: 'Shipments', href: '/logistics/shipments' },
      ]
    },
    { 
      icon: DollarSign, 
      label: 'Finance', 
      href: '/finance',
      subItems: [
        { label: 'Dashboard', href: '/finance' },
        { label: 'Invoices & Bills', href: '/finance/invoices' },
        { label: 'Financial Reports', href: '/finance/reports' },
      ]
    },
    { 
      icon: BarChart3, 
      label: 'Reports', 
      href: '/reports',
      subItems: [
        { label: 'Overview', href: '/reports' },
        { label: 'Sales Analysis', href: '/reports/sales' },
        { label: 'Production Yield', href: '/reports/production' },
        { label: 'Inventory Value', href: '/reports/inventory' },
      ]
    },
  ]

  return (
    <div className="w-64 border-r border-border bg-sidebar text-sidebar-foreground shadow-md h-screen overflow-y-auto">
      {/* Sidebar Content */}
      <div className="flex flex-col gap-6 p-6">
        {/* Header */}
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/60">
            Menu
          </h3>
        </div>

        {/* Menu Items */}
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isOpen = openItems.includes(item.label)
            const isActive = item.href === '/' 
              ? pathname === '/'
              : pathname.startsWith(item.href)
            
            const hasSubItems = item.subItems && item.subItems.length > 0

            if (hasSubItems) {
                return (
                    <Collapsible
                        key={item.label}
                        open={isOpen}
                        onOpenChange={() => toggleItem(item.label)}
                        className="w-full"
                    >
                        <CollapsibleTrigger asChild>
                             <Button
                                variant="ghost"
                                className={`w-full justify-between group ${
                                    isActive ? 'text-primary font-medium' : 'text-muted-foreground'
                                }`}
                             >
                                <div className="flex items-center gap-3">
                                    <Icon className="h-4 w-4" />
                                    <span>{item.label}</span>
                                </div>
                                {isOpen ? (
                                    <ChevronDown className="h-3 w-3 opacity-50" />
                                ) : (
                                    <ChevronRight className="h-3 w-3 opacity-50" />
                                )}
                             </Button>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="pl-9 space-y-1 pt-1">
                            {item.subItems?.map((sub) => {
                                const isSubActive = pathname === sub.href
                                return (
                                    <Link key={sub.href} href={sub.href} className="block">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className={`w-full justify-start h-8 text-sm ${
                                                isSubActive 
                                                    ? 'bg-secondary text-primary font-medium' 
                                                    : 'text-muted-foreground hover:text-foreground'
                                            }`}
                                        >
                                            {sub.label}
                                        </Button>
                                    </Link>
                                )
                            })}
                        </CollapsibleContent>
                    </Collapsible>
                )
            }

            return (
              <Link key={item.label} href={item.href}>
                <Button
                  variant={isActive ? 'secondary' : 'ghost'}
                  className={`w-full justify-start gap-3 ${
                    isActive
                      ? 'bg-secondary text-primary font-medium'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Button>
              </Link>
            )
          })}
        </nav>

        {/* Divider */}
        <div className="border-t border-sidebar-border"></div>

        {/* Tools Section */}
        <div className="space-y-1">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/60 mb-2 px-2">
            Tools
          </h3>
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-muted-foreground"
          >
            <Settings className="h-4 w-4" />
            <span>Settings</span>
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-muted-foreground"
          >
            <HelpCircle className="h-4 w-4" />
            <span>Help & Support</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
