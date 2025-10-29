import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { format } from "date-fns";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { FileText, Calendar, MapPin, User, CheckCircle, XCircle } from "lucide-react";
import type { ReportWithUser } from "@shared/schema";

export function PendingReports() {
  const { toast } = useToast();
  const [selectedReport, setSelectedReport] = useState<ReportWithUser | null>(null);
  const [actionType, setActionType] = useState<"approve" | "reject" | null>(null);
  const [reviewNotes, setReviewNotes] = useState("");

  const { data: reports, isLoading } = useQuery<ReportWithUser[]>({
    queryKey: ["/api/supervisor/pending-reports"],
  });

  const reviewMutation = useMutation({
    mutationFn: async ({ reportId, status, notes }: { reportId: string; status: string; notes: string }) => {
      return await apiRequest("POST", `/api/supervisor/review-report/${reportId}`, { status, notes });
    },
    onSuccess: (_, variables) => {
      toast({
        title: variables.status === "approved" ? "Report approved" : "Report rejected",
        description: `The incident report has been ${variables.status}`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/supervisor/pending-reports"] });
      queryClient.invalidateQueries({ queryKey: ["/api/supervisor/stats"] });
      setSelectedReport(null);
      setActionType(null);
      setReviewNotes("");
    },
    onError: (error: Error) => {
      toast({
        title: "Action failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleApprove = (report: ReportWithUser) => {
    setSelectedReport(report);
    setActionType("approve");
  };

  const handleReject = (report: ReportWithUser) => {
    setSelectedReport(report);
    setActionType("reject");
  };

  const confirmAction = () => {
    if (!selectedReport || !actionType) return;

    reviewMutation.mutate({
      reportId: selectedReport.id,
      status: actionType === "approve" ? "approved" : "rejected",
      notes: reviewNotes,
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-40 rounded-lg bg-muted animate-pulse" />
        ))}
      </div>
    );
  }

  if (!reports || reports.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-500" />
        </div>
        <p className="text-muted-foreground font-medium mb-2">All caught up!</p>
        <p className="text-sm text-muted-foreground">
          No pending incident reports at this time
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4" data-testid="pending-reports-list">
        {reports.map((report) => (
          <Card key={report.id} className="p-6 hover-elevate border-l-4 border-l-blue-500" data-testid={`card-report-${report.id}`}>
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-lg text-foreground" data-testid="text-report-title">
                      {report.title}
                    </h3>
                    <Badge variant="secondary" className="text-xs">
                      Pending
                    </Badge>
                  </div>
                  
                  <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground mb-3">
                    {report.user && (
                      <div className="flex items-center gap-1.5">
                        <User className="w-4 h-4" />
                        <span>{report.user.name}</span>
                        <span className="font-mono text-xs">({report.user.badgeNumber})</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4" />
                      <span>{format(new Date(report.incidentDate), "MMM dd, yyyy")}</span>
                    </div>
                    {report.location && (
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-4 h-4" />
                        <span>{report.location}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-muted/50 rounded-lg p-4">
                <p className="text-sm text-foreground whitespace-pre-wrap" data-testid="text-report-description">
                  {report.description}
                </p>
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <Button
                  size="sm"
                  onClick={() => handleApprove(report)}
                  className="gap-2"
                  data-testid="button-approve-report"
                >
                  <CheckCircle className="w-4 h-4" />
                  Approve
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleReject(report)}
                  className="gap-2"
                  data-testid="button-reject-report"
                >
                  <XCircle className="w-4 h-4" />
                  Reject
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Review Dialog */}
      <Dialog open={!!selectedReport && !!actionType} onOpenChange={(open) => {
        if (!open) {
          setSelectedReport(null);
          setActionType(null);
          setReviewNotes("");
        }
      }}>
        <DialogContent data-testid="dialog-review-report">
          <DialogHeader>
            <DialogTitle>
              {actionType === "approve" ? "Approve Report" : "Reject Report"}
            </DialogTitle>
            <DialogDescription>
              {actionType === "approve"
                ? "Approve this incident report and optionally add notes"
                : "Reject this incident report and provide feedback"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <Label htmlFor="reviewNotes">Review Notes {actionType === "reject" && "(Required)"}</Label>
            <Textarea
              id="reviewNotes"
              placeholder={actionType === "approve" 
                ? "Add any comments or notes (optional)..." 
                : "Provide feedback on why this report is being rejected..."}
              value={reviewNotes}
              onChange={(e) => setReviewNotes(e.target.value)}
              className="min-h-24"
              data-testid="input-review-notes"
            />
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setSelectedReport(null);
                setActionType(null);
                setReviewNotes("");
              }}
              data-testid="button-cancel-review"
            >
              Cancel
            </Button>
            <Button
              variant={actionType === "approve" ? "default" : "destructive"}
              onClick={confirmAction}
              disabled={reviewMutation.isPending || (actionType === "reject" && !reviewNotes.trim())}
              data-testid="button-confirm-review"
            >
              {reviewMutation.isPending
                ? "Processing..."
                : actionType === "approve"
                ? "Confirm Approval"
                : "Confirm Rejection"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
