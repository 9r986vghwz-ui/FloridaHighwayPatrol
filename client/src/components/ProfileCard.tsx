import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { UserCircle, Shield, Award } from "lucide-react";
import type { User } from "@shared/schema";

interface ProfileCardProps {
  user: User;
}

export function ProfileCard({ user }: ProfileCardProps) {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserCircle className="w-5 h-5" />
          Profile
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col items-center text-center">
          <Avatar className="w-24 h-24 mb-4 border-4 border-background shadow-lg">
            <AvatarImage src={user.profileImageUrl || undefined} className="object-cover" />
            <AvatarFallback className="text-2xl font-bold">
              {getInitials(user.name)}
            </AvatarFallback>
          </Avatar>
          
          <h3 className="font-semibold text-lg text-foreground" data-testid="text-profile-name">
            {user.name}
          </h3>
          
          <Badge variant="secondary" className="mt-2" data-testid="badge-profile-role">
            {user.role === "supervisor" ? "Supervisor" : "Trooper"}
          </Badge>
        </div>

        <div className="space-y-3 pt-4 border-t border-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Shield className="w-4 h-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground">Badge Number</p>
              <p className="font-mono font-medium text-sm truncate" data-testid="text-profile-badge">
                {user.badgeNumber}
              </p>
            </div>
          </div>

          {user.rank && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Award className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground">Rank</p>
                <p className="font-medium text-sm truncate" data-testid="text-profile-rank">
                  {user.rank}
                </p>
              </div>
            </div>
          )}

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <UserCircle className="w-4 h-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground">Email</p>
              <p className="text-sm truncate" data-testid="text-profile-email">
                {user.email}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
