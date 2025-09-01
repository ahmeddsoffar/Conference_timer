"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Calendar,
  Users,
  QrCode,
  BarChart3,
  Settings,
  Home,
  UserCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import type { NavItem } from "@/lib/types";

interface MainNavProps {
  role: "ADMIN" | "USER" | null;
  className?: string;
}

export function MainNav({ role, className }: MainNavProps) {
  const pathname = usePathname();

  const adminNavItems: NavItem[] = [
    {
      title: "Dashboard",
      href: "/admin/dashboard",
      icon: "Home",
    },
    {
      title: "Events",
      href: "/admin/events",
      icon: "Calendar",
    },
    {
      title: "Scanner",
      href: "/admin/scanner",
      icon: "QrCode",
    },
    {
      title: "Analytics",
      href: "/admin/analytics",
      icon: "BarChart3",
      badge: "New",
    },
  ];

  const userNavItems: NavItem[] = [
    {
      title: "Dashboard",
      href: "/attendee/dashboard",
      icon: "Home",
    },
    {
      title: "Events",
      href: "/attendee/events",
      icon: "Calendar",
    },
    {
      title: "My Registrations",
      href: "/attendee/registrations",
      icon: "UserCheck",
    },
  ];

  const navItems = role === "ADMIN" ? adminNavItems : userNavItems;

  const getIcon = (iconName: string) => {
    const icons = {
      Home,
      Calendar,
      Users,
      QrCode,
      BarChart3,
      Settings,
      UserCheck,
    };
    const IconComponent = icons[iconName as keyof typeof icons];
    return IconComponent ? <IconComponent className="h-4 w-4" /> : null;
  };

  return (
    <nav className={cn("flex items-center space-x-4 lg:space-x-6", className)}>
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "flex items-center space-x-2 text-sm font-medium transition-colors hover:text-primary",
            pathname === item.href
              ? "text-black dark:text-white"
              : "text-muted-foreground"
          )}
        >
          {item.icon && getIcon(item.icon)}
          <span>{item.title}</span>
          {item.badge && (
            <Badge variant="secondary" className="ml-1 text-xs">
              {item.badge}
            </Badge>
          )}
        </Link>
      ))}
    </nav>
  );
}
