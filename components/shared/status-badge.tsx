import { cn } from "@/lib/utils"

interface StatusBadgeProps {
  status: string
  className?: string
  size?: 'sm' | 'md'
}

export function StatusBadge({ status, className, size = 'sm' }: StatusBadgeProps) {
  const getStatusColor = (statusName: string) => {
    const s = statusName.toUpperCase()
    if (['COMPLETED', 'APPROVED', 'PAID', 'DELIVERED', 'SHIPPED', 'QC PASS'].includes(s)) 
      return 'bg-green-100 text-green-800 border-green-200'
      
    if (['PENDING', 'DRAFT', 'SETUP', 'WAITING'].includes(s)) 
      return 'bg-gray-100 text-gray-800 border-gray-200'
      
    if (['IN PROGRESS', 'IN PRODUCTION', 'PROCESSING', 'IN TRANSIT'].includes(s)) 
      return 'bg-blue-100 text-blue-800 border-blue-200'
      
    if (['WARNING', 'REJECTED', 'FAILED', 'OVERDUE', 'CRITICAL', 'RETURNED'].includes(s)) 
      return 'bg-red-100 text-red-800 border-red-200'
      
    if (['SUBMITTED', 'UNDER REVIEW', 'AWAITING APPROVAL', 'READY TO SHIP'].includes(s)) 
      return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      
    if (['SENT', 'ISSUED', 'RELEASED'].includes(s)) 
      return 'bg-purple-100 text-purple-800 border-purple-200'

    return 'bg-gray-100 text-gray-800 border-gray-200'
  }

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-full border px-2.5 py-0.5 font-medium whitespace-nowrap",
        getStatusColor(status),
        size === 'sm' ? "text-xs" : "text-sm px-3 py-1",
        className
      )}
    >
      {status}
    </span>
  )
}
