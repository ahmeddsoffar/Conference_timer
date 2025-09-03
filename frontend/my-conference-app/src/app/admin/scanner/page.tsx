"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Scanner } from '@yudiel/react-qr-scanner';
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
  // QrScanner handles all camera and scanning functionality

  const [isScanning, setIsScanning] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [showResultDialog, setShowResultDialog] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scanCount, setScanCount] = useState(0);
  const [lastScannedData, setLastScannedData] = useState<string>("");
  const [selectedAction, setSelectedAction] = useState<string>("CHECKIN");
  const [scanLoopActive, setScanLoopActive] = useState(false);

  // ✅ Authentication check
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

      // QrScanner handles camera access automatically

      // QrScanner handles everything automatically
      setHasPermission(true);
      setIsScanning(true);
      setScanLoopActive(true);
      
      console.log("✅ Camera started successfully");
    } catch (err: unknown) {
      console.error("Camera error:", err);
      const error = err as Error;
      if (error.name === "NotAllowedError") {
        setError("Camera permission denied. Please allow access.");
      } else if (error.name === "NotFoundError") {
        setError("No camera found.");
      } else {
        setError("Camera error: " + error.message);
      }
      setHasPermission(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const stopCamera = useCallback(() => {
    // QrScanner handles cleanup automatically
    setIsScanning(false);
    setHasPermission(false);
    setScanLoopActive(false);
    console.log("✅ Camera stopped");
  }, []);

  // QrScanner handles all scanning automatically - no need for complex scanning loop

  const processQRCode = async (qrData: string) => {
    try {
      setIsLoading(true);
      setError(null);
      setLastScannedData(qrData);

      // Handle different QR code formats
      let registrationCode: string;
      let eventId: number;

      // Try to parse different formats
      if (qrData.includes(":")) {
        // Format: REG:123:EVENT:456:USER:789
        const parts = qrData.split(":");
        if (parts.length >= 4) {
          registrationCode = parts[1] || qrData;
          eventId = parseInt(parts[3]) || 1;
        } else {
          registrationCode = qrData;
          eventId = 1;
        }
      } else {
        // Single code format - treat as registration code
        registrationCode = qrData;
        eventId = 1;
      }

      const idempotencyKey = `scan_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

      const response = await apiClient.post(API_ENDPOINTS.SCAN, {
        code: registrationCode,
        action: selectedAction,
        idempotencyKey,
      });

             if (response.data.registrationId) {
         setScanResult({
           success: true,
           message: `Attendee ${selectedAction.toLowerCase()} successful! 🎉`,
           attendeeData: {
             registrationId: response.data.registrationId,
             userName: response.data.userName || `User ${response.data.registrationId}`,
             eventName: response.data.eventName || `Event ${eventId}`,
             eventId,
             currentStatus: response.data.status || selectedAction,
           },
         });
         setScanCount((prev) => prev + 1);
         
         // Auto-reset scanner after successful scan to allow continuous scanning
         setTimeout(() => {
           setLastScannedData("");
           console.log("🔄 Auto-reset scanner for next scan");
         }, 2000); // Wait 2 seconds before auto-reset
       } else {
         setScanResult({ success: false, message: "Invalid server response" });
       }
    } catch (err: unknown) {
      console.error("Scan error:", err);
      const error = err as Error;
      setScanResult({
        success: false,
        message: error.message || "Scan failed",
      });
    } finally {
      setIsLoading(false);
      setShowResultDialog(true);
    }
  };

  const handleManualQRInput = async () => {
    const qrData = prompt("Enter QR code data (e.g., REG:123:EVENT:456:USER:789 or just 123):");
    if (qrData && qrData.trim()) {
      await processQRCode(qrData.trim());
    }
  };

  const resetScanner = () => {
    setScanResult(null);
    setShowResultDialog(false);
    setError(null);
    setLastScannedData(""); // Reset the last scanned data to allow re-scanning
    // Restart camera to continue scanning
    if (isScanning) {
      stopCamera();
      setTimeout(() => startCamera(), 100); // Small delay to ensure proper restart
    }
  };

  // QrScanner handles cleanup automatically

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">QR Code Scanner</h1>
          <p className="text-muted-foreground">Scan attendee QR codes for event management</p>
        </div>
        <div className="flex items-center space-x-4">
          <Badge variant="default" className="text-sm">
            <Users className="mr-1 h-3 w-3" />
            Scanned: {scanCount}
          </Badge>
          <Badge variant="outline" className="text-sm">
            <Clock className="mr-1 h-3 w-3" />
            {new Date().toLocaleTimeString()}
          </Badge>
        </div>
      </div>

      {/* Main Scanner Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <QrCode className="h-5 w-5" />
            Event Scanner
          </CardTitle>
          <CardDescription>
            Use your device camera to scan QR codes or manually input registration data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Camera Controls */}
          <div className="flex flex-wrap items-center gap-3">
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
               onClick={() => {
                 setLastScannedData("");
                 console.log("🔄 Scanner reset - ready for new scans");
               }}
               variant="outline"
               className="hover:shadow-lg hover:-translate-y-1 hover:scale-[1.02] transition-all duration-300 ease-out transform"
             >
               <RefreshCw className="mr-2 h-4 w-4" />
               Reset Scanner
             </Button>

                         <Button
               onClick={() => processQRCode("REG:123:EVENT:456:USER:789")}
               variant="outline"
               className="hover:shadow-lg hover:-translate-y-1 hover:scale-[1.02] transition-all duration-300 ease-out transform"
             >
               <CheckCircle className="mr-2 h-4 w-4" />
               Test Scan
             </Button>
             
                           <Button
                onClick={() => {
                  console.log("🔍 Manual scan test");
                  console.log("Is scanning:", isScanning);
                  console.log("Scan loop active:", scanLoopActive);
                  console.log("Has permission:", hasPermission);
                }}
                variant="outline"
                className="hover:shadow-lg hover:-translate-y-1 hover:scale-[1.02] transition-all duration-300 ease-out transform"
              >
                <AlertCircle className="mr-2 h-4 w-4" />
                Debug Info
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

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Debug Info */}
          {lastScannedData && (
            <Alert>
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
                                            <Scanner
                 onScan={(detectedCodes) => {
                   if (detectedCodes && detectedCodes.length > 0) {
                     const result = detectedCodes[0].rawValue;
                     console.log("🎯 QR Code detected:", result);
                     if (result && result !== lastScannedData) {
                       setLastScannedData(result);
                       processQRCode(result);
                     }
                   }
                 }}
                 onError={(error: unknown) => {
                   console.error("QR Scanner error:", error);
                   const errorObj = error as Error;
                   setError("Scanner error: " + errorObj.message);
                 }}
                 constraints={{
                   facingMode: "environment",
                   width: { ideal: 1280 },
                   height: { ideal: 720 }
                 }}
                 formats={["qr_code"]}
                 classNames={{
                   container: "w-full max-w-2xl mx-auto rounded-lg border shadow-lg"
                 }}
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
                                     {isScanning && (
                     <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                       <div className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-medium animate-pulse">
                         🔍 ACTIVE
                       </div>
                     </div>
                   )}
                   {scanLoopActive && (
                     <div className="absolute -top-12 left-1/2 transform -translate-x-1/2">
                       <div className="bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                         🔄 SCANNING
                       </div>
                     </div>
                   )}
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
            <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium mt-0.5">
              1
            </div>
            <div>
              <p className="font-medium">Start Camera</p>
			  <p className="text-sm text-muted-foreground">{'Click "Start Camera" to activate your device camera'}</p>

            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium mt-0.5">
              2
            </div>
            <div>
              <p className="font-medium">Position QR Code</p>
              <p className="text-sm text-muted-foreground">Hold the QR code within the scanning frame</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium mt-0.5">
              3
            </div>
            <div>
              <p className="font-medium">Select Action</p>
              <p className="text-sm text-muted-foreground">Choose CHECKIN, PAUSE, RESUME, or CHECKOUT</p>
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
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-600" />
              )}
              <span>Scan Result</span>
            </DialogTitle>
            <DialogDescription>
              {scanResult?.message}
            </DialogDescription>
          </DialogHeader>
          
          {scanResult?.attendeeData && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Registration ID:</span>
                  <p>{scanResult.attendeeData.registrationId}</p>
                </div>
                <div>
                  <span className="font-medium">User Name:</span>
                  <p>{scanResult.attendeeData.userName}</p>
                </div>
                <div>
                  <span className="font-medium">Event Name:</span>
                  <p>{scanResult.attendeeData.eventName}</p>
                </div>
                <div>
                  <span className="font-medium">Status:</span>
                  <p>{scanResult.attendeeData.currentStatus}</p>
                </div>
              </div>
            </div>
          )}
          
                     <DialogFooter className="flex gap-2">
             <Button onClick={resetScanner} variant="outline" className="flex-1">
               Scan Another
             </Button>
             <Button onClick={() => setShowResultDialog(false)} className="flex-1">
               Close
             </Button>
           </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
