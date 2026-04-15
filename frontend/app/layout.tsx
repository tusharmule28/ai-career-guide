import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import Navbar from "@/components/Navbar";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "CareerGuide AI | Intelligent Job Matching",
  description: "Upload your resume and get matched with relevant roles instantly using AI.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased dark">
      <body className="min-h-full flex flex-col bg-background text-text">
        <AuthProvider>
          <Navbar />
          <main className="flex-1">
            {children}
          </main>
          <Toaster 
            position="bottom-right"
            toastOptions={{
              style: {
                background: '#1E293B',
                color: '#F8FAFC',
                border: '1px solid rgba(51, 65, 85, 0.5)',
                borderRadius: '1rem',
                fontSize: '0.875rem',
                fontWeight: 'bold',
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
