"use client";

import { useState, useCallback } from "react";
import { apiClient, API_ENDPOINTS, handleApiError } from "@/lib/api";
import type {
  EventDtoResponse,
  RegistrationDtoResponse,
  EventDtoRequest,
} from "@/lib/types";

export function useEvents() {
  const [isLoading, setIsLoading] = useState(false);
  const [events, setEvents] = useState<EventDtoResponse[]>([]);

  const fetchAllEvents = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.get<EventDtoResponse[]>(
        API_ENDPOINTS.ATTENDEE_EVENTS
      );
      setEvents(response.data);
      return { success: true, data: response.data };
    } catch (error) {
      console.error("Fetch events error:", error);
      return {
        success: false,
        error: handleApiError(error),
      };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const registerForEvent = useCallback(async (eventId: number) => {
    try {
      setIsLoading(true);
      const response = await apiClient.post<RegistrationDtoResponse>(
        API_ENDPOINTS.REGISTER_FOR_EVENT(eventId)
      );
      return { success: true, data: response.data };
    } catch (error) {
      console.error("Event registration error:", error);
      return {
        success: false,
        error: handleApiError(error),
      };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getEventById = useCallback(async (eventId: number) => {
    try {
      setIsLoading(true);
      const response = await apiClient.get<EventDtoResponse>(
        API_ENDPOINTS.GET_EVENT(eventId)
      );
      return { success: true, data: response.data };
    } catch (error) {
      console.error("Get event error:", error);
      return {
        success: false,
        error: handleApiError(error),
      };
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    events,
    isLoading,
    fetchAllEvents,
    registerForEvent,
    getEventById,
  };
}
