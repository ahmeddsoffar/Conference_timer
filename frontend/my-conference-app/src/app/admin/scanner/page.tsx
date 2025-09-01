"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Camera,
  CameraOff,
  QrCode,
  CheckCircle,
  XCircle,
  AlertCircle,
  Users,
  Clock,
  MapPin,
  RefreshCw,
} from "lucide-react";
import { apiClient } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/api";

interface ScanResult {
  success: boolean;
  message: string;
  attendeeData?: {
    registrationId: number;
    userName: string;
    eventName: string;
    eventId: number;
    currentStatus: string;
  };
}

export default function QRScannerPage() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  const [isScanning, setIsScanning] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [showResultDialog, setShowResultDialog] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scanCount, setScanCount] = useState(0);
  const [lastScannedData, setLastScannedData] = useState<string>("");
  const [selectedAction, setSelectedAction] = useState<string>("CHECKIN");

  // Check if user is authenticated as admin
  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    
    if (!token || role !== "ADMIN") {
      router.push("/admin/login");
    }
  }, [router]);

  const startCamera = useCallback(async () => {
    try {
      setError(null);
      setIsLoading(true);
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment", // Use back camera on mobile
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setHasPermission(true);
        setIsScanning(true);
        startScanning();
      }
    } catch (err: any) {
      console.error("Camera permission error:", err);
      if (err.name === "NotAllowedError") {
        setError("Camera permission denied. Please allow camera access to scan QR codes.");
      } else if (err.name === "NotFoundError") {
        setError("No camera found on this device.");
      } else {
        setError("Failed to access camera: " + err.message);
      }
      setHasPermission(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsScanning(false);
    setHasPermission(false);
  }, []);

  const startScanning = useCallback(() => {
    if (!isScanning || !videoRef.current || !canvasRef.current) return;

    const scanFrame = () => {
      if (!isScanning || !videoRef.current || !canvasRef.current) return;

      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");

      if (video.videoWidth === 0 || video.videoHeight === 0) {
        requestAnimationFrame(scanFrame);
        return;
      }

      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Draw video frame to canvas
      context?.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Get image data for QR code detection
      const imageData = context?.getImageData(0, 0, canvas.width, canvas.height);
      
      if (imageData) {
        // Use jsQR library to detect QR codes
        // For now, we'll simulate QR detection
        // In a real implementation, you'd use a QR library like jsQR
        detectQRCode(imageData);
      }

      if (isScanning) {
        requestAnimationFrame(scanFrame);
      }
    };

    scanFrame();
  }, [isScanning]);

  const detectQRCode = async (imageData: ImageData) => {
    try {
      // For now, we'll use a simple approach to detect QR codes
      // In production, you'd integrate with a QR library like jsQR
      
      // Check if we have a valid image to process
      if (imageData.width === 0 || imageData.height === 0) {
        return;
      }

      // Simple QR code detection simulation
      // This is where you'd integrate jsQR or similar library
      // For demo purposes, we'll use a manual trigger
      
      // TODO: Replace with actual QR detection library
      // const code = jsQR(imageData.data, imageData.width, imageData.height);
      // if (code) {
      //   await processQRCode(code.data);
      // }
      
    } catch (err) {
      console.error("QR detection error:", err);
    }
  };

  const processQRCode = async (qrData: string) => {
    try {
      setIsLoading(true);
      setError(null);

      // Store the scanned data for debugging
      setLastScannedData(qrData);
      
      // Parse QR data to extract the registration code
      // Expected format: REG:{registrationCode}:EVENT:{eventId}:USER:{userId}
      const parts = qrData.split(":");
      if (parts.length < 6) {
        throw new Error("Invalid QR code format. Expected: REG:{code}:EVENT:{id}:USER:{id}");
      }

      const registrationCode = parts[1]; // This is the actual code from the QR
      const eventId = parseInt(parts[3]);
      const userId = parseInt(parts[5]);

      // Generate unique idempotency key to prevent duplicate scans
      const idempotencyKey = `scan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Call the actual backend scan endpoint
      const response = await apiClient.post(API_ENDPOINTS.SCAN, {
        code: registrationCode,        // The registration code from QR
        action: selectedAction,        // Use selected action (CHECKIN, PAUSE, RESUME, CHECKOUT)
        idempotencyKey: idempotencyKey // Prevent duplicate scans
      });

      console.log("Scan response:", response.data);

      // Handle the response based on your backend format
      if (response.data.registrationId) {
        setScanResult({
          success: true,
          message: `Attendee ${selectedAction.toLowerCase()}ed successfully! 🎉\nCredit Hours: ${response.data.totalActiveSeconds || 0}`,
          attendeeData: {
            registrationId: response.data.registrationId,
            userName: `User ${response.data.registrationId}`, // You might want to fetch user details separately
            eventName: `Event ${eventId}`,
            eventId: eventId,
            currentStatus: response.data.status || selectedAction
          },
        });
        setScanCount(prev => prev + 1);
      } else {
        setScanResult({
          success: false,
          message: "Check-in failed - invalid response from server",
        });
      }
    } catch (err: any) {
      console.error("Check-in error:", err);
      setScanResult({
        success: false,
        message: err.response?.data?.message || err.message || "Failed to process QR code",
      });
    } finally {
      setIsLoading(false);
      setShowResultDialog(true);
    }
  };

  const handleManualQRInput = async () => {
    const qrData = prompt("Enter QR code data manually:");
    if (qrData) {
      await processQRCode(qrData);
    }
  };

  const resetScanner = () => {
    setScanResult(null);
    setShowResultDialog(false);
    setError(null);
    if (isScanning) {
      startCamera();
    }
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">QR Scanner</h1>
          <p className="text-muted-foreground">
            Scan attendee QR codes to check them in automatically
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="secondary" className="text-sm">
            Scans: {scanCount}
          </Badge>
          <Badge variant="outline" className="text-sm">
            Action: {selectedAction}
          </Badge>
          <Button
            variant="outline"
            onClick={() => router.push("/admin/dashboard")}
          >
            Back to Dashboard
          </Button>
        </div>
      </div>

      {/* Camera Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Camera className="h-5 w-5" />
            <span>Camera Controls</span>
          </CardTitle>
          <CardDescription>
            Start the camera to begin scanning QR codes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-4">
            <Button
              onClick={startCamera}
              disabled={isLoading || hasPermission}
              className="hover:shadow-lg hover:-translate-y-1 hover:scale-[1.02] transition-all duration-300 ease-out transform"
            >
              {isLoading ? (
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Camera className="mr-2 h-4 w-4" />
              )}
              Start Camera
            </Button>
            
            <Button
              onClick={stopCamera}
              disabled={!hasPermission}
              variant="outline"
              className="hover:shadow-lg hover:-translate-y-1 hover:scale-[1.02] transition-all duration-300 ease-out transform"
            >
              <CameraOff className="mr-2 h-4 w-4" />
              Stop Camera
            </Button>

            <Button
              onClick={handleManualQRInput}
              variant="outline"
              className="hover:shadow-lg hover:-translate-y-1 hover:scale-[1.02] transition-all duration-300 ease-out transform"
            >
              <QrCode className="mr-2 h-4 w-4" />
              Manual Input
            </Button>

            <Button
              onClick={() => processQRCode("REG:123:EVENT:456:USER:789")}
              variant="outline"
              className="hover:shadow-lg hover:-translate-y-1 hover:scale-[1.02] transition-all duration-300 ease-out transform"
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Test Scan
            </Button>
          </div>

          {/* Action Selection */}
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium">Scan Action:</span>
            <div className="flex space-x-1">
              {["CHECKIN", "PAUSE", "RESUME", "CHECKOUT"].map((action) => (
                <Button
                  key={action}
                  size="sm"
                  variant={selectedAction === action ? "default" : "outline"}
                  onClick={() => setSelectedAction(action)}
                  className="text-xs px-2 py-1"
                >
                  {action}
                </Button>
              ))}
            </div>
          </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Debug Info */}
          {lastScannedData && (
            <Alert variant="secondary">
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center space-x-2">
                  <QrCode className="h-4 w-4" />
                  <AlertDescription>
                    <span className="font-medium">Last Scanned Data:</span> {lastScannedData}
                  </AlertDescription>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setLastScannedData("")}
                  className="h-6 w-6 p-0"
                >
                  <XCircle className="h-4 w-4" />
                </Button>
              </div>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Camera View */}
      {hasPermission && (
        <Card>
          <CardHeader>
            <CardTitle>Live Camera Feed</CardTitle>
            <CardDescription>
              Position the QR code within the camera view to scan
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full max-w-2xl mx-auto rounded-lg border shadow-lg"
              />
              <canvas
                ref={canvasRef}
                className="hidden"
              />
              
              {/* Scanning Overlay */}
              <div className="absolute inset-0 max-w-2xl mx-auto flex items-center justify-center">
                <div className="border-2 border-primary/50 rounded-lg p-8 relative">
                  <div className="w-64 h-64 border-2 border-primary border-dashed rounded-lg flex items-center justify-center relative overflow-hidden">
                    <QrCode className="h-16 w-16 text-primary/50" />
                    
                    {/* Scanning Animation */}
                    {isScanning && (
                      <div className="absolute inset-0">
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent animate-pulse"></div>
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent animate-pulse animation-delay-1000"></div>
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-primary to-transparent animate-pulse animation-delay-500"></div>
                        <div className="absolute right-0 top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-primary to-transparent animate-pulse animation-delay-1500"></div>
                      </div>
                    )}
                  </div>
                  <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-sm text-primary/70 bg-background px-2">
                    {isScanning ? "Scanning..." : "Position QR code here"}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>How to Use</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
              1
            </div>
            <div>
              <p className="font-medium">Start the camera</p>
              <p className="text-sm text-muted-foreground">
                Click "Start Camera" and allow camera permissions when prompted
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
              2
            </div>
            <div>
              <p className="font-medium">Position the QR code</p>
              <p className="text-sm text-muted-foreground">
                Hold the attendee's QR code within the scanning area
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
              3
            </div>
            <div>
              <p className="font-medium">Automatic check-in</p>
              <p className="text-sm text-muted-foreground">
                The system will automatically detect the QR code and check in the attendee
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Result Dialog */}
      <Dialog open={showResultDialog} onOpenChange={setShowResultDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              {scanResult?.success ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
              <span>
                {scanResult?.success ? "Check-in Successful" : "Check-in Failed"}
              </span>
            </DialogTitle>
            <DialogDescription>
              {scanResult?.message}
            </DialogDescription>
          </DialogHeader>
          
          {scanResult?.success && scanResult.attendeeData && (
            <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{scanResult.attendeeData.userName}</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{scanResult.attendeeData.eventName}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Status: {scanResult.attendeeData.currentStatus}</span>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button onClick={resetScanner} className="w-full">
              Continue Scanning
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
