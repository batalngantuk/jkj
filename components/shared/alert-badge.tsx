import { Badge } from "@/components/ui/badge";
import { AlertCircle, AlertTriangle, CheckCircle, Info } from "lucide-react";

type AlertType = "critical" | "warning" | "info" | "success";

interface AlertBadgeProps {
  type: AlertType;
  message: string;
  className?: string;
}

export function AlertBadge({ type, message, className }: AlertBadgeProps) {
  const getStyles = () => {
    switch (type) {
      case "critical":
        return "bg-red-100 text-red-800 hover:bg-red-200 border-red-200";
      case "warning":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200 border-yellow-200";
      case "success":
        return "bg-green-100 text-green-800 hover:bg-green-200 border-green-200";
      case "info":
      default:
        return "bg-blue-100 text-blue-800 hover:bg-blue-200 border-blue-200";
    }
  };

  const getIcon = () => {
    switch (type) {
      case "critical":
        return <AlertCircle className="h-3 w-3 mr-1" />;
      case "warning":
        return <AlertTriangle className="h-3 w-3 mr-1" />;
      case "success":
        return <CheckCircle className="h-3 w-3 mr-1" />;
      case "info":
      default:
        return <Info className="h-3 w-3 mr-1" />;
    }
  };

  return (
    <Badge
      variant="outline"
      className={`font-medium ${getStyles()} ${className}`}
    >
      {getIcon()}
      {message}
    </Badge>
  );
}
