"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { apiClient, API_ENDPOINTS, tokenUtils } from "@/lib/api";
import type {
  User,
  AuthState,
  UserDtoLoginRequest,
  UserDtoLoginResponse,
  UserDtoRequest,
  UserDtoResponse,
} from "@/lib/types";

export function useAuth() {
  const router = useRouter();
  const [authState, setAuthState] = useState<AuthState>(() => {
    // Initialize with client-side data if available
    if (typeof window !== "undefined") {
      const token = tokenUtils.getToken();
      const userData = localStorage.getItem("user");
      const userRole = localStorage.getItem("role");

      if (token && userData) {
        try {
          const payload = JSON.parse(atob(token.split(".")[1]));
          const currentTime = Date.now() / 1000;
          if (payload.exp > currentTime) {
            const normalizedRole = userRole?.startsWith("ROLE_")
              ? userRole.substring(5)
              : userRole;

            return {
              user: JSON.parse(userData),
              token,
              role: (normalizedRole as "USER" | "ADMIN") || null,
              isLoading: false,
            };
          }
        } catch {
          // Invalid token, fall through to default state
        }
      }
    }

    return {
      user: null,
      token: null,
      role: null,
      isLoading: true,
    };
  });

  // Finalize auth state loading on mount
  useEffect(() => {
    // If we didn't initialize with valid data, ensure loading is false
    if (authState.isLoading && !authState.user) {
      setAuthState((prev) => ({ ...prev, isLoading: false }));
    }
  }, [authState.isLoading, authState.user]);

  const login = useCallback(
    async (
      credentials: UserDtoLoginRequest,
      expectedRole?: "USER" | "ADMIN"
    ) => {
      try {
        setAuthState((prev) => ({ ...prev, isLoading: true }));

        const response = await apiClient.post<UserDtoLoginResponse>(
          API_ENDPOINTS.LOGIN,
          credentials
        );

        const { token, role } = response.data;

        // Normalize role - remove ROLE_ prefix if present
        const normalizedRole = role.startsWith("ROLE_")
          ? role.substring(5)
          : role;

        // Check if user has the expected role (if specified)
        if (expectedRole && normalizedRole !== expectedRole) {
          const errorMsg = `Access denied. This account is not an ${expectedRole.toLowerCase()}.`;
          setAuthState((prev) => ({ ...prev, isLoading: false }));
          return { success: false, error: errorMsg };
        }

        // Store token and normalized role
        tokenUtils.setToken(token);
        localStorage.setItem("role", normalizedRole);

        // Create user object (we'll need to fetch user details separately or extract from token)
        const user: User = {
          id: 0, // Will be updated when we have proper user data
          name: credentials.email.split("@")[0], // Temporary name
          email: credentials.email,
        };

        localStorage.setItem("user", JSON.stringify(user));

        const newAuthState = {
          user,
          token,
          role: normalizedRole as "USER" | "ADMIN",
          isLoading: false,
        };

        console.log("Login: Setting auth state to:", newAuthState);

        // Use functional update to ensure state is properly set
        setAuthState(() => {
          console.log(
            "Login: State updater function called with:",
            newAuthState
          );
          return newAuthState;
        });

        // Force page refresh to ensure clean state after login
        setTimeout(() => {
          const targetUrl =
            normalizedRole === "ADMIN"
              ? "/admin/dashboard"
              : "/attendee/dashboard";

          // Force a complete page refresh to the target URL
          window.location.href = targetUrl;
        }, 100);

        return { success: true };
      } catch (error: unknown) {
        setAuthState((prev) => ({ ...prev, isLoading: false }));
        return {
          success: false,
          error: (error as Error).message || "Login failed",
        };
      }
    },
    []
  );

  const registerUser = useCallback(async (userData: UserDtoRequest) => {
    try {
      setAuthState((prev) => ({ ...prev, isLoading: true }));

      const response = await apiClient.post<UserDtoResponse>(
        API_ENDPOINTS.REGISTER_USER,
        userData
      );

      setAuthState((prev) => ({ ...prev, isLoading: false }));
      return { success: true, data: response.data };
    } catch (error: unknown) {
      setAuthState((prev) => ({ ...prev, isLoading: false }));
      return {
        success: false,
        error: (error as Error).message || "Registration failed",
      };
    }
  }, []);

  const logout = useCallback(() => {
    // Clear all authentication data
    tokenUtils.removeToken();
    setAuthState({
      user: null,
      token: null,
      role: null,
      isLoading: false,
    });

    // Clear any cached data
    if (typeof window !== "undefined") {
      // Clear session storage
      sessionStorage.clear();

      // Clear any cached authentication data
      localStorage.removeItem("user");
      localStorage.removeItem("role");
      localStorage.removeItem("token");

      // Force page reload to clear any cached state
      window.location.replace("/login");
    } else {
      router.replace("/login");
    }
  }, [router]);

  const logoutWithRole = useCallback(() => {
    // Get current role before clearing auth state
    const currentRole = authState.role;

    // Clear all authentication data
    tokenUtils.removeToken();
    setAuthState({
      user: null,
      token: null,
      role: null,
      isLoading: false,
    });

    // Clear any cached data
    if (typeof window !== "undefined") {
      // Clear session storage
      sessionStorage.clear();

      // Clear any cached authentication data
      localStorage.removeItem("user");
      localStorage.removeItem("role");
      localStorage.removeItem("token");

      // Redirect based on role
      if (currentRole === "ADMIN") {
        window.location.replace("/admin/login");
      } else {
        window.location.replace("/login");
      }
    } else {
      // Fallback for server-side rendering
      if (currentRole === "ADMIN") {
        router.replace("/admin/login");
      } else {
        router.replace("/login");
      }
    }
  }, [router, authState.role]);

  const isAuthenticated = authState.token !== null && !authState.isLoading;
  const isAdmin = authState.role === "ADMIN";
  const isUser = authState.role === "USER";

  return {
    ...authState,
    login,
    logout,
    logoutWithRole,
    registerUser,
    isAuthenticated,
    isAdmin,
    isUser,
  };
}
