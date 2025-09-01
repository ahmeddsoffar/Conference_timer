"use client";

import { useAuth } from "@/hooks/use-auth";

export function WelcomeMessage() {
  const { user } = useAuth();

  const getTimeOfDay = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const getFirstName = (fullName: string) => {
    return fullName.split(" ")[0];
  };

  return (
    <div className="flex items-center justify-between space-y-2">
      <div className="space-y-1">
        <h2 className="text-3xl font-bold tracking-tight">Welcome Back!</h2>
        {user && (
          <p className="text-lg text-muted-foreground">
            {getTimeOfDay()},{" "}
            <span className="font-medium text-foreground">
              {getFirstName(user.name)}
            </span>
          </p>
        )}
      </div>
    </div>
  );
}
