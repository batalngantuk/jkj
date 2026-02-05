import {
  Plus,
  ShoppingCart,
  FileText,
  BarChart3,
  ArrowRight,
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function QuickActions() {
  const actions = [
    {
      icon: ShoppingCart,
      label: 'Create Sales Order',
      description: 'New customer order',
    },
    {
      icon: FileText,
      label: 'Create Purchase Request',
      description: 'Material procurement',
    },
    {
      icon: BarChart3,
      label: 'View Production Schedule',
      description: 'Production timeline',
    },
    {
      icon: Plus,
      label: 'BC Reports',
      description: 'Submission status',
    },
  ]

  return (
    <Card className="border border-border bg-card p-6 shadow-sm">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-foreground">Quick Actions</h2>
        <p className="text-sm text-muted-foreground">Common tasks</p>
      </div>
      <div className="space-y-3">
        {actions.map((action, idx) => {
          const Icon = action.icon
          return (
            <Button
              key={idx}
              variant="outline"
              className="group h-auto flex-col items-start justify-start gap-2 border border-border bg-secondary/30 p-3 text-left hover:border-primary hover:bg-secondary/50"
            >
              <div className="flex w-full items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-primary/10 p-2">
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {action.label}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {action.description}
                    </p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-primary opacity-0 transition-opacity group-hover:opacity-100" />
              </div>
            </Button>
          )
        })}
      </div>
      <div className="mt-6 space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Recent Activity
        </p>
        <div className="space-y-2 text-xs text-muted-foreground">
          <p>✓ SO-2024-0847 approved</p>
          <p>✓ PO-2024-0256 received</p>
          <p>✓ Production batch #45 completed</p>
        </div>
      </div>
    </Card>
  )
}
