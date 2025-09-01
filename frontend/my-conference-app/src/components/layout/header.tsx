"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Timer } from "lucide-react";
import { UserNav } from "./user-nav";
import { MainNav } from "./main-nav";
import { useAuth } from "@/hooks/use-auth";

function HeaderSkeleton() {
  return (
    <div className="flex items-center space-x-2">
      <div className="h-8 w-8 rounded-full bg-muted animate-pulse"></div>
    </div>
  );
}

export function Header() {
  const [mounted, setMounted] = useState(false);
  const { isAuthenticated, isLoading, user, role } = useAuth();

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center justify-between px-4">
        {/* Left side - Logo + Nav links */}
        <div className="flex items-center space-x-6">
          <Link href="/" className="flex items-center space-x-2">
            <Timer className="h-6 w-6 text-primary" />
            <span className="font-bold">Conference Timer</span>
          </Link>

          {mounted && isAuthenticated && <MainNav role={role} />}
        </div>

        {/* Right side - User Navigation */}
        <div className="flex items-center">
          {!mounted || isLoading ? (
            <HeaderSkeleton />
          ) : (
            isAuthenticated && user && <UserNav />
          )}
        </div>
      </div>
    </header>
  );
}
