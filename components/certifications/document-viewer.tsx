"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Download, Printer, FileText, Image as ImageIcon } from "lucide-react";

interface DocumentViewerProps {
  documentUrl: string;
  fileName?: string;
}

export function DocumentViewer({
  documentUrl,
  fileName = "certification",
}: DocumentViewerProps) {
  const [signedUrl, setSignedUrl] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [isPdf, setIsPdf] = useState(false);
  const [isImage, setIsImage] = useState(false);

  useEffect(() => {
    const fetchSignedUrl = async () => {
      try {
        // Check if URL is already signed or is a direct S3 URL
        if (documentUrl.startsWith("http")) {
          // For now, use the URL directly (in production, you'd get a signed URL)
          setSignedUrl(documentUrl);
          setIsPdf(documentUrl.toLowerCase().endsWith(".pdf"));
          setIsImage(/\.(jpg|jpeg|png|gif)$/i.test(documentUrl.toLowerCase()));
        } else {
          // Get signed URL from API
          const response = await fetch(
            `/api/certifications/document?url=${encodeURIComponent(documentUrl)}`
          );
          if (response.ok) {
            const data = await response.json();
            setSignedUrl(data.signedUrl);
            setIsPdf(data.isPdf || false);
            setIsImage(data.isImage || false);
          }
        }
      } catch (error) {
        console.error("Error fetching signed URL:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSignedUrl();
  }, [documentUrl]);

  const handleDownload = () => {
    if (signedUrl) {
      const link = document.createElement("a");
      link.href = signedUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handlePrint = () => {
    if (signedUrl) {
      const printWindow = window.open(signedUrl, "_blank");
      if (printWindow) {
        printWindow.onload = () => {
          printWindow.print();
        };
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center rounded-lg border border-gray-200 bg-gray-50">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-gray-300 border-t-primary-navy" />
          <p className="mt-4 text-sm text-gray-600">Loading document...</p>
        </div>
      </div>
    );
  }

  if (!signedUrl) {
    return (
      <div className="flex min-h-[400px] items-center justify-center rounded-lg border border-gray-200 bg-gray-50">
        <div className="text-center">
          <FileText className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-4 text-sm text-gray-600">Unable to load document</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-3">
        <button
          onClick={handleDownload}
          className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          <Download className="h-4 w-4" />
          Download
        </button>
        <button
          onClick={handlePrint}
          className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          <Printer className="h-4 w-4" />
          Print
        </button>
      </div>

      {/* Document Display */}
      <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
        {isPdf ? (
          <iframe
            src={signedUrl}
            className="h-[800px] w-full"
            title="Certification Document"
          />
        ) : isImage ? (
          <div className="relative flex items-center justify-center bg-gray-50 p-8 min-h-[400px]">
            <Image
              src={signedUrl}
              alt="Certification Document"
              width={1200}
              height={1600}
              className="max-h-[800px] max-w-full object-contain"
              loading="lazy"
              quality={85}
              unoptimized={
                signedUrl.startsWith("https://") && signedUrl.includes("s3")
              }
            />
          </div>
        ) : (
          <div className="flex min-h-[400px] items-center justify-center">
            <div className="text-center">
              <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-4 text-sm text-gray-600">
                Preview not available. Please download to view.
              </p>
              <button
                onClick={handleDownload}
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary-navy px-4 py-2 text-sm font-medium text-white hover:bg-primary-navy/90"
              >
                <Download className="h-4 w-4" />
                Download Document
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
