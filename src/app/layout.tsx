"use client";

import { useEffect, useState } from "react";
// Remove unused fonts if not needed, or keep them if you want to use them
import { Geist, Geist_Mono, Be_Vietnam_Pro } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/layout/Sidebar";
import { BottomNav } from "@/components/layout/BottomNav";
import { Toaster } from "@/components/ui/sonner";
import { useFinanceStore } from "@/lib/store";
import { useRouter, usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

// Fonts definition
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const beVietnamPro = Be_Vietnam_Pro({
  variable: "--font-heading",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { fetchInitialData } = useFinanceStore();
  const router = useRouter();
  const pathname = usePathname();
  const [isAuth, setIsAuth] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setIsAuth(true);
        fetchInitialData();
        if (pathname === "/login") router.push("/");
      } else {
        setIsAuth(false);
        if (pathname !== "/login") router.push("/login"); // Protect routes
      }
      setLoading(false);
    };

    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setIsAuth(true);
        fetchInitialData();
        if (pathname === "/login") router.push("/");
      } else {
        setIsAuth(false);
        if (pathname !== "/login") router.push("/login");
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchInitialData, router, pathname]);

  // Render Login Page separate from Main Layout
  if (pathname === "/login") {
    return (
      <html lang="vi" className="dark">
        <body className={`${geistSans.variable} ${geistMono.variable} ${beVietnamPro.variable} antialiased bg-[#0B0E23] text-white`}>
          {children}
          <Toaster position="top-center" />
        </body>
      </html>
    );
  }

  // Loading State (optional but good for UX)
  if (loading) {
    return (
      <html lang="vi" className="dark">
        <body className="flex items-center justify-center min-h-screen bg-[#0B0E23] text-white">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cyan-500"></div>
        </body>
      </html>
    );
  }

  return (
    <html lang="vi" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${beVietnamPro.variable} antialiased bg-[#0B0E23] text-white font-sans`}
      >
        <div className="flex h-screen overflow-hidden">
          {/* Sidebar - Desktop only */}
          <div className="hidden lg:block w-72 shrink-0 border-r border-white/10 bg-[#0F1635]">
            <Sidebar />
          </div>

          {/* Main Content */}
          <main className="flex-1 overflow-y-auto relative no-scrollbar">
            {/* Background Effects */}
            <div className="fixed inset-0 pointer-events-none z-0">
              <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px]" />
              <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[100px]" />
            </div>

            <div className="relative z-10 p-5 lg:p-8 pb-32 lg:pb-8 max-w-[1600px] mx-auto">
              {children}
            </div>
          </main>

          {/* Bottom Nav - Mobile/Tablet only */}
          <div className="lg:hidden fixed bottom-6 left-4 right-4 z-50">
            <BottomNav />
          </div>
        </div>
        <Toaster position="top-center" />
      </body>
    </html>
  );
}
