"use client";

import { useState, useCallback } from "react";
import QRCode from "qrcode";
import { apiClient, API_ENDPOINTS, handleApiError } from "@/lib/api";

export function useQR() {
  const [isLoading, setIsLoading] = useState(false);

  const generateQRCode = useCallback(async (text: string): Promise<string> => {
    try {
      const qrCodeDataURL = await QRCode.toDataURL(text, {
        width: 256,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
      });
      return qrCodeDataURL;
    } catch (error) {
      console.error("QR Code generation error:", error);
      throw new Error("Failed to generate QR code");
    }
  }, []);

  const getRegistrationQR = useCallback(async (registrationId: number) => {
    try {
      setIsLoading(true);
      const response = await apiClient.get(
        API_ENDPOINTS.GET_QR(registrationId),
        { responseType: "blob" }
      );

      // Convert blob to data URL
      const blob = new Blob([response.data], { type: "image/png" });
      const imageUrl = URL.createObjectURL(blob);

      return { success: true, imageUrl };
    } catch (error) {
      console.error("Get QR error:", error);
      return {
        success: false,
        error: handleApiError(error),
      };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const downloadQRCode = useCallback(
    async (dataUrl: string, filename: string) => {
      try {
        const link = document.createElement("a");
        link.href = dataUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (error) {
        console.error("Download QR error:", error);
        throw new Error("Failed to download QR code");
      }
    },
    []
  );

  return {
    isLoading,
    generateQRCode,
    getRegistrationQR,
    downloadQRCode,
  };
}
