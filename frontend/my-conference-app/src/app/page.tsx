import Link from "next/link";
import {
  ArrowRight,
  Calendar,
  QrCode,
  Users,
  BarChart3,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function Home() {
  const features = [
    {
      icon: Calendar,
      title: "Event Management",
      description:
        "Create and manage conferences with ease. Set up events, track schedules, and monitor attendance.",
    },
    {
      icon: QrCode,
      title: "QR Code Check-ins",
      description:
        "Seamless attendee check-ins with QR codes. Fast, accurate, and contactless attendance tracking.",
    },
    {
      icon: Users,
      title: "Attendee Portal",
      description:
        "Dedicated portal for attendees to register, view events, and access their QR codes.",
    },
    {
      icon: BarChart3,
      title: "Real-time Analytics",
      description:
        "Monitor attendance in real-time with comprehensive analytics and export capabilities.",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="flex-1 flex items-center justify-center px-6 py-12 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            Modern Conference
            <span className="text-primary"> Attendance Tracking</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Streamline your event management with QR code-based attendance
            tracking, real-time analytics, and comprehensive reporting tools.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              asChild
              className="hover:shadow-xl hover:-translate-y-2 hover:scale-[1.02] transition-all duration-300 ease-out transform"
            >
              <Link href="/login">
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              asChild
              className="hover:shadow-xl hover:-translate-y-2 hover:scale-[1.02] transition-all duration-300 ease-out transform"
            >
              <Link href="/register">Create Account</Link>
            </Button>
            <Button
              size="lg"
              variant="secondary"
              asChild
              className="hover:shadow-xl hover:-translate-y-2 hover:scale-[1.02] transition-all duration-300 ease-out transform"
            >
              <Link href="/admin/login">
                <Shield className="mr-2 h-4 w-4" />
                Admin Portal
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl md:text-4xl font-bold">
              Everything you need for event management
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Comprehensive tools to manage conferences, track attendance, and
              analyze data.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="text-center h-full hover:shadow-xl hover:-translate-y-2 hover:scale-[1.02] transition-all duration-300 ease-out transform cursor-pointer"
              >
                <CardHeader>
                  <div className="mx-auto w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
