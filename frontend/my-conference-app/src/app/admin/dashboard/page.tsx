"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Users,
  QrCode,
  BarChart3,
  Plus,
  Clock,
  MapPin,
  Edit,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { apiClient } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/api";
import { EventDtoResponse, DashboardStatsResponse } from "@/lib/types";

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState({
    totalEvents: 0,
    totalAttendees: 0,
    totalRegistrations: 0,
    upcomingEvents: 0,
  });
  const [recentEvents, setRecentEvents] = useState<EventDtoResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Only fetch data if user is authenticated
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (token && role === "ADMIN") {
      fetchDashboardData();
    } else {
      console.log("User not authenticated or not admin, skipping data fetch");
      setIsLoading(false);
    }
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);

      // Check if user is authenticated
      const token = localStorage.getItem("token");
      const user = localStorage.getItem("user");
      const role = localStorage.getItem("role");

      console.log("Auth state:", {
        token: token ? "exists" : "missing",
        user,
        role,
      });

      if (!token) {
        throw new Error("No authentication token found");
      }

      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(
          () => reject(new Error("Request timeout after 10 seconds")),
          10000
        );
      });

      // Fetch dashboard stats and events in parallel
      const [statsPromise, eventsPromise] = [
        apiClient.get(API_ENDPOINTS.DASHBOARD_STATS),
        apiClient.get(API_ENDPOINTS.SHOW_EVENTS),
      ];

      const [statsResponse, eventsResponse] = (await Promise.all([
        Promise.race([statsPromise, timeoutPromise]),
        Promise.race([eventsPromise, timeoutPromise]),
      ])) as [any, any];

      console.log("Dashboard stats response:", statsResponse);
      console.log("Events response:", eventsResponse);

      const stats = statsResponse.data as DashboardStatsResponse;
      const events = eventsResponse.data;

      // Ensure events is an array
      if (!Array.isArray(events)) {
        console.warn("Events data is not an array:", events);
        setRecentEvents([]);
        setStats({
          totalEvents: stats.totalEvents || 0,
          totalAttendees: stats.totalAttendees || 0,
          totalRegistrations: stats.totalRegistrations || 0,
          upcomingEvents: 0,
        });
        return;
      }

      // Calculate upcoming events
      const now = new Date();
      const upcomingEvents = events.filter(
        (event: EventDtoResponse) => new Date(event.eventStartTime) > now
      );

      setStats({
        totalEvents: stats.totalEvents || 0,
        totalAttendees: stats.totalAttendees || 0,
        totalRegistrations: stats.totalRegistrations || 0,
        upcomingEvents: upcomingEvents.length,
      });

      // Set recent events (last 5)
      const recentEventsData = events.slice(0, 5);
      console.log("Recent events data:", recentEventsData);
      setRecentEvents(recentEventsData);
    } catch (error: any) {
      console.error("Error fetching dashboard data:", error);
      console.error("Error details:", {
        message: error?.message,
        status: error?.status,
        response: error?.response,
        stack: error?.stack,
      });

      // Set default values on error
      setRecentEvents([]);
      setStats({
        totalEvents: 0,
        totalAttendees: 0,
        totalRegistrations: 0,
        upcomingEvents: 0,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getEventStatus = (event: EventDtoResponse) => {
    const now = new Date();
    const startTime = new Date(event.eventStartTime);
    const endTime = new Date(event.eventEndTime);

    if (now < startTime)
      return { label: "Upcoming", variant: "secondary" as const };
    if (now >= startTime && now <= endTime)
      return { label: "Active", variant: "default" as const };
    return { label: "Completed", variant: "outline" as const };
  };

  if (isLoading) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Admin Dashboard</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={`loading-card-${i}`}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  <div className="h-4 bg-muted animate-pulse rounded w-24"></div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted animate-pulse rounded w-16"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Admin Dashboard</h2>
        <div className="flex items-center space-x-2">
          <Button asChild>
            <Link href="/admin/events/create">
              <Plus className="mr-2 h-4 w-4" />
              Create Event
            </Link>
          </Button>
        </div>
      </div>

      {/* Quick Actions - Mobile First (appears at top on mobile) */}
      <div className="order-1 md:order-3">
        <Card className="md:hidden">
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
            <CardDescription>Manage your conference system</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              asChild
              className="w-full justify-start hover:shadow-xl hover:-translate-y-1 hover:scale-[1.02] transition-all duration-300 ease-out transform"
            >
              <Link href="/admin/events/create">
                <Plus className="mr-2 h-4 w-4" />
                Create New Event
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="w-full justify-start hover:shadow-xl hover:-translate-y-1 hover:scale-[1.02] transition-all duration-300 ease-out transform"
            >
              <Link href="/admin/events">
                <Calendar className="mr-2 h-4 w-4" />
                Manage Events
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="w-full justify-start hover:shadow-xl hover:-translate-y-1 hover:scale-[1.02] transition-all duration-300 ease-out transform"
            >
              <Link href="/admin/scanner">
                <QrCode className="mr-2 h-4 w-4" />
                QR Scanner
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="w-full justify-start hover:shadow-xl hover:-translate-y-1 hover:scale-[1.02] transition-all duration-300 ease-out transform"
            >
              <Link href="/admin/analytics">
                <BarChart3 className="mr-2 h-4 w-4" />
                View Analytics
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 order-2 md:order-1">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalEvents}</div>
            <p className="text-xs text-muted-foreground">
              {stats.upcomingEvents} upcoming
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Attendees
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAttendees}</div>
            <p className="text-xs text-muted-foreground">Across all events</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Registrations</CardTitle>
            <QrCode className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRegistrations}</div>
            <p className="text-xs text-muted-foreground">Total signups</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Analytics</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Live</div>
            <p className="text-xs text-muted-foreground">Real-time data</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions - Desktop Only (hidden on mobile) */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 order-3 md:order-2">
        <Card className="hidden md:block">
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
            <CardDescription>Manage your conference system</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              asChild
              className="w-full justify-start hover:shadow-xl hover:-translate-y-1 hover:scale-[1.02] transition-all duration-300 ease-out transform"
            >
              <Link href="/admin/events/create">
                <Plus className="mr-2 h-4 w-4" />
                Create New Event
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="w-full justify-start hover:shadow-xl hover:-translate-y-1 hover:scale-[1.02] transition-all duration-300 ease-out transform"
            >
              <Link href="/admin/events">
                <Calendar className="mr-2 h-4 w-4" />
                Manage Events
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="w-full justify-start hover:shadow-xl hover:-translate-y-1 hover:scale-[1.02] transition-all duration-300 ease-out transform"
            >
              <Link href="/admin/scanner">
                <QrCode className="mr-2 h-4 w-4" />
                QR Scanner
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="w-full justify-start hover:shadow-xl hover:-translate-y-1 hover:scale-[1.02] transition-all duration-300 ease-out transform"
            >
              <Link href="/admin/analytics">
                <BarChart3 className="mr-2 h-4 w-4" />
                View Analytics
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Recent Events */}
        <Card className="md:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Recent Events</CardTitle>
                <CardDescription>Latest events in your system</CardDescription>
              </div>
              <Button
                asChild
                variant="outline"
                size="sm"
                className="hover:shadow-lg hover:-translate-y-1 hover:scale-[1.02] transition-all duration-300 ease-out transform"
              >
                <Link href="/admin/events">View All Events</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {recentEvents.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No events created yet</p>
                <Button
                  asChild
                  className="mt-2 hover:shadow-lg hover:-translate-y-1 hover:scale-[1.02] transition-all duration-300 ease-out transform"
                >
                  <Link href="/admin/events/create">
                    Create Your First Event
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {Array.isArray(recentEvents) &&
                  recentEvents.map((event, index) => {
                    const status = getEventStatus(event);
                    return (
                      <div
                        key={event.id || `event-${index}`}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 hover:shadow-xl hover:-translate-y-2 hover:scale-[1.02] hover:border-primary/20 transition-all duration-300 ease-out group transform"
                      >
                        {/* Clickable event info area */}
                        <div
                          className="flex-1 cursor-pointer"
                          onClick={() =>
                            router.push(`/admin/events/${event.id}/attendees`)
                          }
                        >
                          <div className="flex items-center space-x-2">
                            <h4 className="font-medium">{event.eventName}</h4>
                            <Badge variant={status.variant}>
                              {status.label}
                            </Badge>
                          </div>
                          <div className="opacity-0 group-hover:opacity-100 group-hover:translate-y-0 translate-y-1 transition-all duration-300 ease-out flex items-center space-x-1 text-xs text-primary mt-1">
                            <Users className="h-3 w-3 animate-pulse" />
                            <span>Click to view attendees</span>
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-1">
                            <span className="flex items-center">
                              <Clock className="mr-1 h-3 w-3" />
                              {formatDate(event.eventStartTime)}
                            </span>
                            <span className="flex items-center">
                              <Clock className="mr-1 h-3 w-3" />
                              {formatDate(event.eventEndTime)}
                            </span>
                            <span className="flex items-center">
                              <Users className="mr-1 h-3 w-3" />
                              Event Details
                            </span>
                          </div>
                        </div>

                        {/* Visual separator and edit button */}
                        <div className="flex items-center space-x-2 ml-4 border-l pl-4 relative z-10 bg-background/80 backdrop-blur-sm rounded-r-lg p-1 hover:bg-background/90 transition-colors duration-200">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              console.log(
                                "Edit button clicked for event:",
                                event.id
                              );
                              router.push(`/admin/events/${event.id}/edit`);
                            }}
                            className="hover:shadow-lg hover:-translate-y-1 hover:scale-[1.02] transition-all duration-300 ease-out transform bg-background hover:bg-background border-primary/20 hover:border-primary/40"
                            title="Edit Event"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
