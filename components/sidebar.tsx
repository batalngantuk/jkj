'use client'

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
} from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function Sidebar() {
  const pathname = usePathname()

  const menuItems = [
    { icon: Layout, label: 'Dashboard', href: '/' },
    { icon: ShoppingCart, label: 'Sales Orders', href: '/sales' },
    { icon: FileText, label: 'Purchase Orders', href: '/purchasing' },
    { icon: Boxes, label: 'Warehouse', href: '/warehouse' },
    { icon: Factory, label: 'Production', href: '/production' },
    { icon: Truck, label: 'Logistics', href: '/logistics' },
    { icon: DollarSign, label: 'Finance', href: '/finance' },
    { icon: BarChart3, label: 'Reports', href: '/reports' },
  ]

  return (
    <div className="w-64 border-r border-border bg-sidebar text-sidebar-foreground shadow-md">
      {/* Sidebar Content */}
      <div className="flex flex-col gap-6 p-6">
        {/* Header */}
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/60">
            Quick Access
          </h3>
        </div>

        {/* Menu Items */}
        <nav className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = item.href === '/' 
              ? pathname === '/'
              : pathname.startsWith(item.href)

            return (
              <Link key={item.label} href={item.href}>
                <Button
                  variant={isActive ? 'default' : 'ghost'}
                  className={`w-full justify-start gap-3 ${
                    isActive
                      ? 'bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary'
                      : 'text-sidebar-foreground hover:bg-sidebar-accent'
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

        {/* Additional Section */}
        <div className="space-y-2">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/60">
            Tools
          </h3>
          <Button
            variant="ghost"
            className="w-full justify-between text-sidebar-foreground hover:bg-sidebar-accent"
          >
            <span>Settings</span>
            <ChevronDown className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent"
          >
            Help & Support
          </Button>
        </div>
      </div>
    </div>
  )
}
