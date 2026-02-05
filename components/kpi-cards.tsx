import { TrendingUp, Package, BarChart3, Zap } from 'lucide-react'
import { Card } from '@/components/ui/card'

export default function KPICards() {
  const kpis = [
    {
      icon: TrendingUp,
      label: 'Total Sales Orders',
      value: 'Rp 15.5M',
      change: '+12%',
      changeType: 'positive',
      description: 'From last month',
    },
    {
      icon: Package,
      label: 'Active Purchase Orders',
      value: '23',
      change: '+3',
      changeType: 'positive',
      description: 'orders in progress',
    },
    {
      icon: BarChart3,
      label: 'Production Output',
      value: '45,000',
      change: '87%',
      changeType: 'positive',
      description: 'of target (cartons)',
    },
    {
      icon: Zap,
      label: 'Inventory Level',
      value: '850',
      change: '85%',
      changeType: 'neutral',
      description: 'tons (capacity)',
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {kpis.map((kpi, idx) => {
        const Icon = kpi.icon
        return (
          <Card
            key={idx}
            className="border border-border bg-card p-6 shadow-sm transition-all hover:shadow-md"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground">{kpi.label}</p>
                <p className="mt-2 text-2xl font-bold text-foreground">{kpi.value}</p>
                <div className="mt-3 flex items-center gap-2">
                  <span
                    className={`text-sm font-semibold ${
                      kpi.changeType === 'positive' ? 'text-green-600' : 'text-blue-600'
                    }`}
                  >
                    {kpi.change}
                  </span>
                  <span className="text-xs text-muted-foreground">{kpi.description}</span>
                </div>
              </div>
              <div className="rounded-lg bg-primary/10 p-3">
                <Icon className="h-6 w-6 text-primary" />
              </div>
            </div>
          </Card>
        )
      })}
    </div>
  )
}
