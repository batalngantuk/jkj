'use client'

import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Card } from '@/components/ui/card'

export default function ChartSection() {
  const salesData = [
    { month: 'Jan', sales: 12500000, target: 13000000 },
    { month: 'Feb', sales: 13200000, target: 13000000 },
    { month: 'Mar', sales: 14100000, target: 14500000 },
    { month: 'Apr', sales: 13800000, target: 13500000 },
    { month: 'May', sales: 15200000, target: 15000000 },
    { month: 'Jun', sales: 15500000, target: 15500000 },
  ]

  const productionData = [
    { week: 'W1', target: 11000, actual: 9800 },
    { week: 'W2', target: 11500, actual: 10500 },
    { week: 'W3', target: 11000, actual: 10200 },
    { week: 'W4', target: 11500, actual: 14500 },
  ]

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Sales Trend Chart */}
      <Card className="border border-border bg-card p-6 shadow-sm">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-foreground">Sales Trend</h2>
          <p className="text-sm text-muted-foreground">Last 6 months performance</p>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={salesData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis dataKey="month" stroke="var(--color-muted-foreground)" />
            <YAxis stroke="var(--color-muted-foreground)" />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--color-card)',
                border: '1px solid var(--color-border)',
                borderRadius: '0.75rem',
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="sales"
              stroke="var(--color-primary)"
              strokeWidth={2}
              dot={{ fill: 'var(--color-primary)', r: 4 }}
              name="Actual Sales"
            />
            <Line
              type="monotone"
              dataKey="target"
              stroke="var(--color-muted-foreground)"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={{ fill: 'var(--color-muted-foreground)', r: 4 }}
              name="Target"
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* Production Performance Chart */}
      <Card className="border border-border bg-card p-6 shadow-sm">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-foreground">Production Performance</h2>
          <p className="text-sm text-muted-foreground">Current month weekly output</p>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={productionData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis dataKey="week" stroke="var(--color-muted-foreground)" />
            <YAxis stroke="var(--color-muted-foreground)" />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--color-card)',
                border: '1px solid var(--color-border)',
                borderRadius: '0.75rem',
              }}
            />
            <Legend />
            <Bar dataKey="target" fill="var(--color-secondary-foreground)" name="Target" />
            <Bar dataKey="actual" fill="var(--color-primary)" name="Actual Output" />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  )
}
