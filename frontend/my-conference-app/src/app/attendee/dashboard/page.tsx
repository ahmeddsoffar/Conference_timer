"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Calendar, QrCode, Users, Clock } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { WelcomeMessage } from "@/components/dashboard/welcome-message";
import { apiClient } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/api";
import { AttendeeDashboardStatsResponse } from "@/lib/types";

export default function AttendeeDashboard() {
  const [stats, setStats] = useState<AttendeeDashboardStatsResponse>({
    upcomingEvents: 0,
    totalAttendanceHours: 0,
    qrScans: 0,
    eventsAttended: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.get(
        API_ENDPOINTS.ATTENDEE_DASHBOARD_STATS
      );
      setStats(response.data);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      // Keep default values on error
    } finally {
      setIsLoading(false);
    }
  };

  const formatHours = (hours: number) => {
    if (hours < 1) {
      return `${Math.round(hours * 60)}m`;
    }
    return `${hours.toFixed(1)}h`;
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const activityTime = new Date(timestamp);
    const diffInMs = now.getTime() - activityTime.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMinutes < 1) {
      return "Just now";
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes} minute${diffInMinutes !== 1 ? "s" : ""} ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours !== 1 ? "s" : ""} ago`;
    } else {
      return `${diffInDays} day${diffInDays !== 1 ? "s" : ""} ago`;
    }
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <WelcomeMessage />

      {/* Quick Actions - Mobile First (appears at top on mobile) */}
      <div className="order-1 md:order-3">
        <Card className="md:hidden">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Manage your conference experience</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start" asChild>
              <Link href="/attendee/events">
                <Calendar className="mr-2 h-4 w-4" />
                Browse Events
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href="/attendee/registrations">
                <QrCode className="mr-2 h-4 w-4" />
                View My QR Codes
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href="/attendee/registrations">
                <Users className="mr-2 h-4 w-4" />
                My Registrations
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 order-2 md:order-1">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Upcoming Events
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? "..." : stats.upcomingEvents}
            </div>
            <p className="text-xs text-muted-foreground">
              Events you&apos;re registered for
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Attendance
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? "..." : formatHours(stats.totalAttendanceHours)}
            </div>
            <p className="text-xs text-muted-foreground">
              Hours attended this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">QR Scans</CardTitle>
            <QrCode className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? "..." : stats.qrScans}
            </div>
            <p className="text-xs text-muted-foreground">Check-ins completed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Events Attended
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? "..." : stats.eventsAttended}
            </div>
            <p className="text-xs text-muted-foreground">
              Conferences completed
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 order-3 md:order-2">
        <Card className="col-span-4">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>
                  Your latest conference attendance activity
                </CardDescription>
              </div>
              {stats.recentActivity && stats.recentActivity.length > 5 && (
                <div className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                  Scroll to see more
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              // Loading skeleton
              <div className="max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex items-center space-x-4 mb-4 last:mb-0"
                  >
                    <div className="w-2 h-2 bg-muted rounded-full animate-pulse"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-muted rounded animate-pulse mb-1"></div>
                      <div className="h-3 bg-muted rounded animate-pulse w-20"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : stats.recentActivity && stats.recentActivity.length > 0 ? (
              // Real activity data with scrollable container
              <div className="relative">
                <div className="max-h-64 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400">
                  {stats.recentActivity.map((activity, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-4 mb-4 last:mb-0"
                    >
                      <div
                        className={`w-2 h-2 rounded-full flex-shrink-0 ${
                          activity.status === "Active"
                            ? "bg-green-500"
                            : activity.status === "Completed"
                            ? "bg-blue-500"
                            : activity.status === "Paused"
                            ? "bg-orange-500"
                            : "bg-gray-500"
                        }`}
                      ></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {activity.activityType} {activity.eventName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatTimeAgo(activity.timestamp)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                {/* Fade effect at bottom to indicate scrollable content */}
                {stats.recentActivity.length > 5 && (
                  <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white to-transparent dark:from-gray-900 pointer-events-none"></div>
                )}
              </div>
            ) : (
              // No activity message
              <div className="text-center py-4">
                <p className="text-sm text-muted-foreground">
                  No recent activity
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions - Desktop Only (hidden on mobile) */}
        <Card className="col-span-3 hidden md:block">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Manage your conference experience</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start" asChild>
              <Link href="/attendee/events">
                <Calendar className="mr-2 h-4 w-4" />
                Browse Events
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href="/attendee/registrations">
                <QrCode className="mr-2 h-4 w-4" />
                View My QR Codes
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href="/attendee/registrations">
                <Users className="mr-2 h-4 w-4" />
                My Registrations
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
