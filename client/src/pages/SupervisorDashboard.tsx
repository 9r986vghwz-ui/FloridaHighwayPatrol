import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PendingProfiles } from "@/components/PendingProfiles";
import { PendingReports } from "@/components/PendingReports";
import { IssueStrikeForm } from "@/components/IssueStrikeForm";
import { Users, FileText, AlertTriangle, CheckCircle } from "lucide-react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import type { User } from "@shared/schema";

export default function SupervisorDashboard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    const userData = localStorage.getItem("user");

    if (!token || !userData) {
      toast({
        title: "Unauthorized",
        description: "Please login to access the dashboard",
        variant: "destructive",
      });
      setLocation("/login");
      return;
    }

    const parsedUser = JSON.parse(userData) as User;
    
    if (parsedUser.role !== "supervisor") {
      toast({
        title: "Access Denied",
        description: "This area is restricted to supervisors only",
        variant: "destructive",
      });
      setLocation("/dashboard");
      return;
    }

    setUser(parsedUser);
  }, [setLocation, toast]);

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/supervisor/stats"],
    enabled: !!user,
  });

  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user");
    toast({
      title: "Logged out",
      description: "You have been successfully logged out",
    });
    setLocation("/login");
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar user={user} onLogout={handleLogout} />
      
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Supervisor Dashboard
          </h1>
          <p className="text-muted-foreground">
            Manage trooper applications, review reports, and oversee department operations
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Troopers</CardTitle>
              <Users className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold" data-testid="text-active-troopers">
                {statsLoading ? "..." : stats?.activeTroopers || 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Approved personnel
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-yellow-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Profiles</CardTitle>
              <Users className="w-4 h-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-600" data-testid="text-pending-profiles">
                {statsLoading ? "..." : stats?.pendingProfiles || 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Awaiting approval
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Reports</CardTitle>
              <FileText className="w-4 h-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600" data-testid="text-pending-reports">
                {statsLoading ? "..." : stats?.pendingReports || 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Needs review
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-destructive">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Strikes</CardTitle>
              <AlertTriangle className="w-4 h-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-destructive" data-testid="text-total-strikes">
                {statsLoading ? "..." : stats?.totalStrikes || 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                All time issued
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs Section */}
        <Tabs defaultValue="profiles" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-grid">
            <TabsTrigger value="profiles" className="gap-2" data-testid="tab-profiles">
              <Users className="w-4 h-4" />
              <span>Pending Profiles</span>
            </TabsTrigger>
            <TabsTrigger value="reports" className="gap-2" data-testid="tab-reports">
              <FileText className="w-4 h-4" />
              <span>Reports</span>
            </TabsTrigger>
            <TabsTrigger value="strikes" className="gap-2" data-testid="tab-strikes">
              <AlertTriangle className="w-4 h-4" />
              <span>Issue Strike</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profiles" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Pending Trooper Applications</CardTitle>
                <CardDescription>
                  Review and approve or deny new trooper registrations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PendingProfiles />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Incident Reports</CardTitle>
                <CardDescription>
                  Review and approve or reject trooper incident reports
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PendingReports />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="strikes" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Issue Disciplinary Strike</CardTitle>
                <CardDescription>
                  Issue a strike to a trooper for policy violations or misconduct
                </CardDescription>
              </CardHeader>
              <CardContent>
                <IssueStrikeForm />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
