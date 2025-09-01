import { AdminRegisterForm } from "@/components/forms/admin-register-form";
import Link from "next/link";
import { Shield } from "lucide-react";

export default function AdminRegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <Shield className="h-12 w-12 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Admin Registration
          </h1>
          <p className="text-gray-600">
            Create a new admin account for conference management
          </p>
          <p className="text-sm text-gray-500 mt-2">
            You&apos;ll need an admin validation code to complete registration
          </p>
        </div>

        <AdminRegisterForm />

        <div className="text-center space-y-2">
          <p className="text-sm text-gray-600">
            Already have an admin account?{" "}
            <Link
              href="/admin/login"
              className="font-medium text-primary hover:text-primary/80 transition-colors"
            >
              Sign in here
            </Link>
          </p>
          <p className="text-sm text-gray-600">
            Are you an attendee?{" "}
            <Link
              href="/register"
              className="font-medium text-primary hover:text-primary/80 transition-colors"
            >
              Register here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
