import { Button } from "@/components/ui/button"
import { Check, X, RotateCcw } from "lucide-react"

interface ApprovalButtonGroupProps {
  onApprove: () => void
  onReject: () => void
  onRevise?: () => void
  status: string
  isLoading?: boolean
  className?: string
}

export function ApprovalButtonGroup({ 
  onApprove, 
  onReject, 
  onRevise, 
  status, 
  isLoading = false,
  className 
}: ApprovalButtonGroupProps) {
  
  if (status !== 'PENDING APPROVAL' && status !== 'SUBMITTED' && status !== 'UNDER REVIEW') {
    return null
  }

  return (
    <div className={`flex gap-2 ${className}`}>
      <Button 
        variant="default" 
        className="bg-green-600 hover:bg-green-700 gap-2"
        onClick={onApprove}
        disabled={isLoading}
      >
        <Check className="h-4 w-4" />
        Approve
      </Button>
      
      {onRevise && (
        <Button 
          variant="outline" 
          className="border-yellow-500 text-yellow-600 hover:bg-yellow-50 hover:text-yellow-700 gap-2"
          onClick={onRevise}
          disabled={isLoading}
        >
          <RotateCcw className="h-4 w-4" />
          Request Revision
        </Button>
      )}

      <Button 
        variant="destructive" 
        className="gap-2"
        onClick={onReject}
        disabled={isLoading}
      >
        <X className="h-4 w-4" />
        Reject
      </Button>
    </div>
  )
}
