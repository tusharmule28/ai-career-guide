import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import Navbar from "@/components/Navbar";
import BottomNav from "@/components/BottomNav";
import ServiceWorkerRegistration from "@/components/ServiceWorkerRegistration";
import InstallPrompt from "@/components/InstallPrompt";
import FirebaseTokenManager from "@/components/FirebaseTokenManager";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "CareerGuide AI | Intelligent Job Matching",
  description:
    "Upload your resume and get matched with relevant roles instantly using AI.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "CareerGuide AI",
  },
  formatDetection: { telephone: false },
  openGraph: {
    type: "website",
    title: "CareerGuide AI",
    description: "AI-powered job matching — find your next role faster.",
    siteName: "CareerGuide AI",
  },
};

export const viewport: Viewport = {
  themeColor: "#6366F1",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased dark">
      <head>
        {/* Google Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Poppins:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        {/* iOS PWA splash / icon meta */}
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/icons/icon-152x152.png" />
        <link rel="apple-touch-icon" sizes="144x144" href="/icons/icon-144x144.png" />
        <link rel="apple-touch-icon" sizes="128x128" href="/icons/icon-128x128.png" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="CareerGuide AI" />
        <meta name="msapplication-TileColor" content="#6366F1" />
        <meta name="msapplication-TileImage" content="/icons/icon-144x144.png" />
      </head>
      <body className="min-h-full flex flex-col bg-background text-text">
        <AuthProvider>
          <FirebaseTokenManager />
          <ServiceWorkerRegistration />
          <Navbar />
          <main className="flex-1 pb-20 md:pb-0">
            {children}
          </main>
          <BottomNav />
          <InstallPrompt />
          <Toaster
            position="bottom-center"
            gutter={12}
            toastOptions={{
              duration: 3500,
              style: {
                background: "#1E293B",
                color: "#F8FAFC",
                border: "1px solid rgba(51,65,85,0.5)",
                borderRadius: "1rem",
                fontSize: "0.875rem",
                fontWeight: "bold",
                maxWidth: "340px",
                marginBottom: "env(safe-area-inset-bottom, 80px)",
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
