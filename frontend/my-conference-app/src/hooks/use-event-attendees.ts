"use client";

import { useState, useCallback } from "react";
import { apiClient } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/api";
import type { EventAttendeeResponse } from "@/lib/types";

export function useEventAttendees(eventId: number) {
  const [attendees, setAttendees] = useState<EventAttendeeResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAttendees = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await apiClient.get(
        API_ENDPOINTS.GET_EVENT_ATTENDEES(eventId)
      );
      setAttendees(response.data);
      return { success: true, data: response.data };
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || "Failed to fetch attendees";
      setError(errorMessage);
      console.error("Error fetching attendees:", err);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, [eventId]);

  const performAttendeeAction = useCallback(
    async (registrationCode: string, action: string) => {
      try {
        const idempotencyKey = `${action.toLowerCase()}-${registrationCode}-${Date.now()}`;

        const response = await apiClient.post(API_ENDPOINTS.SCAN, {
          code: registrationCode,
          action: action,
          idempotencyKey: idempotencyKey,
        });

        // Refresh attendees list after action
        await fetchAttendees();

        return { success: true, data: response.data };
      } catch (err: any) {
        const errorMessage =
          err.response?.data?.message ||
          `Failed to ${action.toLowerCase()} attendee`;
        setError(errorMessage);
        console.error(`Error ${action.toLowerCase()}:`, err);
        return { success: false, error: errorMessage };
      }
    },
    [fetchAttendees]
  );

  const bulkCheckoutAll = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await apiClient.post(
        API_ENDPOINTS.CHECKOUT_ALL(eventId)
      );

      // Refresh attendees list after bulk checkout
      await fetchAttendees();

      return { success: true, data: response.data };
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || "Failed to checkout all attendees";
      setError(errorMessage);
      console.error("Error bulk checkout:", err);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, [eventId, fetchAttendees]);

  const exportAttendeesCSV = useCallback(async () => {
    try {
      const response = await apiClient.get(
        API_ENDPOINTS.EXPORT_ATTENDEES(eventId),
        {
          responseType: "blob",
        }
      );

      // Create download link
      const blob = new Blob([response.data], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `attendees_event_${eventId}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      return { success: true };
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || "Failed to export attendees";
      setError(errorMessage);
      console.error("Error exporting attendees:", err);
      return { success: false, error: errorMessage };
    }
  }, [eventId]);

  return {
    attendees,
    isLoading,
    error,
    fetchAttendees,
    performAttendeeAction,
    bulkCheckoutAll,
    exportAttendeesCSV,
  };
}
