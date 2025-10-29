import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, FileText, AlertTriangle, BarChart3, Users, CheckCircle } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative h-96 bg-gradient-to-br from-primary via-primary/90 to-primary/70 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjA1IiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30"></div>
        
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <div className="flex justify-center mb-6">
            <Shield className="w-20 h-20 text-primary-foreground" />
          </div>
          <h1 className="text-5xl font-bold text-primary-foreground mb-4">
            Florida Highway Patrol
          </h1>
          <p className="text-xl text-primary-foreground/90 max-w-2xl mx-auto mb-8">
            Professional troop management system for managing personnel, incident reports, and departmental operations
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/login" data-testid="link-login">
              <Button size="lg" variant="default" className="bg-background text-foreground hover:bg-background/90 border border-background" data-testid="button-get-started">
                Get Started
              </Button>
            </Link>
            <Link href="/register" data-testid="link-register">
              <Button size="lg" variant="outline" className="border-primary-foreground/30 text-primary-foreground bg-primary/20 backdrop-blur-sm hover:bg-primary/30" data-testid="button-register">
                Register as Trooper
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Comprehensive Management System
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Built for efficiency, designed for law enforcement professionals
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="hover-elevate" data-testid="card-feature-1">
            <CardContent className="p-6">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Trooper Management</h3>
              <p className="text-sm text-muted-foreground">
                Register and manage trooper profiles with badge numbers, ranks, and approval workflows
              </p>
            </CardContent>
          </Card>

          <Card className="hover-elevate" data-testid="card-feature-2">
            <CardContent className="p-6">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <FileText className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Incident Reports</h3>
              <p className="text-sm text-muted-foreground">
                Submit, review, and approve incident reports with detailed tracking and supervisor oversight
              </p>
            </CardContent>
          </Card>

          <Card className="hover-elevate" data-testid="card-feature-3">
            <CardContent className="p-6">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <AlertTriangle className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Strike Management</h3>
              <p className="text-sm text-muted-foreground">
                Issue and track disciplinary actions with detailed records and supervisor accountability
              </p>
            </CardContent>
          </Card>

          <Card className="hover-elevate" data-testid="card-feature-4">
            <CardContent className="p-6">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <CheckCircle className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Approval Workflows</h3>
              <p className="text-sm text-muted-foreground">
                Streamlined approval processes for new trooper applications and incident reports
              </p>
            </CardContent>
          </Card>

          <Card className="hover-elevate" data-testid="card-feature-5">
            <CardContent className="p-6">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <BarChart3 className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Analytics Dashboard</h3>
              <p className="text-sm text-muted-foreground">
                Real-time statistics and insights into department operations and performance metrics
              </p>
            </CardContent>
          </Card>

          <Card className="hover-elevate" data-testid="card-feature-6">
            <CardContent className="p-6">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Role-Based Access</h3>
              <p className="text-sm text-muted-foreground">
                Secure access control with distinct permissions for troopers and supervisors
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-border py-8">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 text-center">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Florida Highway Patrol - Troop Management System. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
