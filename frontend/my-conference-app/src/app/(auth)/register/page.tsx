import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { RegisterForm } from "@/components/forms/register-form";

export const metadata: Metadata = {
  title: "Sign Up | Conference Timer",
  description: "Create your Conference Timer account",
};

export default function RegisterPage() {
  return (
    <div className="container relative min-h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      <div className="relative hidden h-full flex-col p-0 text-white lg:flex dark:border-r overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/register.jpg"
            alt="Professional conference auditorium with modern seating"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-br from-green-900/80 to-blue-900/80" />
        </div>
        <div className="relative z-20 flex items-center p-10 text-lg font-medium">
          Conference Timer
        </div>
        <div className="relative z-20 mt-auto p-10">
          <blockquote className="space-y-2">
            <p className="text-lg">
              &ldquo;Join thousands of event organizers who trust Conference
              Timer for accurate attendance tracking and seamless event
              management.&rdquo;
            </p>
            <footer className="text-sm">Product Team, Conference Timer</footer>
          </blockquote>
        </div>
      </div>

      <div className="lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <RegisterForm />

          <div className="text-center text-sm">
            Already have an account?{" "}
            <Link
              href="/login"
              className="underline underline-offset-4 hover:text-primary"
            >
              Sign in
            </Link>
          </div>

          <div className="text-center text-sm text-muted-foreground">
            By creating an account, you agree to our{" "}
            <Link
              href="/terms"
              className="underline underline-offset-4 hover:text-primary"
            >
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link
              href="/privacy"
              className="underline underline-offset-4 hover:text-primary"
            >
              Privacy Policy
            </Link>
            .
          </div>
        </div>
      </div>
    </div>
  );
}
