import { Link, useLocation } from "wouter";
import { Shield, LogOut, LayoutDashboard, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import type { User } from "@shared/schema";

interface NavbarProps {
  user?: User;
  onLogout: () => void;
}

export function Navbar({ user, onLogout }: NavbarProps) {
  const [location] = useLocation();

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <nav className="border-b border-border bg-background sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Title */}
          <Link href={user?.role === "supervisor" ? "/supervisor" : "/dashboard"}>
            <div className="flex items-center gap-3 cursor-pointer hover-elevate px-3 py-2 rounded-lg" data-testid="link-home">
              <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                <Shield className="w-6 h-6 text-primary-foreground" />
              </div>
              <div className="hidden md:block">
                <h1 className="text-sm font-bold text-foreground leading-tight">
                  Florida Highway Patrol
                </h1>
                <p className="text-xs text-muted-foreground">Troop Management</p>
              </div>
            </div>
          </Link>

          {/* Navigation Links */}
          {user && (
            <div className="flex items-center gap-2">
              {user.role === "trooper" && (
                <Link href="/dashboard">
                  <Button
                    variant={location === "/dashboard" ? "default" : "ghost"}
                    size="sm"
                    className="gap-2"
                    data-testid="link-dashboard"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    <span className="hidden sm:inline">Dashboard</span>
                  </Button>
                </Link>
              )}
              {user.role === "supervisor" && (
                <Link href="/supervisor">
                  <Button
                    variant={location === "/supervisor" ? "default" : "ghost"}
                    size="sm"
                    className="gap-2"
                    data-testid="link-supervisor"
                  >
                    <Users className="w-4 h-4" />
                    <span className="hidden sm:inline">Supervisor</span>
                  </Button>
                </Link>
              )}

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="gap-2 h-auto py-1 px-2"
                    data-testid="button-user-menu"
                  >
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={user.profileImageUrl || undefined} className="object-cover" />
                      <AvatarFallback className="text-xs font-medium">
                        {getInitials(user.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="hidden md:flex flex-col items-start">
                      <span className="text-sm font-medium" data-testid="text-user-name">
                        {user.name}
                      </span>
                      <Badge variant="secondary" className="text-xs font-normal px-1.5 py-0" data-testid="badge-user-role">
                        {user.role === "supervisor" ? "Supervisor" : "Trooper"}
                      </Badge>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">{user.name}</p>
                      <p className="text-xs text-muted-foreground font-mono" data-testid="text-badge-number">
                        Badge: {user.badgeNumber}
                      </p>
                      {user.rank && (
                        <p className="text-xs text-muted-foreground">
                          Rank: {user.rank}
                        </p>
                      )}
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={onLogout}
                    className="text-destructive focus:text-destructive cursor-pointer"
                    data-testid="button-logout"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
