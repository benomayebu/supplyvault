import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

export const metadata: Metadata = {
  title: "SupplyVault - Supplier Compliance Management",
  description:
    "Manage your supplier certifications, track expiry dates, and ensure compliance with SupplyVault.",
  keywords: [
    "supplier management",
    "certifications",
    "compliance",
    "supply chain",
  ],
  authors: [{ name: "SupplyVault" }],
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "32x32", type: "image/x-icon" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
  },
  openGraph: {
    title: "SupplyVault - Supplier Compliance Management",
    description:
      "Manage your supplier certifications, track expiry dates, and ensure compliance.",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: "#0A2463", // Navy
          colorText: "#0A2463",
          colorTextSecondary: "#666666",
          colorBackground: "#FFFFFF",
          colorInputBackground: "#F5F5F5",
          colorInputText: "#0A2463",
          borderRadius: "0.5rem",
        },
        elements: {
          formButtonPrimary: "bg-[#0A2463] hover:bg-[#0A2463]/90 text-white",
          card: "shadow-lg",
          headerTitle: "text-[#0A2463] font-semibold",
          headerSubtitle: "text-gray-600",
          socialButtonsBlockButton: "border border-gray-300 hover:bg-[#F5F5F5]",
          socialButtonsBlockButtonText: "text-[#0A2463] font-medium",
          formFieldLabel: "text-[#0A2463] font-medium",
          formFieldInput:
            "border-gray-300 focus:border-[#3BCEAC] focus:ring-[#3BCEAC]",
          footerActionLink: "text-[#3BCEAC] hover:text-[#3BCEAC]/80",
        },
      }}
    >
      <html lang="en">
        <body className="font-sans antialiased">{children}</body>
      </html>
    </ClerkProvider>
  );
}
