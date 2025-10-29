import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/Navbar";
import { ReportForm } from "@/components/ReportForm";
import { ReportsList } from "@/components/ReportsList";
import { StrikesList } from "@/components/StrikesList";
import { ProfileCard } from "@/components/ProfileCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, AlertTriangle, Plus, UserCircle } from "lucide-react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import type { User } from "@shared/schema";

export default function TrooperDashboard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [showReportForm, setShowReportForm] = useState(false);

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
    
    if (parsedUser.status === "pending") {
      toast({
        title: "Pending Approval",
        description: "Your application is pending supervisor approval",
        variant: "default",
      });
    } else if (parsedUser.status === "denied") {
      toast({
        title: "Application Denied",
        description: parsedUser.denialReason || "Your application was denied",
        variant: "destructive",
      });
      setLocation("/login");
      return;
    }

    setUser(parsedUser);
  }, [setLocation, toast]);

  const { data: reports, isLoading: reportsLoading } = useQuery({
    queryKey: ["/api/reports/my-reports"],
    enabled: !!user && user.status === "approved",
  });

  const { data: strikes, isLoading: strikesLoading } = useQuery({
    queryKey: ["/api/strikes/my-strikes"],
    enabled: !!user && user.status === "approved",
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

  if (user.status === "pending") {
    return (
      <div className="min-h-screen bg-background">
        <Navbar user={user} onLogout={handleLogout} />
        <div className="max-w-3xl mx-auto px-4 py-16 text-center">
          <div className="w-20 h-20 rounded-full bg-yellow-100 dark:bg-yellow-900/20 flex items-center justify-center mx-auto mb-6">
            <UserCircle className="w-12 h-12 text-yellow-600 dark:text-yellow-500" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-4">Application Pending</h1>
          <p className="text-lg text-muted-foreground mb-8">
            Your trooper application is awaiting supervisor approval. You'll be notified once your application has been reviewed.
          </p>
          <Button onClick={handleLogout} variant="outline" data-testid="button-logout">
            Logout
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar user={user} onLogout={handleLogout} />
      
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Welcome, {user.name}
          </h1>
          <p className="text-muted-foreground">
            Badge Number: <span className="font-mono font-medium" data-testid="text-badge-number">{user.badgeNumber}</span>
            {user.rank && <> • Rank: {user.rank}</>}
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
              <FileText className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold" data-testid="text-total-reports">
                {reportsLoading ? "..." : reports?.length || 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                All time submissions
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-destructive">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Strikes</CardTitle>
              <AlertTriangle className="w-4 h-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-destructive" data-testid="text-total-strikes">
                {strikesLoading ? "..." : strikes?.length || 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Disciplinary actions
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Reports Section */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Incident Reports</CardTitle>
                    <CardDescription>Submit and view your incident reports</CardDescription>
                  </div>
                  <Button
                    onClick={() => setShowReportForm(!showReportForm)}
                    size="sm"
                    className="gap-2"
                    data-testid="button-new-report"
                  >
                    <Plus className="w-4 h-4" />
                    New Report
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {showReportForm ? (
                  <ReportForm onClose={() => setShowReportForm(false)} />
                ) : (
                  <ReportsList reports={reports || []} isLoading={reportsLoading} />
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Profile Card */}
            <ProfileCard user={user} />

            {/* Strikes Card */}
            <Card className="border-l-4 border-l-destructive">
              <CardHeader>
                <CardTitle className="text-destructive">Strikes</CardTitle>
                <CardDescription>Disciplinary actions</CardDescription>
              </CardHeader>
              <CardContent>
                <StrikesList strikes={strikes || []} isLoading={strikesLoading} />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
