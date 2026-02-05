import { AlertCircle, Clock, AlertTriangle, CheckCircle, X } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function AlertsSection() {
  const alerts = [
    {
      id: 1,
      title: 'PO Customer awaiting approval',
      count: 3,
      severity: 'warning',
      icon: Clock,
    },
    {
      id: 2,
      title: 'Latex stock below reorder point',
      count: 1,
      severity: 'critical',
      icon: AlertTriangle,
    },
    {
      id: 3,
      title: 'Work Orders delayed',
      count: 2,
      severity: 'warning',
      icon: Clock,
    },
    {
      id: 4,
      title: 'BC 2.3 pending submission',
      count: 4,
      severity: 'critical',
      icon: AlertCircle,
    },
    {
      id: 5,
      title: 'Invoices due this week',
      count: 5,
      severity: 'warning',
      icon: Clock,
    },
  ]

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-50 border-red-200 text-red-700'
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-700'
      case 'info':
        return 'bg-blue-50 border-blue-200 text-blue-700'
      default:
        return 'bg-gray-50 border-gray-200 text-gray-700'
    }
  }

  const getSeverityDot = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-600'
      case 'warning':
        return 'bg-yellow-500'
      default:
        return 'bg-blue-500'
    }
  }

  return (
    <Card className="border border-border bg-card p-6 shadow-sm lg:col-span-2">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-foreground">Alerts & Notifications</h2>
        <p className="text-sm text-muted-foreground">Active system alerts</p>
      </div>
      <div className="space-y-3">
        {alerts.map((alert) => {
          const Icon = alert.icon
          const severityColor = getSeverityColor(alert.severity)
          const severityDot = getSeverityDot(alert.severity)

          return (
            <div
              key={alert.id}
              className={`flex items-center justify-between gap-3 rounded-lg border p-3 ${severityColor}`}
            >
              <div className="flex items-center gap-3 flex-1">
                <div className={`h-2 w-2 rounded-full ${severityDot}`}></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{alert.title}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-white/50 px-2 py-1 text-xs font-bold">
                  {alert.count}
                </span>
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )
        })}
      </div>
      <Button className="mt-4 w-full bg-primary text-primary-foreground hover:bg-primary/90">
        View All Alerts
      </Button>
    </Card>
  )
}
