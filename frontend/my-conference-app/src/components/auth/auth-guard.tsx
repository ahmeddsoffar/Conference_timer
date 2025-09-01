"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requiredRole?: "ADMIN" | "USER";
  fallbackPath?: string;
}

export function AuthGuard({
  children,
  requireAuth = false,
  requiredRole,
  fallbackPath = "/login",
}: AuthGuardProps) {
  const router = useRouter();
  const { isAuthenticated, role, isLoading } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || isLoading) return;

    if (requireAuth && !isAuthenticated) {
      router.replace(fallbackPath);
      return;
    }

    if (requiredRole && role !== requiredRole) {
      if (role === "ADMIN") {
        router.replace("/admin/dashboard");
      } else if (role === "USER") {
        router.replace("/attendee/dashboard");
      } else {
        router.replace(fallbackPath);
      }
      return;
    }

    if (
      isAuthenticated &&
      (window.location.pathname === "/login" ||
        window.location.pathname === "/register")
    ) {
      if (role === "ADMIN") {
        router.replace("/admin/dashboard");
      } else if (role === "USER") {
        router.replace("/attendee/dashboard");
      }
    }
  }, [
    mounted,
    isAuthenticated,
    role,
    isLoading,
    requireAuth,
    requiredRole,
    router,
    fallbackPath,
  ]);

  if (!mounted || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (requireAuth && !isAuthenticated) return null;
  if (requiredRole && role !== requiredRole) return null;

  return <>{children}</>;
}
