import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { FileText, Calendar, MapPin, Clock } from "lucide-react";
import type { Report } from "@shared/schema";

interface ReportsListProps {
  reports: Report[];
  isLoading: boolean;
}

export function ReportsList({ reports, isLoading }: ReportsListProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-24 rounded-lg bg-muted animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (!reports || reports.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
        <p className="text-muted-foreground font-medium mb-2">No reports yet</p>
        <p className="text-sm text-muted-foreground">
          Submit your first incident report using the button above
        </p>
      </div>
    );
  }

  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" => {
    switch (status) {
      case "approved":
        return "default";
      case "rejected":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "border-l-green-500";
      case "rejected":
        return "border-l-red-500";
      default:
        return "border-l-yellow-500";
    }
  };

  return (
    <div className="space-y-3" data-testid="reports-list">
      {reports.map((report) => (
        <Card
          key={report.id}
          className={`p-4 hover-elevate border-l-4 ${getStatusColor(report.status)}`}
          data-testid={`card-report-${report.id}`}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <h4 className="font-semibold text-foreground truncate" data-testid="text-report-title">
                  {report.title}
                </h4>
                <Badge variant={getStatusVariant(report.status)} className="text-xs" data-testid="badge-report-status">
                  {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                </Badge>
              </div>
              
              <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                {report.description}
              </p>

              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span>{format(new Date(report.incidentDate), "MMM dd, yyyy")}</span>
                </div>
                {report.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    <span>{report.location}</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>Submitted {format(new Date(report.createdAt), "MMM dd")}</span>
                </div>
              </div>

              {report.reviewNotes && (
                <div className="mt-3 pt-3 border-t border-border">
                  <p className="text-xs text-muted-foreground font-medium mb-1">Review Notes:</p>
                  <p className="text-xs text-muted-foreground">{report.reviewNotes}</p>
                </div>
              )}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
