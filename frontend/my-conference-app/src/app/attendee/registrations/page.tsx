"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Calendar, QrCode, Download, Eye, ArrowLeft } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useQR } from "@/hooks/use-qr";
import { useRegistrations } from "@/hooks/use-registrations";
import type { RegistrationDtoResponse } from "@/lib/types";

// No mock data - will show empty state for new users

function QRCodeDialog({
  registration,
  isFocused = false,
}: {
  registration: RegistrationDtoResponse;
  isFocused?: boolean;
}) {
  const { generateQRCode, downloadQRCode, isLoading } = useQR();
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);

  const handleGenerateQR = async () => {
    try {
      // Use the base64 QR code directly from the backend
      if (registration.qrBase64) {
        setQrCodeUrl(`data:image/png;base64,${registration.qrBase64}`);
      } else {
        // Fallback to generating QR code if base64 is not available
        const qrUrl = await generateQRCode(registration.code);
        setQrCodeUrl(qrUrl);
      }
    } catch (error) {
      console.error("Failed to generate QR code:", error);
    }
  };

  const handleDownload = async () => {
    if (qrCodeUrl) {
      await downloadQRCode(qrCodeUrl, `qr-${registration.code}.png`);
    }
  };

  useEffect(() => {
    handleGenerateQR();
  }, [registration.code, registration.qrBase64]);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant={isFocused ? "default" : "outline"}
          size={isFocused ? "lg" : "sm"}
          className={isFocused ? "bg-green-600 hover:bg-green-700" : ""}
        >
          <QrCode className="h-4 w-4 mr-2" />
          {isFocused ? "Generate QR Code" : "View QR"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Event QR Code</DialogTitle>
          <DialogDescription>
            Use this QR code for event check-in and attendance tracking
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center space-y-4">
          {isLoading ? (
            <div className="w-64 h-64 bg-muted animate-pulse rounded-lg flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : qrCodeUrl ? (
            <div className="p-4 bg-white rounded-lg border">
              <img src={qrCodeUrl} alt="QR Code" className="w-56 h-56" />
            </div>
          ) : (
            <div className="w-64 h-64 bg-muted rounded-lg flex items-center justify-center">
              <p className="text-muted-foreground">
                Failed to generate QR code
              </p>
            </div>
          )}

          <div className="text-center space-y-2">
            <p className="text-sm font-medium">Registration Code</p>
            <p className="text-xs text-muted-foreground font-mono bg-muted px-2 py-1 rounded">
              {registration.code}
            </p>
          </div>

          {qrCodeUrl && (
            <Button onClick={handleDownload} className="w-full">
              <Download className="h-4 w-4 mr-2" />
              Download QR Code
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function RegistrationCard({
  registration,
}: {
  registration: RegistrationDtoResponse;
}) {
  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg">
              Event #{registration.eventId}
            </CardTitle>
            <CardDescription className="flex items-center space-x-2">
              <Calendar className="h-4 w-4" />
              <span>Registration Code: {registration.code}</span>
            </CardDescription>
          </div>
          <Badge variant="secondary">Registered</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <p className="text-sm font-medium">Registration Code</p>
          <p className="text-xs text-muted-foreground font-mono bg-muted px-2 py-1 rounded">
            {registration.code}
          </p>
        </div>

        <div className="flex space-x-2">
          <QRCodeDialog registration={registration} />
          <Button variant="outline" size="sm">
            <Eye className="h-4 w-4 mr-2" />
            Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function RegistrationsPage() {
  const searchParams = useSearchParams();
  const eventId = searchParams.get("eventId");
  const { registrations, isLoading, error, fetchUserRegistrations } =
    useRegistrations();

  // Fetch registrations when page loads
  useEffect(() => {
    fetchUserRegistrations();
  }, [fetchUserRegistrations]);

  // Find the registration for the specific event if eventId is provided
  const focusedRegistration = eventId
    ? registrations.find((r) => r.eventId === parseInt(eventId))
    : null;

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      {eventId && (
        <Card
          className={
            focusedRegistration
              ? "border-green-200 bg-green-50"
              : "border-orange-200 bg-orange-50"
          }
        >
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold text-green-800">
                  Event #{eventId}
                </h3>
                {focusedRegistration ? (
                  <p className="text-green-600">
                    You've successfully registered for this event. Generate your
                    QR code for check-in.
                  </p>
                ) : (
                  <p className="text-orange-600">
                    You haven't registered for this event yet. Please register
                    first from the events page.
                  </p>
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.history.back()}
                className={
                  focusedRegistration
                    ? "text-green-700 border-green-300 hover:bg-green-100"
                    : "text-orange-700 border-orange-300 hover:bg-orange-100"
                }
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Events
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {focusedRegistration ? (
              <div className="flex items-center justify-center">
                <QRCodeDialog
                  registration={focusedRegistration}
                  isFocused={true}
                />
              </div>
            ) : (
              <div className="text-center py-4">
                <Button asChild>
                  <a href="/attendee/events">Browse Events</a>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            My Registrations
          </h2>
          <p className="text-muted-foreground">
            View your registered events and generate QR codes for check-in
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={`loading-card-${i}`} className="h-full">
              <CardHeader>
                <div className="space-y-2">
                  <div className="h-6 bg-muted animate-pulse rounded"></div>
                  <div className="h-4 bg-muted animate-pulse rounded w-3/4"></div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-4 bg-muted animate-pulse rounded"></div>
                  <div className="h-4 bg-muted animate-pulse rounded w-2/3"></div>
                  <div className="h-10 bg-muted animate-pulse rounded"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : registrations.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <QrCode className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Registrations Yet</h3>
            <p className="text-muted-foreground text-center mb-4">
              You haven&apos;t registered for any events yet. Browse available
              events and register to get your QR codes for check-in.
            </p>
            <Button asChild>
              <a href="/attendee/events">Browse Events</a>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {registrations.map((registration) => (
            <RegistrationCard
              key={registration.registrationId}
              registration={registration}
            />
          ))}
        </div>
      )}
    </div>
  );
}
