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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Plus,
  Edit,
  Search,
  Filter,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiClient } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/api";
import type { EventDtoResponse } from "@/lib/types";

export default function AdminEventsPage() {
  const router = useRouter();
  const [events, setEvents] = useState<EventDtoResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  // Deletion UI removed per request

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await apiClient.get(API_ENDPOINTS.SHOW_EVENTS);
      setEvents(response.data);
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || "Failed to fetch events";
      setError(errorMessage);
      console.error("Error fetching events:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Delete handlers removed

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const filteredEvents = events.filter((event) =>
    event.eventName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Manage Events</h2>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={`loading-${i}`}>
              <CardContent className="p-6">
                <div className="space-y-3">
                  <div className="h-6 bg-muted animate-pulse rounded w-1/3"></div>
                  <div className="h-4 bg-muted animate-pulse rounded w-1/2"></div>
                  <div className="h-4 bg-muted animate-pulse rounded w-1/4"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Manage Events</h2>
          <p className="text-muted-foreground">
            Create, edit, and manage all conference events
          </p>
        </div>
        <Button asChild>
          <a href="/admin/events/create">
            <Plus className="mr-2 h-4 w-4" />
            Create Event
          </a>
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" size="sm">
              <Filter className="mr-2 h-4 w-4" />
              Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Events Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Events ({filteredEvents.length})</CardTitle>
          <CardDescription>
            Manage your conference events and their details
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredEvents.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-semibold">No events found</p>
              <p className="text-sm">
                {searchTerm
                  ? "Try adjusting your search terms"
                  : "Create your first event to get started"}
              </p>
              {!searchTerm && (
                <Button asChild className="mt-4">
                  <a href="/admin/events/create">Create Event</a>
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Event Name</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEvents.map((event) => {
                  const status = getEventStatus(event);
                  return (
                    <TableRow
                      key={event.id}
                      className="hover:bg-muted/50 hover:shadow-xl hover:-translate-y-2 hover:scale-[1.01] hover:border-primary/20 transition-all duration-300 ease-out cursor-pointer group transform"
                      onClick={() =>
                        router.push(`/admin/events/${event.id}/attendees`)
                      }
                    >
                      <TableCell>
                        <div>
                          <div className="font-medium">{event.eventName}</div>
                          <div className="text-sm text-muted-foreground">
                            Conference Center
                          </div>
                        </div>
                        <div className="opacity-0 group-hover:opacity-100 group-hover:translate-y-0 translate-y-1 transition-all duration-300 ease-out flex items-center space-x-1 text-xs text-primary">
                          <Users className="h-3 w-3 animate-pulse" />
                          <span>View Attendees</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center text-sm">
                            <Calendar className="mr-2 h-3 w-3" />
                            {formatDate(event.eventStartTime)}
                          </div>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Clock className="mr-2 h-3 w-3" />
                            {formatDate(event.eventEndTime)}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={status.variant}>{status.label}</Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/admin/events/${event.id}/edit`);
                          }}
                          className="hover:shadow-lg hover:-translate-y-1 hover:scale-[1.02] transition-all duration-300 ease-out transform"
                          title="Edit Event"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Delete dialog removed per request */}
    </div>
  );
}
