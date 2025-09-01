import { useState, useCallback } from "react";
import { apiClient } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/api";
import type { RegistrationDtoResponse } from "@/lib/types";

export function useRegistrations() {
  const [registrations, setRegistrations] = useState<RegistrationDtoResponse[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUserRegistrations = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await apiClient.get(
        API_ENDPOINTS.GET_USER_REGISTRATIONS
      );
      setRegistrations(response.data);
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || "Failed to fetch registrations";
      setError(errorMessage);
      console.error("Error fetching registrations:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const isEventRegistered = useCallback(
    (eventId: number) => {
      return registrations.some((reg) => reg.eventId === eventId);
    },
    [registrations]
  );

  return {
    registrations,
    isLoading,
    error,
    fetchUserRegistrations,
    isEventRegistered,
  };
}
