import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { UserCircle, Shield, Mail, CheckCircle, XCircle } from "lucide-react";
import type { User } from "@shared/schema";

export function PendingProfiles() {
  const { toast } = useToast();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [actionType, setActionType] = useState<"approve" | "deny" | null>(null);
  const [denialReason, setDenialReason] = useState("");

  const { data: pendingUsers, isLoading } = useQuery<User[]>({
    queryKey: ["/api/supervisor/pending-profiles"],
  });

  const approveMutation = useMutation({
    mutationFn: async (userId: string) => {
      return await apiRequest("POST", `/api/supervisor/approve-profile/${userId}`, {});
    },
    onSuccess: () => {
      toast({
        title: "Profile approved",
        description: "Trooper application has been approved",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/supervisor/pending-profiles"] });
      queryClient.invalidateQueries({ queryKey: ["/api/supervisor/stats"] });
      setSelectedUser(null);
      setActionType(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Action failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const denyMutation = useMutation({
    mutationFn: async ({ userId, reason }: { userId: string; reason: string }) => {
      return await apiRequest("POST", `/api/supervisor/deny-profile/${userId}`, { reason });
    },
    onSuccess: () => {
      toast({
        title: "Profile denied",
        description: "Trooper application has been denied",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/supervisor/pending-profiles"] });
      queryClient.invalidateQueries({ queryKey: ["/api/supervisor/stats"] });
      setSelectedUser(null);
      setActionType(null);
      setDenialReason("");
    },
    onError: (error: Error) => {
      toast({
        title: "Action failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleApprove = (user: User) => {
    setSelectedUser(user);
    setActionType("approve");
  };

  const handleDeny = (user: User) => {
    setSelectedUser(user);
    setActionType("deny");
  };

  const confirmAction = () => {
    if (!selectedUser) return;

    if (actionType === "approve") {
      approveMutation.mutate(selectedUser.id);
    } else if (actionType === "deny") {
      if (!denialReason.trim()) {
        toast({
          title: "Reason required",
          description: "Please provide a reason for denial",
          variant: "destructive",
        });
        return;
      }
      denyMutation.mutate({ userId: selectedUser.id, reason: denialReason });
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 rounded-lg bg-muted animate-pulse" />
        ))}
      </div>
    );
  }

  if (!pendingUsers || pendingUsers.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-500" />
        </div>
        <p className="text-muted-foreground font-medium mb-2">All caught up!</p>
        <p className="text-sm text-muted-foreground">
          No pending trooper applications at this time
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4" data-testid="pending-profiles-list">
        {pendingUsers.map((user) => (
          <Card key={user.id} className="p-6 hover-elevate" data-testid={`card-pending-user-${user.id}`}>
            <div className="flex items-start gap-4">
              <Avatar className="w-16 h-16 border-2 border-background shadow-md">
                <AvatarImage src={user.profileImageUrl || undefined} className="object-cover" />
                <AvatarFallback className="text-lg font-semibold">
                  {getInitials(user.name)}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground truncate" data-testid="text-user-name">
                      {user.name}
                    </h3>
                    <Badge variant="secondary" className="mt-1">
                      {user.role === "supervisor" ? "Supervisor" : "Trooper"}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Shield className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <span className="font-mono text-muted-foreground truncate" data-testid="text-user-badge">
                      {user.badgeNumber}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-muted-foreground truncate" data-testid="text-user-email">
                      {user.email}
                    </span>
                  </div>
                  {user.rank && (
                    <div className="flex items-center gap-2 text-sm">
                      <UserCircle className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      <span className="text-muted-foreground truncate">
                        {user.rank}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleApprove(user)}
                    className="flex-1 gap-2"
                    data-testid="button-approve"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDeny(user)}
                    className="flex-1 gap-2"
                    data-testid="button-deny"
                  >
                    <XCircle className="w-4 h-4" />
                    Deny
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={!!selectedUser && !!actionType} onOpenChange={(open) => {
        if (!open) {
          setSelectedUser(null);
          setActionType(null);
          setDenialReason("");
        }
      }}>
        <DialogContent data-testid="dialog-confirm-action">
          <DialogHeader>
            <DialogTitle>
              {actionType === "approve" ? "Approve Application" : "Deny Application"}
            </DialogTitle>
            <DialogDescription>
              {actionType === "approve"
                ? `Are you sure you want to approve ${selectedUser?.name}'s trooper application?`
                : `Are you sure you want to deny ${selectedUser?.name}'s trooper application?`}
            </DialogDescription>
          </DialogHeader>

          {actionType === "deny" && (
            <div className="space-y-2">
              <Label htmlFor="denialReason">Reason for Denial</Label>
              <Textarea
                id="denialReason"
                placeholder="Provide a reason for the denial..."
                value={denialReason}
                onChange={(e) => setDenialReason(e.target.value)}
                className="min-h-24"
                data-testid="input-denial-reason"
              />
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setSelectedUser(null);
                setActionType(null);
                setDenialReason("");
              }}
              data-testid="button-cancel-action"
            >
              Cancel
            </Button>
            <Button
              variant={actionType === "approve" ? "default" : "destructive"}
              onClick={confirmAction}
              disabled={approveMutation.isPending || denyMutation.isPending}
              data-testid="button-confirm-action"
            >
              {approveMutation.isPending || denyMutation.isPending
                ? "Processing..."
                : actionType === "approve"
                ? "Confirm Approval"
                : "Confirm Denial"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
