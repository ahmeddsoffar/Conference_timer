"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Plus,
  CheckCircle,
  QrCode,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useEvents } from "@/hooks/use-events";
import { useRegistrations } from "@/hooks/use-registrations";
import type { EventDtoResponse } from "@/lib/types";

function EventCard({
  event,
  onRegister,
  isRegistering,
  isRegistered,
  onGenerateQR,
}: {
  event: EventDtoResponse;
  onRegister: (eventId: number) => void;
  isRegistering: boolean;
  isRegistered: boolean;
  onGenerateQR: (eventId: number) => void;
}) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const isUpcoming = new Date(event.eventStartTime) > new Date();
  const isActive =
    new Date(event.eventStartTime) <= new Date() &&
    new Date(event.eventEndTime) >= new Date();

  return (
    <Card className="h-full hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-xl">{event.eventName}</CardTitle>
            <CardDescription className="flex items-center space-x-2">
              <Calendar className="h-4 w-4" />
              <span>{formatDate(event.eventStartTime)}</span>
            </CardDescription>
          </div>
          <Badge
            variant={
              isActive ? "default" : isUpcoming ? "secondary" : "outline"
            }
          >
            {isActive ? "Active" : isUpcoming ? "Upcoming" : "Completed"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>
              {formatDate(event.eventStartTime)} -{" "}
              {formatDate(event.eventEndTime)}
            </span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>Conference Center</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>Open Registration</span>
          </div>
        </div>

        {isUpcoming && !isRegistered && (
          <Button
            onClick={() => onRegister(event.id)}
            className="w-full"
            disabled={isRegistering}
          >
            {isRegistering ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Registering...
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Register Now
              </>
            )}
          </Button>
        )}

        {isUpcoming && isRegistered && (
          <div className="space-y-2">
            <Button
              onClick={() => onGenerateQR(event.id)}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              <QrCode className="mr-2 h-4 w-4" />
              Generate QR Code
            </Button>
            <div className="flex items-center justify-center text-sm text-green-600">
              <CheckCircle className="h-4 w-4 mr-1" />
              Registered Successfully
            </div>
          </div>
        )}

        {isActive && (
          <Button variant="outline" className="w-full">
            View Event Details
          </Button>
        )}

        {!isUpcoming && !isActive && (
          <Button variant="outline" className="w-full" disabled>
            Event Completed
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

export default function EventsPage() {
  const router = useRouter();
  const { events, isLoading, fetchAllEvents, registerForEvent } = useEvents();
  const { registrations, fetchUserRegistrations, isEventRegistered } =
    useRegistrations();
  const [registeringEventId, setRegisteringEventId] = useState<number | null>(
    null
  );
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    fetchAllEvents();
    fetchUserRegistrations();
  }, [fetchAllEvents, fetchUserRegistrations]);

  const handleRegister = async (eventId: number) => {
    setRegisteringEventId(eventId);
    setMessage(null);

    const result = await registerForEvent(eventId);

    if (result.success) {
      setMessage({
        type: "success",
        text: "Successfully registered for the event! You can now generate your QR code.",
      });
      // Refresh registrations to show updated status
      fetchUserRegistrations();
      // Refresh events list to show updated registration status
      fetchAllEvents();
    } else {
      setMessage({
        type: "error",
        text: result.error || "Failed to register for event",
      });
    }

    setRegisteringEventId(null);
  };

  const handleGenerateQR = (eventId: number) => {
    // Redirect to QR generation page
    router.push(`/attendee/registrations?eventId=${eventId}`);
  };

  if (isLoading && events.length === 0) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">
            Available Events
          </h2>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={`loading-card-${i}`} className="h-full">
              <CardHeader>
                <div className="space-y-2">
                  <div className="h-6 bg-muted animate-pulse rounded"></div>
                  <div className="h-4 bg-muted animate-pulse rounded w-3/4"></div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-4 bg-muted animate-pulse rounded"></div>
                  <div className="h-4 bg-muted animate-pulse rounded w-2/3"></div>
                  <div className="h-10 bg-muted animate-pulse rounded"></div>
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
          <h2 className="text-3xl font-bold tracking-tight">
            Available Events
          </h2>
          <p className="text-muted-foreground">
            Browse and register for upcoming conferences and workshops
          </p>
        </div>
      </div>

      {message && (
        <Alert variant={message.type === "error" ? "destructive" : "default"}>
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}

      {!Array.isArray(events) || events.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Events Available</h3>
            <p className="text-muted-foreground text-center">
              There are currently no events available for registration. Check
              back later for new conferences and workshops.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <EventCard
              key={`event-${event.id}`}
              event={event}
              onRegister={handleRegister}
              isRegistering={registeringEventId === event.id}
              isRegistered={isEventRegistered(event.id)}
              onGenerateQR={handleGenerateQR}
            />
          ))}
        </div>
      )}
    </div>
  );
}
