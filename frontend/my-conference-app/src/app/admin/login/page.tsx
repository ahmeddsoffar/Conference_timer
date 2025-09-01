import { AdminLoginForm } from "@/components/forms/admin-login-form";
import Link from "next/link";
import { Shield } from "lucide-react";

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <Shield className="h-12 w-12 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Admin Portal
          </h1>
          <p className="text-gray-600">
            Access your conference management dashboard
          </p>
        </div>

        <AdminLoginForm />

        <div className="text-center space-y-2">
          <p className="text-sm text-gray-600">
            Don&apos;t have an admin account?{" "}
            <Link
              href="/admin/register"
              className="font-medium text-primary hover:text-primary/80 transition-colors"
            >
              Create one here
            </Link>
          </p>
          <p className="text-sm text-gray-600">
            Are you an attendee?{" "}
            <Link
              href="/login"
              className="font-medium text-primary hover:text-primary/80 transition-colors"
            >
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
