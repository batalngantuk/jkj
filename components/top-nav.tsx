'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Bell, User, LogOut, Settings, Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface TopNavProps {
  onMenuClick: () => void
}

export default function TopNav({ onMenuClick }: TopNavProps) {
  const pathname = usePathname()

  const navItems = [
    { label: 'Dashboard', href: '/' },
    { label: 'Sales', href: '/sales' },
    { label: 'Purchasing', href: '/purchasing' },
    { label: 'Warehouse', href: '/warehouse' },
    { label: 'Production', href: '/production' },
    { label: 'Logistics', href: '/logistics' },
    { label: 'Finance', href: '/finance' },
    { label: 'Reports', href: '/reports' },
  ]

  return (
    <nav className="border-b border-border bg-card shadow-sm">
      <div className="flex h-16 items-center justify-between px-6">
        {/* Left Section: Hamburger + Logo */}
        <div className="flex items-center gap-4">
          {/* Hamburger Menu */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="lg:hidden"
            onClick={onMenuClick}
          >
            <Menu className="h-5 w-5" />
          </Button>

          {/* Logo and Company Name */}
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <span className="text-sm font-bold text-primary-foreground">JKJ</span>
            </div>
            <span className="text-lg font-bold text-foreground hidden sm:block">JKJ Manufacturing</span>
          </Link>
        </div>

        {/* Menu Items - Hidden on mobile */}
        <div className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
            >
              <Button
                variant="ghost"
                className={`text-foreground hover:bg-secondary ${
                  pathname === item.href ? 'bg-secondary' : ''
                }`}
                size="sm"
              >
                {item.label}
              </Button>
            </Link>
          ))}
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-4">
          {/* Notification Bell */}
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5 text-foreground" />
            <span className="absolute right-2 top-1 h-2 w-2 rounded-full bg-red-500"></span>
          </Button>

          {/* User Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full border border-border"
              >
                <User className="h-5 w-5 text-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Profile</DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  )
}
