"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Calendar,
  Clock,
  Users,
  ArrowLeft,
  Play,
  Pause,
  LogOut,
  RefreshCw,
  Download,
  CheckCircle,
  AlertCircle,
  PauseCircle,
  UserCheck,
} from "lucide-react";
import { apiClient } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/api";
import type { EventAttendeeResponse, EventDtoResponse } from "@/lib/types";

export default function EventAttendeesPage() {
  const router = useRouter();
  const params = useParams();
  const eventId = params.id as string;

  const [attendees, setAttendees] = useState<EventAttendeeResponse[]>([]);
  const [event, setEvent] = useState<EventDtoResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bulkCheckoutDialogOpen, setBulkCheckoutDialogOpen] = useState(false);
  const [isBulkCheckingOut, setIsBulkCheckingOut] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [performingAction, setPerformingAction] = useState<string | null>(null);

  useEffect(() => {
    if (eventId) {
      fetchEventDetails();
      fetchAttendees();
    }
  }, [eventId]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (autoRefresh) {
      interval = setInterval(() => {
        fetchAttendees();
      }, 10000); // Refresh every 10 seconds
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh, eventId]);

  const fetchEventDetails = async () => {
    try {
      const response = await apiClient.get(
        API_ENDPOINTS.GET_EVENT(parseInt(eventId))
      );
      setEvent(response.data);
    } catch (err: any) {
      console.error("Error fetching event details:", err);
    }
  };

  const fetchAttendees = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await apiClient.get(
        API_ENDPOINTS.GET_EVENT_ATTENDEES(parseInt(eventId))
      );
      setAttendees(response.data);
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || "Failed to fetch attendees";
      setError(errorMessage);
      console.error("Error fetching attendees:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBulkCheckout = async () => {
    try {
      setIsBulkCheckingOut(true);
      await apiClient.post(API_ENDPOINTS.CHECKOUT_ALL(parseInt(eventId)));

      // Refresh attendees list
      await fetchAttendees();
      setBulkCheckoutDialogOpen(false);
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || "Failed to checkout all attendees";
      setError(errorMessage);
      console.error("Error bulk checkout:", err);
    } finally {
      setIsBulkCheckingOut(false);
    }
  };

  const handleIndividualAction = async (
    attendee: EventAttendeeResponse,
    action: string
  ) => {
    try {
      setPerformingAction(`${attendee.registrationId}-${action}`);
      const idempotencyKey = `${action.toLowerCase()}-${
        attendee.registrationCode
      }-${Date.now()}`;

      await apiClient.post(API_ENDPOINTS.SCAN, {
        code: attendee.registrationCode,
        action: action,
        idempotencyKey: idempotencyKey,
      });

      // Refresh attendees list
      await fetchAttendees();
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message ||
        `Failed to ${action.toLowerCase()} attendee`;
      setError(errorMessage);
      console.error(`Error ${action.toLowerCase()}:`, err);
    } finally {
      setPerformingAction(null);
    }
  };

  const handleExportCSV = async () => {
    try {
      // Use the backend export endpoint
      const response = await apiClient.get(
        API_ENDPOINTS.EXPORT_ATTENDEES(parseInt(eventId)),
        {
          responseType: "blob", // Important: handle binary data
        }
      );

      // Create blob and download
      const blob = new Blob([response.data], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `attendees_${event?.eventName || "event"}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || "Failed to export attendees";
      setError(errorMessage);
      console.error("Error exporting attendees:", err);
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "default";
      case "PAUSED":
        return "secondary";
      case "CHECKED_OUT":
        return "outline";
      case "REGISTERED":
        return "secondary";
      default:
        return "secondary";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return <Play className="h-4 w-4 text-green-600" />;
      case "PAUSED":
        return <Pause className="h-4 w-4 text-yellow-600" />;
      case "CHECKED_OUT":
        return <LogOut className="h-4 w-4 text-gray-600" />;
      case "REGISTERED":
        return <UserCheck className="h-4 w-4 text-blue-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getAvailableActions = (attendee: EventAttendeeResponse) => {
    const actions = [];

    switch (attendee.currentStatus) {
      case "REGISTERED":
        actions.push({
          label: "Check In",
          action: "CHECKIN",
          icon: <Play className="h-4 w-4" />,
        });
        break;
      case "ACTIVE":
        actions.push(
          {
            label: "Pause",
            action: "PAUSE",
            icon: <Pause className="h-4 w-4" />,
          },
          {
            label: "Check Out",
            action: "CHECKOUT",
            icon: <LogOut className="h-4 w-4" />,
          }
        );
        break;
      case "PAUSED":
        actions.push(
          {
            label: "Resume",
            action: "RESUME",
            icon: <Play className="h-4 w-4" />,
          },
          {
            label: "Check Out",
            action: "CHECKOUT",
            icon: <LogOut className="h-4 w-4" />,
          }
        );
        break;
      case "CHECKED_OUT":
        actions.push({
          label: "Check In",
          action: "CHECKIN",
          icon: <Play className="h-4 w-4" />,
        });
        break;
    }

    return actions;
  };

  if (isLoading && attendees.length === 0) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">
            Loading Attendees...
          </h2>
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
      <div className="flex items-center justify-between space-y-2">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/admin/events")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Events
          </Button>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">
              {event ? event.eventName : "Event"} - Attendees
            </h2>
            <p className="text-muted-foreground">
              Manage attendee attendance and status
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchAttendees}
            disabled={isLoading}
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={autoRefresh ? "bg-green-50 border-green-200" : ""}
          >
            <Clock className="mr-2 h-4 w-4" />
            {autoRefresh ? "Auto-refresh ON" : "Auto-refresh OFF"}
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Event Info Card */}
      {event && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span>Event Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Start Time</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(event.eventStartTime)}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">End Time</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(event.eventEndTime)}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Total Attendees</p>
                  <p className="text-sm text-muted-foreground">
                    {attendees.length}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Quick Actions</span>
          </CardTitle>
          <CardDescription>Manage all attendees at once</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center space-x-4">
            <Button
              onClick={() => setBulkCheckoutDialogOpen(true)}
              variant="destructive"
              disabled={attendees.length === 0}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Checkout All Attendees
            </Button>
            <Button
              variant="outline"
              onClick={handleExportCSV}
              disabled={attendees.length === 0}
            >
              <Download className="mr-2 h-4 w-4" />
              Export to CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Attendees Table */}
      <Card>
        <CardHeader>
          <CardTitle>Attendees ({attendees.length})</CardTitle>
          <CardDescription>
            Real-time attendance status and individual actions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {attendees.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-semibold">No attendees found</p>
              <p className="text-sm">
                Attendees will appear here once they register and scan their QR
                codes
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[300px]">Attendee</TableHead>
                  <TableHead className="w-[120px]">Status</TableHead>
                  <TableHead className="w-[150px]">Last Activity</TableHead>
                  <TableHead className="w-[100px]">Total Hours</TableHead>
                  <TableHead className="w-[200px]">
                    <div className="flex items-center space-x-2">
                      <span>Actions</span>
                      {performingAction && (
                        <RefreshCw className="h-3 w-3 animate-spin text-muted-foreground" />
                      )}
                    </div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {attendees.map((attendee) => {
                  const availableActions = getAvailableActions(attendee);
                  const isRowLoading =
                    performingAction !== null &&
                    performingAction.startsWith(attendee.registrationId);
                  return (
                    <TableRow
                      key={attendee.registrationId}
                      className={isRowLoading ? "opacity-75 bg-muted/30" : ""}
                    >
                      <TableCell>
                        <div>
                          <div className="font-medium">{attendee.userName}</div>
                          <div className="text-sm text-muted-foreground">
                            {attendee.userEmail}
                          </div>
                          <div className="text-xs text-muted-foreground font-mono">
                            Code: {attendee.registrationCode}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(attendee.currentStatus)}
                          <Badge
                            variant={getStatusVariant(attendee.currentStatus)}
                          >
                            {attendee.currentStatus}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {formatDate(attendee.lastActivity)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {attendee.lastAction}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm font-medium">
                          {attendee.totalCreditHours < 0.01 ? (
                            <span className="text-muted-foreground">
                              Less than 1 min
                            </span>
                          ) : attendee.totalCreditHours < 1 ? (
                            <span>
                              {Math.round(attendee.totalCreditHours * 60)} min
                            </span>
                          ) : (
                            <span>
                              {attendee.totalCreditHours.toFixed(2)} hrs
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Raw: {attendee.totalCreditHours.toFixed(4)} hrs
                        </div>
                      </TableCell>
                      <TableCell>
                        {availableActions.length > 0 ? (
                          <div className="flex items-center space-x-1">
                            {availableActions.map((action) => {
                              let buttonVariant:
                                | "default"
                                | "outline"
                                | "secondary"
                                | "destructive" = "outline";
                              let buttonSize: "sm" | "xs" = "sm";

                              // Customize button appearance based on action
                              if (action.action === "CHECKIN") {
                                buttonVariant = "default";
                              } else if (action.action === "PAUSE") {
                                buttonVariant = "secondary";
                              } else if (action.action === "RESUME") {
                                buttonVariant = "default";
                              } else if (action.action === "CHECKOUT") {
                                buttonVariant = "destructive";
                              }

                              const isActionLoading =
                                performingAction ===
                                `${attendee.registrationId}-${action.action}`;

                              return (
                                <Button
                                  key={action.action}
                                  variant={buttonVariant}
                                  size={buttonSize}
                                  onClick={() =>
                                    handleIndividualAction(
                                      attendee,
                                      action.action
                                    )
                                  }
                                  disabled={
                                    isActionLoading || performingAction !== null
                                  }
                                  className={`hover:shadow-lg hover:-translate-y-1 hover:scale-[1.02] transition-all duration-300 ease-out transform text-xs px-2 py-1 h-8 ${
                                    isActionLoading || performingAction !== null
                                      ? "opacity-50 cursor-not-allowed"
                                      : ""
                                  }`}
                                >
                                  {isActionLoading ? (
                                    <RefreshCw className="h-3 w-3 animate-spin" />
                                  ) : (
                                    action.icon
                                  )}
                                  <span className="ml-1">{action.label}</span>
                                </Button>
                              );
                            })}
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">
                            No actions
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Bulk Checkout Confirmation Dialog */}
      <Dialog
        open={bulkCheckoutDialogOpen}
        onOpenChange={setBulkCheckoutDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Checkout All Attendees</DialogTitle>
            <DialogDescription>
              Are you sure you want to checkout all attendees for this event?
              This will mark the event as finished.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setBulkCheckoutDialogOpen(false)}
              disabled={isBulkCheckingOut}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleBulkCheckout}
              disabled={isBulkCheckingOut}
            >
              {isBulkCheckingOut ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Checking Out...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Checkout All
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
