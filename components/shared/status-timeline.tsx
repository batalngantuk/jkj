import { Check, Circle, Clock } from "lucide-react"
import { cn } from "@/lib/utils"

export interface TimelineStep {
  id: string
  label: string
  date?: string
  status: 'completed' | 'current' | 'upcoming' | 'error'
  description?: string
}

interface StatusTimelineProps {
  steps: TimelineStep[]
  className?: string
}

export function StatusTimeline({ steps, className }: StatusTimelineProps) {
  return (
    <div className={cn("w-full", className)}>
      <div className="relative">
        {/* Connecting Line */}
        <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-border -z-10" />

        <div className="space-y-6">
          {steps.map((step, index) => (
            <div key={step.id} className="flex gap-4 group">
              {/* Icon Bubble */}
              <div 
                className={cn(
                  "h-8 w-8 rounded-full flex items-center justify-center border-2 shrink-0 z-10 transition-colors",
                  step.status === 'completed' 
                    ? "bg-primary border-primary text-primary-foreground" 
                    : step.status === 'current'
                    ? "bg-background border-primary text-primary"
                    : step.status === 'error'
                    ? "bg-red-100 border-red-500 text-red-600"
                    : "bg-background border-muted text-muted-foreground"
                )}
              >
                {step.status === 'completed' && <Check className="h-4 w-4" />}
                {step.status === 'current' && <div className="h-2.5 w-2.5 rounded-full bg-primary animate-pulse" />}
                {step.status === 'upcoming' && <Circle className="h-4 w-4" />}
                {step.status === 'error' && <div className="h-4 w-4 font-bold text-center leading-none">!</div>}
              </div>

              {/* Content */}
              <div className="pt-1 flex-1">
                <div className="flex justify-between items-start">
                  <h4 
                    className={cn(
                      "text-sm font-medium leading-none",
                      step.status === 'current' ? "text-primary font-semibold" : "text-foreground"
                    )}
                  >
                    {step.label}
                  </h4>
                  {step.date && (
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {step.date}
                    </span>
                  )}
                </div>
                {step.description && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {step.description}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
