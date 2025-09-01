"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Calendar, Clock, ArrowLeft } from "lucide-react";
import { apiClient } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/api";
import type { EventDtoResponse } from "@/lib/types";

const editEventSchema = z
  .object({
    eventName: z.string().min(3, "Event name must be at least 3 characters"),
    eventStartTime: z.string().min(1, "Start time is required"),
    eventEndTime: z.string().min(1, "End time is required"),
  })
  .refine(
    (data) => {
      const startTime = new Date(data.eventStartTime);
      const endTime = new Date(data.eventEndTime);
      return endTime > startTime;
    },
    {
      message: "End time must be after start time",
      path: ["eventEndTime"],
    }
  );

type EditEventFormData = z.infer<typeof editEventSchema>;

export default function EditEventPage() {
  const router = useRouter();
  const params = useParams();
  const eventId = params.id as string;

  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [event, setEvent] = useState<EventDtoResponse | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<EditEventFormData>({
    resolver: zodResolver(editEventSchema),
  });

  useEffect(() => {
    if (eventId) {
      fetchEvent();
    }
  }, [eventId]);

  const fetchEvent = async () => {
    try {
      setIsFetching(true);
      const response = await apiClient.get(
        API_ENDPOINTS.GET_EVENT(parseInt(eventId))
      );
      const eventData = response.data;
      setEvent(eventData);

      // Pre-populate form fields
      setValue("eventName", eventData.eventName);
      setValue("eventStartTime", eventData.eventStartTime.slice(0, 16));
      setValue("eventEndTime", eventData.eventEndTime.slice(0, 16));
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || "Failed to fetch event";
      setError(errorMessage);
      console.error("Error fetching event:", err);
    } finally {
      setIsFetching(false);
    }
  };

  const onSubmit = async (data: EditEventFormData) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await apiClient.put(
        API_ENDPOINTS.UPDATE_EVENT(parseInt(eventId)),
        {
          eventName: data.eventName,
          startTime: data.eventStartTime,
          endTime: data.eventEndTime,
        }
      );

      if (response.status === 200) {
        setSuccess(true);
        // Redirect to events list after 2 seconds
        setTimeout(() => {
          router.push("/admin/events");
        }, 2000);
      }
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message ||
        "Failed to update event. Please try again.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <Card className="w-full max-w-2xl mx-auto">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-muted animate-pulse rounded-full mx-auto"></div>
              <div className="h-6 bg-muted animate-pulse rounded w-48 mx-auto"></div>
              <div className="h-4 bg-muted animate-pulse rounded w-32 mx-auto"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (success) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <Card className="w-full max-w-2xl mx-auto">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <Calendar className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold">
                Event Updated Successfully!
              </h3>
              <p className="text-muted-foreground">
                Your event has been updated. Redirecting to events list...
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <Card className="w-full max-w-2xl mx-auto">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <h3 className="text-xl font-semibold">Event Not Found</h3>
              <p className="text-muted-foreground">
                The event you're trying to edit could not be found.
              </p>
              <Button asChild>
                <a href="/admin/events">Back to Events</a>
              </Button>
            </div>
          </CardContent>
        </Card>
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
            <h2 className="text-3xl font-bold tracking-tight">Edit Event</h2>
            <p className="text-muted-foreground">
              Update event details and timing
            </p>
          </div>
        </div>
      </div>

      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Event Details</span>
          </CardTitle>
          <CardDescription>Update the event information below</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="eventName">Event Name *</Label>
              <Input
                id="eventName"
                placeholder="e.g., Annual Tech Conference 2024"
                {...register("eventName")}
                className={errors.eventName ? "border-red-500" : ""}
              />
              {errors.eventName && (
                <p className="text-sm text-red-500">
                  {errors.eventName.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="eventStartTime">Start Date & Time *</Label>
                <div className="relative">
                  <Clock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="eventStartTime"
                    type="datetime-local"
                    className={`pl-10 ${
                      errors.eventStartTime ? "border-red-500" : ""
                    }`}
                    {...register("eventStartTime")}
                  />
                </div>
                {errors.eventStartTime && (
                  <p className="text-sm text-red-500">
                    {errors.eventStartTime.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="eventEndTime">End Date & Time *</Label>
                <div className="relative">
                  <Clock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="eventEndTime"
                    type="datetime-local"
                    className={`pl-10 ${
                      errors.eventEndTime ? "border-red-500" : ""
                    }`}
                    {...register("eventEndTime")}
                  />
                </div>
                {errors.eventEndTime && (
                  <p className="text-sm text-red-500">
                    {errors.eventEndTime.message}
                  </p>
                )}
              </div>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="flex space-x-4">
              <Button type="submit" className="flex-1" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating Event...
                  </>
                ) : (
                  <>
                    <Calendar className="mr-2 h-4 w-4" />
                    Update Event
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/admin/events")}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
