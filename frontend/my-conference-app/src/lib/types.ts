// API Response Types based on Spring Boot DTOs

// User Types
export interface User {
  id: number;
  name: string;
  email: string;
}

export interface UserDtoRequest {
  name: string;
  email: string;
  password: string;
}

export interface UserDtoResponse {
  id: number;
  name: string;
  email: string;
}

export interface UserDtoLoginRequest {
  email: string;
  password: string;
}

export interface UserDtoLoginResponse {
  token: string;
  role: string;
}

// Admin Types
export interface AdminDtoRequest {
  staffName: string;
  email: string;
  password: string;
}

export interface AdminDtoResponse {
  id: number;
  name: string;
  email: string;
}

// Event Types
export interface Event {
  id: number;
  eventName: string;
  eventStartTime: string;
  eventEndTime: string;
}

export interface EventDtoRequest {
  eventName: string;
  eventStartTime: string;
  eventEndTime: string;
}

export interface EventDtoResponse {
  id: number;
  eventName: string;
  eventStartTime: string;
  eventEndTime: string;
}

// Registration Types
export interface RegistrationDtoResponse {
  registrationId: number;
  eventId: number;
  code: string;
  qrBase64: string;
}

// Attendance Types
export interface AttendanceDtoResponse {
  registrationId: number;
  creditHours: number;
  status: string;
}

export interface EventAttendeeResponse {
  registrationId: number;
  userId: number;
  userName: string;
  userEmail: string;
  registrationCode: string;
  currentStatus: string;
  lastActivity: string;
  totalCreditHours: number;
  lastAction: string;
}

export interface ScanDtoRequest {
  code: string;
  action?: "CHECKIN" | "PAUSE" | "RESUME" | "CHECKOUT";
  idempotencyKey?: string;
}

// Export Types
export interface AttendeeExportResponse {
  csvContent: string;
  filename: string;
}

// Dashboard Types
export interface DashboardStatsResponse {
  totalEvents: number;
  totalAttendees: number;
  totalRegistrations: number;
}

// Attendee Dashboard Types
export interface AttendeeDashboardStatsResponse {
  upcomingEvents: number;
  totalAttendanceHours: number;
  qrScans: number;
  eventsAttended: number;
  recentActivity: RecentActivityResponse[];
}

// Recent Activity Types
export interface RecentActivityResponse {
  activityType: string;
  eventName: string;
  timestamp: string;
  status: string;
}

// Bulk Operations
export interface BulkCheckoutResponse {
  message: string;
  checkedOutCount: number;
  totalAttendees: number;
}

// Form Data Types
export interface AdminRegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  validationCode: string;
}

// UI State Types
export interface AuthState {
  user: User | null;
  token: string | null;
  role: "USER" | "ADMIN" | null;
  isLoading: boolean;
}

export interface ApiError {
  message: string;
  status: number;
  timestamp: string;
}

// Navigation Types
export interface NavItem {
  title: string;
  href: string;
  icon?: string;
  badge?: string;
}

// Form Types
export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface EventFormData {
  eventName: string;
  eventStartTime: string;
  eventEndTime: string;
}
